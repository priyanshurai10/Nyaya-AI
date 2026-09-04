import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PARQUET_DATA_DIR = DATA_DIR / "parquet"

# Ensure directories exist
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
PARQUET_DATA_DIR.mkdir(parents=True, exist_ok=True)

class CloudConfig:
    # Storage Mode: 'LOCAL_MOCK', 'AWS_S3', 'SUPABASE', 'GCP_GCS'
    STORAGE_MODE = os.getenv("STORAGE_MODE", "LOCAL_MOCK")
    
    # AWS S3 Settings
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "global-analytics-lakehouse-prod")
    
    # Supabase Settings
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
    SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "analytics-lake")
    
    # DuckDB Cloud Settings
    DUCKDB_MEMORY_LIMIT = os.getenv("DUCKDB_MEMORY_LIMIT", "4GB")
    DUCKDB_THREADS = int(os.getenv("DUCKDB_THREADS", "4"))

# International Country Benchmarks (Top Economies & Trading Hubs)
COUNTRY_METADATA = {
    "USA": {"name": "United States", "region": "North America", "lat": 37.0902, "lon": -95.7129, "gdp_trillion": 26.9, "iso3": "USA"},
    "CHN": {"name": "China", "region": "Asia-Pacific", "lat": 35.8617, "lon": 104.1954, "gdp_trillion": 17.7, "iso3": "CHN"},
    "DEU": {"name": "Germany", "region": "Europe", "lat": 51.1657, "lon": 10.4515, "gdp_trillion": 4.4, "iso3": "DEU"},
    "JPN": {"name": "Japan", "region": "Asia-Pacific", "lat": 36.2048, "lon": 138.2529, "gdp_trillion": 4.2, "iso3": "JPN"},
    "IND": {"name": "India", "region": "Asia-Pacific", "lat": 20.5937, "lon": 78.9629, "gdp_trillion": 3.7, "iso3": "IND"},
    "GBR": {"name": "United Kingdom", "region": "Europe", "lat": 55.3781, "lon": -3.4360, "gdp_trillion": 3.3, "iso3": "GBR"},
    "FRA": {"name": "France", "region": "Europe", "lat": 46.2276, "lon": 2.2137, "gdp_trillion": 3.0, "iso3": "FRA"},
    "BRA": {"name": "Brazil", "region": "South America", "lat": -14.2350, "lon": -51.9253, "gdp_trillion": 2.1, "iso3": "BRA"},
    "ARE": {"name": "United Arab Emirates", "region": "Middle East", "lat": 23.4241, "lon": 53.8478, "gdp_trillion": 0.5, "iso3": "ARE"},
    "SGP": {"name": "Singapore", "region": "Asia-Pacific", "lat": 1.3521, "lon": 103.8198, "gdp_trillion": 0.5, "iso3": "SGP"}
}

INDICATORS = {
    "GDP_GROWTH": "GDP Annual Growth Rate (%)",
    "INFLATION_RATE": "Consumer Price Index Inflation (%)",
    "TRADE_BALANCE_BUSD": "Net Trade Balance (Billion USD)",
    "ENERGY_PRICE_INDEX": "Global Energy Commodity Index",
    "ESG_RISK_SCORE": "National ESG Vulnerability Risk (0-100)",
    "SUPPLY_CHAIN_PRESSURE": "Global Supply Chain Stress Index (0-10)"
}
