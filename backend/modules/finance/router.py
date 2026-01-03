from fastapi import APIRouter
from .api.endpoints import tax, reconciliation, tax_analysis

router = APIRouter()

router.include_router(tax.router, prefix="/tax", tags=["Finance-Tax"])
router.include_router(reconciliation.router, prefix="/reconciliation", tags=["Finance-Reconciliation"])
router.include_router(tax_analysis.router, prefix="/tax-analysis", tags=["Finance-Tax-Analysis"])
