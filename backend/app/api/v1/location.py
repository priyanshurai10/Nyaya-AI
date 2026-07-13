"""
Location Router — Nationwide India PIN Code Search
===================================================
Provides POST /location/search-pincode which looks up any valid Indian PIN code
against the locally-seeded LocationPincode table (GeoNames IN.txt dataset).

This is a fully offline, demo-free service. No DemoCity logic exists here.
"""
import re
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import LocationPincode

router = APIRouter()
logger = logging.getLogger("location")


# ─── Request / Response Schemas ─────────────────────────────────────────────

class PincodeSearchRequest(BaseModel):
    pincode: str = Field(..., description="6-digit Indian PIN code")

    @validator("pincode")
    def validate_pincode(cls, v: str) -> str:
        clean = re.sub(r"\D", "", v.strip())
        if len(clean) != 6:
            raise ValueError("Please enter a valid 6-digit Indian PIN Code.")
        return clean


class LocationData(BaseModel):
    pincode: str
    office_name: Optional[str] = None
    village: Optional[str] = None
    town: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PincodeSearchResponse(BaseModel):
    success: bool
    location: Optional[LocationData] = None
    data: Optional[LocationData] = None
    error: Optional[str] = None
    count: Optional[int] = None  # how many post offices share this PIN


# ─── Helper ─────────────────────────────────────────────────────────────────

def _row_to_location(row: LocationPincode) -> LocationData:
    return LocationData(
        pincode=row.pincode,
        office_name=row.office_name,
        village=row.village,
        town=row.town,
        city=row.city or row.town or row.district or "",
        district=row.district or "",
        state=row.state or "",
        latitude=row.latitude,
        longitude=row.longitude,
    )


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/search-pincode", response_model=PincodeSearchResponse)
def search_pincode(payload: PincodeSearchRequest, db: Session = Depends(get_db)):
    """
    Look up any valid Indian PIN code from the nationwide offline database.

    Returns city, district, state, and coordinates.
    Never mentions Demo City or demo coverage.
    """
    pin = payload.pincode  # already validated and cleaned by pydantic

    # Query all records for this pincode
    rows = (
        db.query(LocationPincode)
        .filter(LocationPincode.pincode == pin)
        .all()
    )

    if not rows:
        logger.info(f"PIN {pin} not found in location_pincodes table")
        return PincodeSearchResponse(
            success=False,
            error="This PIN Code was not found."
        )

    # Prefer a record with latitude/longitude
    best = None
    for row in rows:
        if row.latitude and row.longitude:
            best = row
            break
    if not best:
        best = rows[0]

    # Derive the most useful city name: prefer non-empty fields in order
    city = best.city or best.town or best.district or best.office_name or ""

    location = LocationData(
        pincode=best.pincode,
        office_name=best.office_name,
        village=best.village,
        town=best.town,
        city=city,
        district=best.district or "",
        state=best.state or "",
        latitude=best.latitude,
        longitude=best.longitude,
    )

    logger.info(f"PIN {pin} resolved → {city}, {best.district}, {best.state}")

    return PincodeSearchResponse(
        success=True,
        location=location,
        data=location,
        count=len(rows)
    )


@router.get("/pincode/{pincode}", response_model=PincodeSearchResponse)
def get_pincode(pincode: str, db: Session = Depends(get_db)):
    """
    GET variant of pincode lookup (for convenience / debugging).
    """
    clean = re.sub(r"\D", "", pincode.strip())
    if len(clean) != 6:
        raise HTTPException(status_code=400, detail="Please enter a valid 6-digit Indian PIN Code.")

    rows = db.query(LocationPincode).filter(LocationPincode.pincode == clean).all()
    if not rows:
        return PincodeSearchResponse(success=False, error="This PIN Code was not found.")

    best = next((r for r in rows if r.latitude and r.longitude), rows[0])
    city = best.city or best.town or best.district or best.office_name or ""

    loc_data = LocationData(
        pincode=best.pincode,
        office_name=best.office_name,
        village=best.village,
        town=best.town,
        city=city,
        district=best.district or "",
        state=best.state or "",
        latitude=best.latitude,
        longitude=best.longitude,
    )
    return PincodeSearchResponse(
        success=True,
        location=loc_data,
        data=loc_data,
        count=len(rows)
    )


@router.get("/health")
def location_health(db: Session = Depends(get_db)):
    """Returns count of loaded pincodes to verify data seeding."""
    count = db.query(func.count(LocationPincode.id)).scalar()
    return {
        "status": "ok",
        "pincode_records": count,
        "seeded": count > 0
    }
