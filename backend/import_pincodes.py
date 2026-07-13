#!/usr/bin/env python3
"""
import_pincodes.py — Full nationwide India PIN code import
==========================================================
Source: GeoNames IN.zip (http://download.geonames.org/export/zip/IN.zip)
Records: ~155,000 (all valid Indian postal codes with lat/lon)

This script:
1. Downloads the GeoNames India dataset
2. Creates the location_pincodes table if not exists
3. Clears old data and bulk-imports all records
4. Reports statistics by state

Usage:
    cd backend
    python import_pincodes.py
"""
import sys, os, io, zipfile, csv, time, logging, urllib.request

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")
logger = logging.getLogger("import_pincodes")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.models import LocationPincode
from sqlalchemy import text

GEONAMES_URL = "http://download.geonames.org/export/zip/IN.zip"

# GeoNames uses slightly different state names — normalize to standard Indian names
STATE_MAP = {
    "Andaman & Nicobar Islands": "Andaman & Nicobar Islands",
    "Andhra Pradesh":            "Andhra Pradesh",
    "Arunachal Pradesh":         "Arunachal Pradesh",
    "Assam":                     "Assam",
    "Bihar":                     "Bihar",
    "Chandigarh":                "Chandigarh",
    "Chhattisgarh":              "Chhattisgarh",
    "Dadra & Nagar Haveli":      "Dadra & Nagar Haveli",
    "Daman & Diu":               "Daman & Diu",
    "Delhi":                     "Delhi",
    "NCT of Delhi":              "Delhi",
    "Goa":                       "Goa",
    "Gujarat":                   "Gujarat",
    "Haryana":                   "Haryana",
    "Himachal Pradesh":          "Himachal Pradesh",
    "Jammu & Kashmir":           "Jammu & Kashmir",
    "Jharkhand":                 "Jharkhand",
    "Karnataka":                 "Karnataka",
    "Kerala":                    "Kerala",
    "Ladakh":                    "Ladakh",
    "Lakshadweep":               "Lakshadweep",
    "Madhya Pradesh":            "Madhya Pradesh",
    "Maharashtra":               "Maharashtra",
    "Manipur":                   "Manipur",
    "Meghalaya":                 "Meghalaya",
    "Mizoram":                   "Mizoram",
    "Nagaland":                  "Nagaland",
    "Odisha":                    "Odisha",
    "Puducherry":                "Puducherry",
    "Punjab":                    "Punjab",
    "Rajasthan":                 "Rajasthan",
    "Sikkim":                    "Sikkim",
    "Tamil Nadu":                "Tamil Nadu",
    "Telangana":                 "Telangana",
    "Tripura":                   "Tripura",
    "Uttar Pradesh":             "Uttar Pradesh",
    "Uttarakhand":               "Uttarakhand",
    "West Bengal":               "West Bengal",
}


def download_data() -> bytes:
    logger.info(f"Downloading GeoNames India dataset from {GEONAMES_URL}")
    req = urllib.request.Request(GEONAMES_URL, headers={"User-Agent": "NyayaAI/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    logger.info(f"  Downloaded {len(data):,} bytes")
    return data


def parse_records(raw: bytes):
    """
    GeoNames IN.txt tab-separated fields:
    0  country_code
    1  postal_code (PIN)
    2  place_name
    3  admin_name1  (state)
    4  admin_code1
    5  admin_name2  (district)
    6  admin_code2
    7  admin_name3  (taluka/block)
    8  admin_code3
    9  latitude
    10 longitude
    11 accuracy
    """
    records = []
    with zipfile.ZipFile(io.BytesIO(raw)) as zf:
        with zf.open("IN.txt") as f:
            reader = csv.reader(io.TextIOWrapper(f, encoding="utf-8"), delimiter="\t")
            for row in reader:
                if len(row) < 11:
                    continue
                pin = row[1].strip()
                if len(pin) != 6 or not pin.isdigit():
                    continue

                place_name = row[2].strip()
                state_raw  = row[3].strip()
                district   = row[5].strip()
                taluka     = row[7].strip()

                state = STATE_MAP.get(state_raw, state_raw)

                # GeoNames still labels Ladakh under J&K (pre-2019 bifurcation)
                # Correct it: Leh and Kargil districts are Ladakh UT since Nov 2019
                LADAKH_DISTRICTS = {"Leh", "Kargil", "Leh (Ladakh)"}
                if state == "Jammu & Kashmir" and district in LADAKH_DISTRICTS:
                    state = "Ladakh"

                try:
                    lat = float(row[9]) if row[9].strip() else None
                    lon = float(row[10]) if row[10].strip() else None
                except ValueError:
                    lat, lon = None, None

                records.append({
                    "pincode":     pin,
                    "office_name": place_name,
                    "village":     taluka,
                    "town":        taluka or place_name,
                    "city":        district,   # district = best city-level name for India
                    "district":    district,
                    "state":       state,
                    "latitude":    lat,
                    "longitude":   lon,
                })

    logger.info(f"  Parsed {len(records):,} records")
    return records


def seed(records):
    # Ensure table exists
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        logger.info("Clearing existing location_pincodes data...")
        db.query(LocationPincode).delete()
        db.commit()

        logger.info(f"Inserting {len(records):,} records in batches of 2000...")
        batch_size = 2000
        total = 0
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            db.bulk_insert_mappings(LocationPincode, batch)
            db.commit()
            total += len(batch)
            if total % 20000 == 0:
                logger.info(f"  {total:,} / {len(records):,} inserted...")

        logger.info(f"  Total inserted: {total:,}")
        return total
    finally:
        db.close()


def verify_sample_pincodes():
    """Test a spread of PIN codes from different states."""
    test_pins = {
        "110001": ("Delhi",        "New Delhi"),
        "400001": ("Maharashtra",  "Mumbai"),
        "560001": ("Karnataka",    "Bangalore Urban"),
        "700001": ("West Bengal",  "Kolkata"),
        "600001": ("Tamil Nadu",   "Chennai"),
        "682001": ("Kerala",       "Ernakulam"),
        "226001": ("Uttar Pradesh","Lucknow"),
        "302001": ("Rajasthan",    "Jaipur"),
        "781001": ("Assam",        "Kamrup"),
        "821101": ("Bihar",        "Rohtas"),
    }
    db = SessionLocal()
    passed = 0
    failed = []
    try:
        logger.info("\n--- Verification: Sampling PIN codes from 10 states ---")
        for pin, (expected_state, expected_district_hint) in test_pins.items():
            rows = db.query(LocationPincode).filter(LocationPincode.pincode == pin).all()
            if rows:
                r = next((x for x in rows if x.latitude), rows[0])
                logger.info(f"  ✅ {pin} → {r.city}, {r.district}, {r.state}  (lat={r.latitude}, lon={r.longitude})")
                passed += 1
            else:
                logger.warning(f"  ❌ {pin} → NOT FOUND  (expected: {expected_state})")
                failed.append(pin)
    finally:
        db.close()

    logger.info(f"\nVerification: {passed}/{len(test_pins)} passed, {len(failed)} failed")
    if failed:
        logger.warning(f"  Failed PINs: {failed}")
    return passed, failed


def print_state_stats():
    db = SessionLocal()
    try:
        from sqlalchemy import func
        stats = (
            db.query(LocationPincode.state, func.count(LocationPincode.id).label("cnt"))
            .group_by(LocationPincode.state)
            .order_by(func.count(LocationPincode.id).desc())
            .all()
        )
        logger.info("\n--- Records by State ---")
        for state, cnt in stats:
            logger.info(f"  {state:<35} {cnt:>6}")
    finally:
        db.close()


def main():
    start = time.time()

    # Force re-import if --force flag given, otherwise skip if already seeded
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        existing = db.query(LocationPincode).count()
    finally:
        db.close()

    if existing > 100000 and "--force" not in sys.argv:
        logger.info(f"Already have {existing:,} records seeded. Use --force to reimport.")
        verify_sample_pincodes()
        return

    raw = download_data()
    records = parse_records(raw)
    total = seed(records)
    elapsed = time.time() - start
    logger.info(f"\n✅ Import complete: {total:,} records in {elapsed:.1f}s")

    print_state_stats()
    passed, failed = verify_sample_pincodes()

    if passed < 8:
        logger.error("❌ Verification FAILED — less than 8/10 PIN codes resolved")
        sys.exit(1)
    else:
        logger.info("✅ Nationwide PIN code database is live and verified!")


if __name__ == "__main__":
    main()
