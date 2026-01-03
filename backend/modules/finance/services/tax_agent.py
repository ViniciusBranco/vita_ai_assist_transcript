import os
import uuid
import time
import asyncio
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from core.ai_gateway import GeminiService
from core.config import settings
from models.finance import Transaction, TaxAnalysis

class TaxExpertAgent:
    """
    TaxExpertAgent refactored to use GeminiService.generate_structured_content (SYNC wrapper).
    Auditor fiscal especialista em Carnê-Leão/IRPF.
    """
    def __init__(self):
        self.ai = GeminiService(api_key=settings.GOOGLE_API_KEY)

    def analyze_transaction(self, db: Session, transaction: Transaction) -> Optional[TaxAnalysis]:
        """
        Analyzes a single transaction.
        Sync wrapper around async AI call.
        """
        # Skip if already has manual override
        if transaction.tax_analysis and transaction.tax_analysis.is_manual_override:
            return transaction.tax_analysis

        # Prepare context
        transaction_data = {
            "amount": float(transaction.amount),
            "date": str(transaction.date),
            "description": transaction.merchant_name,
            "category_hint": transaction.category
        }
        
        receipt_content = ""
        if transaction.receipt:
            receipt_content = transaction.receipt.raw_text or f"Documento: {transaction.receipt.original_filename}"

        # Call AI (Async to Sync)
        # Using loop.run_until_complete is tricky in FastAPI, but here we are in a singleton agent.
        # Ideally we'd keep the service async, but the requirement said "CONVERT TO SYNC" for repositories/services.
        # I'll provide a sync interface using a helper.
        
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        ai_response = loop.run_until_complete(
            self.ai.classify_tax_document(transaction_data, receipt_content)
        )

        content = ai_response.content
        usage = ai_response.usage

        # Persist Analysis
        analysis = transaction.tax_analysis
        if not analysis:
            analysis = TaxAnalysis(
                transaction_id=transaction.id,
                tenant_id=transaction.tenant_id
            )
            db.add(analysis)

        analysis.classification = content.get("classification", "Não Dedutível")
        analysis.category = f"{content.get('category_code', '')} {content.get('category_name', '')}".strip()
        analysis.justification_text = content.get("justification")
        analysis.legal_citation = content.get("legal_citation")
        analysis.risk_level = content.get("risk_level", "Baixo")
        analysis.raw_analysis = content
        
        # PERSIST TELEMETRY
        analysis.prompt_tokens = usage.prompt_tokens
        analysis.candidate_tokens = usage.candidate_tokens
        analysis.total_tokens = usage.total_tokens
        
        # Estimated Cost (approximate)
        # Gemini 1.5 Flash: $0.075 / 1M tokens input, $0.30 / 1M tokens output
        cost = (usage.prompt_tokens / 1_000_000 * 0.075) + (usage.candidate_tokens / 1_000_000 * 0.3)
        analysis.estimated_cost = cost
        analysis.estimated_cost_brl = cost * settings.USD_BRL_RATE
        analysis.model_version = self.ai.model_name
        analysis.updated_at = datetime.utcnow()

        db.flush()
        return analysis

    def run_batch_analysis(self, db: Session, tenant_id: uuid.UUID):
        """
        Runs batch analysis with 13-second throttle.
        """
        from sqlalchemy import and_
        from datetime import datetime
        
        # Transactions with receipt but no analysis
        pending = db.query(Transaction).filter(
            and_(
                Transaction.tenant_id == tenant_id,
                Transaction.receipt_id != None,
                Transaction.is_finalized == False
            )
        ).outerjoin(TaxAnalysis).filter(TaxAnalysis.id == None).all()

        results = []
        for i, txn in enumerate(pending):
            if i > 0:
                print(f"Throttling: Sleeping 13s...")
                time.sleep(13) # THROTTLE
            
            try:
                analysis = self.analyze_transaction(db, txn)
                db.commit() # Commit each one in batch to save progress
                results.append(analysis)
            except Exception as e:
                print(f"Error analyzing transaction {txn.id}: {e}")
                db.rollback()
        
        return results

from datetime import datetime
tax_agent = TaxExpertAgent()
