import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

import streamlit as st
import pandas as pd

from config.cloud_config import CloudConfig, PARQUET_DATA_DIR
from src.cloud.storage_manager import CloudStorageManager
from src.pipeline.etl_pipeline import GlobalETLPipeline

# Page Config
st.set_page_config(
    page_title="Global Analytics Engine | International BI",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load CSS
css_path = BASE_DIR / "app" / "styles" / "custom.css"
if css_path.exists():
    with open(css_path) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Ensure ETL pipeline has run
@st.cache_resource
def initialize_data_lake():
    macro_file = PARQUET_DATA_DIR / "macroeconomic_indicators.parquet"
    if not macro_file.exists():
        with st.spinner("Initializing Cloud Data Lake & running ETL pipeline..."):
            pipeline = GlobalETLPipeline()
            pipeline.run_pipeline()

initialize_data_lake()
storage = CloudStorageManager()

# Sidebar Info
with st.sidebar:
    st.image("https://img.icons8.com/isometric/100/globe.png", width=70)
    st.title("Global Analytics Engine")
    st.caption("v2.5.0 Enterprise Cloud Release")
    st.divider()
    st.metric(label="Cloud Storage Mode", value=storage.mode)
    st.metric(label="Data Lake Engine", value="DuckDB + PyArrow")
    st.divider()
    st.info("🌐 International Level Macroeconomic & Risk Intelligence Platform built in Python.")

# Header Banner
st.markdown("""
<div class="main-header">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1 class="main-title">🌍 Global Analytics Engine <span class="badge-cloud">Cloud Native</span></h1>
            <p style="color: #94a3b8; margin-top: 8px; font-size: 1rem;">
                International Economic Intelligence, Bilateral Trade Flows & AI Risk Forecasting Platform
            </p>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Load Data Summary via DuckDB
@st.cache_data
def get_lake_metrics():
    df_macro = storage.load_parquet("macroeconomic_indicators")
    df_trade = storage.load_parquet("bilateral_trade_flows")
    df_comm = storage.load_parquet("global_commodities")
    return len(df_macro), len(df_trade), len(df_comm), df_macro

macro_count, trade_count, comm_count, df_macro = get_lake_metrics()

# Top KPI Summary Cards
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">Data Lake Records</div>
        <div class="kpi-value">{macro_count + trade_count + comm_count:,}</div>
        <div class="kpi-subtitle">⚡ Parquet Columnar Storage</div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    avg_gdp = df_macro["gdp_growth_pct"].mean()
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">Global Avg GDP Growth</div>
        <div class="kpi-value">{avg_gdp:.2f}%</div>
        <div class="kpi-subtitle">📈 10 Key Global Economies</div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    avg_inf = df_macro["inflation_pct"].mean()
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">Global Inflation Index</div>
        <div class="kpi-value">{avg_inf:.2f}%</div>
        <div class="kpi-subtitle">🔍 CPI Inflation Tracking</div>
    </div>
    """, unsafe_allow_html=True)

with col4:
    avg_supply = df_macro["supply_chain_stress"].mean()
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">Supply Stress Index</div>
        <div class="kpi-value">{avg_supply:.1f} / 10</div>
        <div class="kpi-subtitle">⚠️ Geopolitical Risk Factor</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

st.subheader("📌 Platform Navigation")
st.write("Select a specialized module from the sidebar navigation menu on the left:")

col_nav1, col_nav2 = st.columns(2)

with col_nav1:
    st.markdown("""
    - **1. Executive Dashboard**: Macroeconomic KPI comparisons, country rankings, & trend charts.
    - **2. Global GIS Explorer**: Interactive 3D/2D world heatmaps & bilateral trade flow Sankey diagrams.
    - **3. AI Forecast & Anomalies**: Time-series predictive forecasting (Exponential Smoothing) & Isolation Forest shock detection.
    """)

with col_nav2:
    st.markdown("""
    - **4. Scenario Simulator**: Monte Carlo risk stress-testing under geopolitical, tariff, & energy shocks.
    - **5. Cloud Lakehouse Query**: Direct DuckDB SQL query interface over S3/Local Parquet data lake.
    """)

st.success("System Operational. Cloud Engine Ready.")
