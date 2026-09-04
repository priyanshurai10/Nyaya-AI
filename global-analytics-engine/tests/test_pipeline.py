import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

import pytest
import pandas as pd
from src.pipeline.etl_pipeline import GlobalETLPipeline
from src.cloud.storage_manager import CloudStorageManager
from src.analytics.ml_models import GlobalMLAnalytics

def test_etl_pipeline_execution():
    pipeline = GlobalETLPipeline()
    results = pipeline.run_pipeline()
    assert "macroeconomic_indicators" in results
    assert Path(results["macroeconomic_indicators"]).exists()

def test_cloud_storage_manager():
    storage = CloudStorageManager()
    df = storage.load_parquet("macroeconomic_indicators")
    assert not df.empty
    assert "gdp_growth_pct" in df.columns

def test_duckdb_sql_query():
    storage = CloudStorageManager()
    df = storage.query_sql("SELECT COUNT(*) AS total_records FROM macroeconomic_indicators")
    assert not df.empty
    assert df["total_records"].iloc[0] > 0

def test_ml_forecasting():
    storage = CloudStorageManager()
    df = storage.load_parquet("macroeconomic_indicators")
    sub_df = df[df["iso3"] == "USA"]
    fc = GlobalMLAnalytics.forecast_timeseries(sub_df, "date", "gdp_growth_pct", horizon_months=6)
    assert len(fc) == 6
    assert "forecast" in fc.columns
