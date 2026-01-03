import uuid
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status, Header
from sqlalchemy.orm import Session
from database import get_db
from models.finance import Transaction, TaxAnalysis
from modules.finance.services.tax_agent import tax_agent
from modules.finance.schemas.tax import TaxAnalysisResponse, TaxAnalysisUpdate

router = APIRouter()

def get_tenant_id(x_tenant_id: str = Header(...)) -> uuid.UUID:
    try:
        return uuid.UUID(x_tenant_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid X-Tenant-ID header")

@router.post("/tax-analysis/{transaction_id}", response_model=TaxAnalysisResponse)
def analyze_transaction(
    transaction_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    txn = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.tenant_id == tenant_id
    ).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    analysis = tax_agent.analyze_transaction(db, txn)
    db.commit()
    return analysis

@router.post("/tax-analysis/batch")
def batch_analyze(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Triggers batch analysis with 13s throttle (handled in agent).
    """
    results = tax_agent.run_batch_analysis(db, tenant_id)
    return {"processed": len(results)}

@router.put("/tax-analysis/{transaction_id}", response_model=TaxAnalysisResponse)
def update_analysis(
    transaction_id: uuid.UUID,
    update_data: TaxAnalysisUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    analysis = db.query(TaxAnalysis).filter(
        TaxAnalysis.transaction_id == transaction_id,
        TaxAnalysis.tenant_id == tenant_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    analysis.classification = update_data.classification
    analysis.category = update_data.category
    analysis.justification_text = update_data.justification_text
    analysis.legal_citation = update_data.legal_citation
    analysis.is_manual_override = True
    
    db.commit()
    return analysis
