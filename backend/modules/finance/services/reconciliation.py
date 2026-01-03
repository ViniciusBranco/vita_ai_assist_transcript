import re
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_
from models.finance import Transaction, FinancialDocument

class SoberanaReconciliationEngine:
    """
    Soberana Reconciliation Engine
    Injected Logic: 45-day window, Hierarchical Matching.
    """
    def __init__(self, db: Session):
        self.db = db

    def reconcile_transaction(self, transaction: Transaction) -> Optional[FinancialDocument]:
        # 0. Protection: Already matched or finalized
        if transaction.receipt_id or transaction.is_finalized:
            return transaction.receipt

        # 1. 45-DAY WINDOW: Filter documents within a 45-day gap from transaction date
        # Transaction date is when it cleared the bank.
        # Receipt created_at (or ideally extracted date) should be within +/- 45 days.
        start_date = transaction.date - timedelta(days=45)
        end_date = transaction.date + timedelta(days=45)

        # Optimization: Filter by tenant and date and type=RECEIPT
        candidates = self.db.query(FinancialDocument).filter(
            and_(
                FinancialDocument.tenant_id == transaction.tenant_id,
                FinancialDocument.doc_type == "RECEIPT",
                FinancialDocument.created_at >= start_date,
                FinancialDocument.created_at <= end_date
            )
        ).all()

        if not candidates:
            return None

        # --- HIERARCHICAL MATCHING ---

        # LAYER 1: Exact Value match
        # Convert amount to common string formats for OCR matching
        # e.g., 1234.56 -> "1234,56", "1.234,56", "1234.56"
        amount_val = float(transaction.amount)
        amount_str_comma = f"{amount_val:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        amount_str_dot = f"{amount_val:.2f}"
        
        for doc in candidates:
            text = (doc.raw_text or "").replace(" ", "")
            if amount_str_comma.replace(".", "") in text.replace(".", "").replace(",", ""):
                return self._link(transaction, doc, 1.0, "LAYER_1_EXACT_VALUE")

        # LAYER 2: 6+ digit Numeric Substring match (DARF IDs, CNPJs)
        # Identify numeric markers in transaction description
        txn_identifiers = re.findall(r'\d{6,}', transaction.merchant_name)
        if txn_identifiers:
            for doc in candidates:
                text = doc.raw_text or ""
                for identifier in txn_identifiers:
                    if identifier in text:
                        return self._link(transaction, doc, 0.8, "LAYER_2_NUMERIC_SUBSTRING")

        # LAYER 3: Keyword Intersection
        # focus on high-entropy words: "VIVO", "TIM", "CRM", "ENEL", etc.
        # Deduct common status keywords
        STOPWORDS = {"PAGAMENTO", "DEBITO", "CREDITO", "TRANSF", "PIX", "RECEBIDO", "CONFIRMACAO", "COMPROVANTE"}
        txn_words = {w for w in re.findall(r'[A-Z]{3,}', transaction.merchant_name.upper()) if w not in STOPWORDS}
        
        if txn_words:
            for doc in candidates:
                text_upper = (doc.raw_text or "").upper()
                intersection = [w for w in txn_words if w in text_upper]
                if intersection:
                    # Higher score for more word matches
                    score = 0.5 + (0.1 * len(intersection))
                    return self._link(transaction, doc, min(score, 0.79), "LAYER_3_KEYWORD_INTERSECTION")

        return None

    def _link(self, transaction: Transaction, doc: FinancialDocument, score: float, match_type: str) -> FinancialDocument:
        transaction.receipt_id = doc.id
        transaction.match_score = score
        transaction.match_type = match_type
        return doc

    def run_tenant_reconciliation(self, tenant_id: uuid.UUID) -> dict:
        """
        Run batch reconciliation for a specific tenant.
        """
        # Get unlinked transactions
        transactions = self.db.query(Transaction).filter(
            and_(
                Transaction.tenant_id == tenant_id,
                Transaction.receipt_id == None,
                Transaction.is_finalized == False
            )
        ).all()

        match_count = 0
        for txn in transactions:
            if self.reconcile_transaction(txn):
                match_count += 1
        
        self.db.commit()
        return {
            "tenant_id": str(tenant_id),
            "transactions_processed": len(transactions),
            "matches_found": match_count
        }
