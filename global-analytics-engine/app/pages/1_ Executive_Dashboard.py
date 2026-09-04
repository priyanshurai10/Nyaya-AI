import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

from src.cloud.storage_manager import CloudStorageManager
from src.utils.report_generator import ExecutiveReportGenerator

st.set_page_config(page_title="Executive Dashboard | GAE", page_icon="📊", layout="wide")

storage = CloudStorageManager()
df_macro = storage.load_parquet("macroeconomic_indicators")

st.title("📊 Executive Macroeconomic Dashboard")
st.caption("International Economic Indicators & Cross-Country Comparison")

# Filters
col_f1, col_f2 = st.columns(2)
with col_f1:
    selected_countries = st.multiselect(
        "Select Economies to Compare",
        options=sorted(df_macro["country_name"].unique()),
        default=["United States", "China", "Germany", "India"]
    )
with col_f2:
    selected_year = st.slider("Select Assessment Year", min_value=2015, max_value=2026, value=2025)

df_filtered = df_macro[(df_macro["country_name"].isin(selected_countries)) & (df_macro["year"] == selected_year)]

# Line Chart: Monthly GDP Growth & Inflation Trend
st.subheader(f"📈 Macroeconomic Performance ({selected_year})")
tab1, tab2 = st.tabs(["GDP Annual Growth Rate (%)", "Consumer Price Inflation (%)"])

with tab1:
    fig_gdp = px.line(
        df_filtered,
        x="date",
        y="gdp_growth_pct",
        color="country_name",
        markers=True,
        template="plotly_dark",
        title=f"GDP Growth Trends across Selected Economies ({selected_year})"
    )
    fig_gdp.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    st.plotly_chart(fig_gdp, use_container_width=True)

with tab2:
    fig_inf = px.line(
        df_filtered,
        x="date",
        y="inflation_pct",
        color="country_name",
        markers=True,
        template="plotly_dark",
        title=f"Inflation CPI Trends ({selected_year})"
    )
    fig_inf.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    st.plotly_chart(fig_inf, use_container_width=True)

# Scatter Matrix / Risk Profile
st.subheader("⚖️ Trade Balance vs Supply Chain Stress Index")
fig_scatter = px.scatter(
    df_filtered,
    x="trade_balance_busd",
    y="supply_chain_stress",
    size="esg_risk_score",
    color="country_name",
    hover_name="country_name",
    template="plotly_dark",
    labels={"trade_balance_busd": "Net Trade Balance (Billion USD)", "supply_chain_stress": "Supply Stress (0-10)"}
)
fig_scatter.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
st.plotly_chart(fig_scatter, use_container_width=True)

# PDF Briefing Export Button
st.divider()
st.subheader("📥 Export Executive Intelligence Brief")
if st.button("Generate & Download PDF Report"):
    country = selected_countries[0] if selected_countries else "Global Aggregates"
    latest_row = df_filtered[df_filtered["country_name"] == country].iloc[-1] if not df_filtered.empty else df_macro.iloc[-1]
    
    kpis = {
        "GDP Growth Rate": f"{latest_row['gdp_growth_pct']}%",
        "Inflation CPI": f"{latest_row['inflation_pct']}%",
        "Trade Balance": f"${latest_row['trade_balance_busd']} Billion",
        "Supply Stress Index": f"{latest_row['supply_chain_stress']}/10",
        "ESG Risk Score": f"{latest_row['esg_risk_score']}/100"
    }
    
    pdf_bytes = ExecutiveReportGenerator.generate_pdf_report(
        country_name=country,
        kpi_summary=kpis,
        forecast_summary="The macroeconomic outlook indicates stable baseline recovery with localized inflation pressures. Supply chain bottlenecks remain within manageable thresholds."
    )
    
    st.download_button(
        label="📄 Download PDF Briefing Document",
        data=pdf_bytes,
        file_name=f"Executive_Brief_{country}_{selected_year}.pdf",
        mime="application/pdf"
    )
