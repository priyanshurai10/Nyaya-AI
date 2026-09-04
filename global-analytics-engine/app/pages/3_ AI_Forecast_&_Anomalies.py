import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

from src.cloud.storage_manager import CloudStorageManager
from src.analytics.ml_models import GlobalMLAnalytics

st.set_page_config(page_title="AI Forecast & Anomalies | GAE", page_icon="🤖", layout="wide")

storage = CloudStorageManager()
df_macro = storage.load_parquet("macroeconomic_indicators")
df_comm = storage.load_parquet("global_commodities")

st.title("🤖 AI Predictive Analytics & Anomaly Detection")
st.caption("Exponential Smoothing Forecasts & Isolation Forest Macroeconomic Shock Detection")

tab_fc, tab_anom = st.tabs(["🔮 Time-Series Forecasting Engine", "⚠️ Anomaly & Shock Detection"])

with tab_fc:
    st.subheader("Predictive Horizon Forecasting")
    
    col_fc1, col_fc2, col_fc3 = st.columns(3)
    with col_fc1:
        target_dataset = st.selectbox("Select Target Series", options=["Macroeconomic KPI", "Global Commodity Prices"])
    with col_fc2:
        if target_dataset == "Macroeconomic KPI":
            country = st.selectbox("Select Country", options=sorted(df_macro["country_name"].unique()))
            target_metric = st.selectbox("Metric", options=["gdp_growth_pct", "inflation_pct", "trade_balance_busd"])
        else:
            commodity = st.selectbox("Select Commodity", options=sorted(df_comm["commodity"].unique()))
            target_metric = "price_usd"
    with col_fc3:
        horizon = st.slider("Forecast Horizon (Months)", min_value=3, max_value=24, value=12)

    # Filter data
    if target_dataset == "Macroeconomic KPI":
        sub_df = df_macro[df_macro["country_name"] == country].sort_values("date")
    else:
        sub_df = df_comm[df_comm["commodity"] == commodity].sort_values("date")

    # Run ML Model
    with st.spinner("Computing Exponential Smoothing Forecast & Confidence Intervals..."):
        fc_df = GlobalMLAnalytics.forecast_timeseries(sub_df, date_col="date", value_col=target_metric, horizon_months=horizon)

    # Plot Forecast
    fig = go.Figure()
    
    # Historical Line
    fig.add_trace(go.Scatter(
        x=pd.to_datetime(sub_df["date"]),
        y=sub_df[target_metric],
        mode="lines+markers",
        name="Historical Data",
        line=dict(color="#6366f1", width=2)
    ))
    
    # Forecast Line
    fig.add_trace(go.Scatter(
        x=fc_df["date"],
        y=fc_df["forecast"],
        mode="lines+markers",
        name="AI Forecast",
        line=dict(color="#a855f7", width=3, dash="dash")
    ))
    
    # Upper & Lower Bounds
    fig.add_trace(go.Scatter(
        x=pd.concat([fc_df["date"], fc_df["date"][::-1]]),
        y=pd.concat([fc_df["upper_ci"], fc_df["lower_ci"][::-1]]),
        fill="toself",
        fillcolor="rgba(168, 85, 247, 0.15)",
        line=dict(color="rgba(255,255,255,0)"),
        hoverinfo="skip",
        showlegend=True,
        name="95% Confidence Interval"
    ))
    
    fig.update_layout(template="plotly_dark", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", title="AI Predictive Projection")
    st.plotly_chart(fig, use_container_width=True)

with tab_anom:
    st.subheader("Isolation Forest Anomaly Scanner")
    st.caption("Identifies historical macroeconomic outlier events & severe supply chain bottlenecks.")
    
    contamination = st.slider("Anomaly Sensitivity (Contamination Rate)", min_value=0.01, max_value=0.15, value=0.05, step=0.01)
    
    feature_cols = ["gdp_growth_pct", "inflation_pct", "trade_balance_busd", "supply_chain_stress"]
    anom_df = GlobalMLAnalytics.detect_anomalies(df_macro, feature_cols, contamination=contamination)
    
    anomalies_only = anom_df[anom_df["is_anomaly"]]
    
    st.warning(f"Detected {len(anomalies_only)} Macroeconomic Anomaly Outliers out of {len(anom_df)} records.")
    
    fig_anom = px.scatter(
        anom_df,
        x="inflation_pct",
        y="gdp_growth_pct",
        color="is_anomaly",
        color_discrete_map={False: "#6366f1", True: "#ef4444"},
        symbol="is_anomaly",
        hover_name="country_name",
        hover_data=["date", "supply_chain_stress"],
        template="plotly_dark",
        title="Isolation Forest Outlier Clusters (Red = Anomaly Event)"
    )
    fig_anom.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    st.plotly_chart(fig_anom, use_container_width=True)
    
    with st.expander("📄 View Anomaly Data Logs"):
        st.dataframe(anomalies_only[["date", "country_name", "gdp_growth_pct", "inflation_pct", "supply_chain_stress"]].sort_values("date", ascending=False))
