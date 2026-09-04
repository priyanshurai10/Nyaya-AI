import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

import streamlit as st
import pandas as pd

from src.cloud.storage_manager import CloudStorageManager
from src.utils.report_generator import ExecutiveReportGenerator

st.set_page_config(page_title="Cloud Lakehouse SQL | GAE", page_icon="⚡", layout="wide")

storage = CloudStorageManager()

st.title("⚡ Cloud Data Lakehouse SQL Explorer")
st.caption("High-Performance DuckDB In-Memory & Parquet Columnar SQL Engine")

st.markdown("""
> [!NOTE]
> Available Lakehouse Parquet Tables: `macroeconomic_indicators`, `bilateral_trade_flows`, `global_commodities`
""")

default_query = """SELECT 
    country_name, 
    region, 
    AVG(gdp_growth_pct) AS avg_gdp_growth, 
    AVG(inflation_pct) AS avg_inflation,
    MAX(supply_chain_stress) AS max_supply_stress
FROM macroeconomic_indicators
WHERE year >= 2023
GROUP BY country_name, region
ORDER BY avg_gdp_growth DESC;"""

query_input = st.text_area("DuckDB SQL Query Console", value=default_query, height=180)

if st.button("▶️ Execute SQL Query", type="primary"):
    try:
        with st.spinner("Executing query over columnar Parquet files via DuckDB..."):
            res_df = storage.query_sql(query_input)
            
        st.success(f"Query returned {len(res_df)} rows.")
        st.dataframe(res_df, use_container_width=True)
        
        csv_data = ExecutiveReportGenerator.export_csv(res_df)
        st.download_button(
            label="💾 Export Result as CSV",
            data=csv_data,
            file_name="lakehouse_query_result.csv",
            mime="text/csv"
        )
    except Exception as e:
        st.error(f"SQL Execution Error: {e}")
