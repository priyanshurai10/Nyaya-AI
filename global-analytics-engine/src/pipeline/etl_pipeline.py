import numpy as np
import pandas as pd
import polars as pl
from datetime import datetime, timedelta

from config.cloud_config import COUNTRY_METADATA, INDICATORS
from src.cloud.storage_manager import CloudStorageManager

class GlobalETLPipeline:
    """ETL Pipeline for generating and processing high-frequency international datasets."""

    def __init__(self):
        self.storage = CloudStorageManager()

    def run_pipeline(self):
        print("[ETL Pipeline] Starting Data Extraction & Transformation...")
        
        # 1. Macroeconomic Time Series (Monthly 2015 - 2026)
        macro_df = self._generate_macro_timeseries()
        
        # 2. International Bilateral Trade Flows
        trade_df = self._generate_trade_flows()
        
        # 3. Commodity & Energy Benchmark Series
        commodity_df = self._generate_commodity_data()

        # Save to Parquet Data Lakehouse
        p1 = self.storage.save_parquet(macro_df, "macroeconomic_indicators")
        p2 = self.storage.save_parquet(trade_df, "bilateral_trade_flows")
        p3 = self.storage.save_parquet(commodity_df, "global_commodities")

        print("[ETL Pipeline] Processing complete. Lakehouse populated!")
        return {
            "macroeconomic_indicators": p1,
            "bilateral_trade_flows": p2,
            "global_commodities": p3
        }

    def _generate_macro_timeseries(self) -> pd.DataFrame:
        dates = pd.date_range(start="2015-01-01", end="2026-06-01", freq="MS")
        records = []
        
        np.random.seed(42)  # Reproducible analytics
        
        for iso3, meta in COUNTRY_METADATA.items():
            base_gdp = meta["gdp_trillion"]
            
            # Baseline trends with cyclical noise & shock events (2020 COVID shock, 2022 Inflation spike)
            for idx, d in enumerate(dates):
                year = d.year
                
                # Shocks
                covid_shock = -6.5 if year == 2020 and d.month in [3, 4, 5] else 0.0
                inflation_spike = 4.5 if year in [2022, 2023] else 0.0
                
                gdp_growth = round(np.random.normal(loc=2.5 + (0.5 if iso3 in ['IND', 'CHN'] else 0.0), scale=0.8) + covid_shock, 2)
                inflation = round(max(0.5, np.random.normal(loc=2.1 + inflation_spike, scale=1.1)), 2)
                trade_bal = round(np.random.normal(loc=5.0 if iso3 in ['CHN', 'DEU', 'ARE'] else -8.0, scale=3.5), 2)
                energy_idx = round(100.0 + (year - 2015) * 4.2 + (25.0 if year == 2022 else 0.0) + np.random.normal(0, 5), 2)
                esg_risk = round(max(10.0, min(95.0, 45.0 + np.random.normal(0, 4))), 2)
                supply_stress = round(max(1.0, min(10.0, 3.5 + (3.8 if year in [2021, 2022] else 0.0) + np.random.normal(0, 0.5))), 2)
                
                records.append({
                    "date": d.strftime("%Y-%m-%d"),
                    "year": year,
                    "month": d.month,
                    "iso3": iso3,
                    "country_name": meta["name"],
                    "region": meta["region"],
                    "latitude": meta["lat"],
                    "longitude": meta["lon"],
                    "gdp_growth_pct": gdp_growth,
                    "inflation_pct": inflation,
                    "trade_balance_busd": trade_bal,
                    "energy_price_index": energy_idx,
                    "esg_risk_score": esg_risk,
                    "supply_chain_stress": supply_stress
                })
                
        return pd.DataFrame(records)

    def _generate_trade_flows(self) -> pd.DataFrame:
        records = []
        countries = list(COUNTRY_METADATA.keys())
        np.random.seed(101)
        
        for exporter in countries:
            for importer in countries:
                if exporter == importer:
                    continue
                
                # Base volume based on GDP sizes
                exp_gdp = COUNTRY_METADATA[exporter]["gdp_trillion"]
                imp_gdp = COUNTRY_METADATA[importer]["gdp_trillion"]
                
                trade_volume_busd = round((exp_gdp * imp_gdp * np.random.uniform(0.8, 2.5)) / 10.0, 2)
                tariff_pct = round(np.random.uniform(1.2, 8.5), 2)
                top_commodity = np.random.choice(["Semiconductors", "Crude Oil", "Pharmaceuticals", "Automotive Parts", "Agricultural Grains"])
                
                records.append({
                    "exporter_iso3": exporter,
                    "exporter_name": COUNTRY_METADATA[exporter]["name"],
                    "importer_iso3": importer,
                    "importer_name": COUNTRY_METADATA[importer]["name"],
                    "trade_volume_busd": trade_volume_busd,
                    "avg_tariff_pct": tariff_pct,
                    "primary_commodity": top_commodity
                })
                
        return pd.DataFrame(records)

    def _generate_commodity_data(self) -> pd.DataFrame:
        dates = pd.date_range(start="2015-01-01", end="2026-06-01", freq="MS")
        records = []
        np.random.seed(777)
        
        commodities = ["Brent Crude Oil", "Gold Spot", "Copper Futures", "Global Wheat", "Lithium Battery Grade"]
        base_prices = {"Brent Crude Oil": 65.0, "Gold Spot": 1300.0, "Copper Futures": 6000.0, "Global Wheat": 200.0, "Lithium Battery Grade": 15000.0}
        
        for cname in commodities:
            price = base_prices[cname]
            for d in dates:
                change_pct = np.random.normal(loc=0.003, scale=0.04)
                price = max(price * 0.4, price * (1 + change_pct))
                records.append({
                    "date": d.strftime("%Y-%m-%d"),
                    "commodity": cname,
                    "price_usd": round(price, 2),
                    "monthly_volatility_pct": round(abs(change_pct * 100), 2)
                })
                
        return pd.DataFrame(records)

if __name__ == "__main__":
    pipeline = GlobalETLPipeline()
    pipeline.run_pipeline()
