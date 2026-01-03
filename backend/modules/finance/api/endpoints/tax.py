import os
import uuid
import pandas as pd
from typing import List
from datetime import date
from fastapi import APIRouter, HTTPException, Depends, Query, Header
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from models.finance import Transaction, TaxAnalysis, TaxReport, FinancialDocument

router = APIRouter()

EXPORT_DIR = "/app/exports"
os.makedirs(EXPORT_DIR, exist_ok=True)

def get_tenant_id(x_tenant_id: str = Header(...)) -> uuid.UUID:
    try:
        return uuid.UUID(x_tenant_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid X-Tenant-ID header")

@router.get("/quota-status")
def get_quota_status(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    limit = 20
    today = date.today()
    used = db.query(func.count(TaxAnalysis.id)).filter(
        TaxAnalysis.tenant_id == tenant_id,
        func.date(TaxAnalysis.created_at) == today
    ).scalar() or 0
    
    return {
        "used": used,
        "limit": limit,
        "remaining": max(0, limit - used)
    }

@router.get("/reports")
def list_reports(
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    return db.query(TaxReport).filter(TaxReport.tenant_id == tenant_id).order_by(TaxReport.created_at.desc()).all()

@router.get("/reports/{report_id}/download")
def download_report(
    report_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    report = db.query(TaxReport).filter(
        TaxReport.id == report_id,
        TaxReport.tenant_id == tenant_id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    file_path = os.path.join(EXPORT_DIR, report.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file missing")
        
    return FileResponse(file_path, filename=report.filename, media_type="text/csv")

@router.post("/reports/generate")
def generate_tax_report(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    tenant_id: uuid.UUID = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).join(TaxAnalysis).filter(
        Transaction.tenant_id == tenant_id,
        extract('month', Transaction.date) == month,
        extract('year', Transaction.date) == year,
        TaxAnalysis.classification.in_(["Dedutível", "Parcialmente Dedutível"])
    ).all()
    
    if not transactions:
        raise HTTPException(status_code=404, detail="No deductible transactions found")

    data = []
    total_val = 0.0
    for txn in transactions:
        txn.is_finalized = True
        val = abs(float(txn.amount))
        total_val += val
        data.append({
            "data": txn.date.strftime("%d/%m/%Y"),
            "codigo": txn.tax_analysis.category.split(' ')[0] if txn.tax_analysis.category else "P10.01.007",
            "valor": val,
            "descrição": f"{txn.merchant_name} - {txn.tax_analysis.justification_text}"
        })

    df = pd.DataFrame(data)
    file_uuid = f"tax_report_{tenant_id.hex[:4]}_{month:02d}_{year}_{uuid.uuid4().hex[:8]}.csv"
    file_path = os.path.join(EXPORT_DIR, file_uuid)
    df.to_csv(file_path, index=False, encoding='utf-8-sig', sep=';', decimal=',')
    
    new_report = TaxReport(
        tenant_id=tenant_id,
        month=month,
        year=year,
        filename=file_uuid,
        total_deductible=total_val
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report
