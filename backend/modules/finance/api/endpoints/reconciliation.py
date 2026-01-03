import os
import uuid
import hashlib
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends, Header
from sqlalchemy.orm import Session
from database import get_db
from models.finance import FinancialDocument, Transaction, TaxAnalysis
from modules.finance.services.processor import process_document
from modules.finance.services.reconciliation import SoberanaReconciliationEngine
from modules.finance.schemas.document import FinancialDocumentResponse, TransactionResponse
from modules.finance.schemas.match import ManualMatchRequest

router = APIRouter()

UPLOAD_DIR = "/tmp/uploads"

def get_tenant_id(x_tenant_id: str = Header(...)) -> uuid.UUID:
    try:
        return uuid.UUID(x_tenant_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid X-Tenant-ID header")

@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    password: str | None = Form(None),
    expected_type: str | None = Form(None),
    month: int | None = Form(None),
    year: int | None = Form(None),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR, exist_ok=True)

    content = file.file.read()
    file_hash = hashlib.sha256(content).hexdigest()
    
    existing_doc = db.query(FinancialDocument).filter(
        FinancialDocument.file_hash == file_hash,
        FinancialDocument.tenant_id == tenant_id
    ).first()
    
    if existing_doc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Duplicate file. Document already exists with ID: {existing_doc.id}"
        )

    file_ext = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, 'wb') as out_file:
        out_file.write(content)

    result = process_document(
        file_path, 
        tenant_id=tenant_id,
        password=password, 
        file_hash=file_hash, 
        original_filename=file.filename,
        expected_type=expected_type,
        month=month,
        year=year
    )
    
    return result

@router.post("/reconcile")
def reconcile_transactions(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    engine = SoberanaReconciliationEngine(db)
    stats = engine.run_tenant_reconciliation(tenant_id)
    return stats

@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    unlinked_only: bool = False,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.tenant_id == tenant_id)
    if unlinked_only:
        query = query.filter(Transaction.receipt_id == None)
    
    return query.order_by(Transaction.date.desc()).all()

@router.post("/transactions/{transaction_id}/match")
def manual_match(
    transaction_id: uuid.UUID,
    match_request: ManualMatchRequest,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    txn = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.tenant_id == tenant_id
    ).first()
    
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    receipt = db.query(FinancialDocument).filter(
        FinancialDocument.id == match_request.receipt_id,
        FinancialDocument.tenant_id == tenant_id
    ).first()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    txn.receipt_id = receipt.id
    txn.match_score = 1.0
    txn.match_type = "MANUAL"
    db.commit()
    return {"message": "Match successful"}
