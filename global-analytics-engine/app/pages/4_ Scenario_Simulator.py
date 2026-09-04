import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

import streamlit as st
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

from config.cloud_config import COUNTRY_METADATA
from src.analytics.ml_models import GlobalMLAnalytics

st.set_page_config(page_title="Scenario Simulator | GAE", page_icon="🎲", layout="wide")

st.title("🎲 Geopolitical Stress-Testing & Monte Carlo Simulator")
st.caption("Interactive Macro Stress Testing under Tariff Shocks, Energy Spikes, & Central Bank Rate Hikes")

col_sim1, col_sim2 = st.columns([1, 2])

with col_sim1:
    st.subheader("⚙️ Shock Parameters")
    
    target_iso = st.selectbox("Select Target Economy", options=list(COUNTRY_METADATA.keys()), format_func=lambda x: f"{COUNTRY_METADATA[x]['name']} ({x})")
    base_gdp = COUNTRY_METADATA[target_iso]["gdp_trillion"]
    st.write(f"**Base Baseline GDP**: ${base_gdp} Trillion")
    
    tariff_shock = st.slider("Import Tariff Increase (%)", min_value=0.0, max_value=25.0, value=7.5, step=0.5)
    oil_shock = st.slider("Global Oil & Energy Spike (%)", min_value=0.0, max_value=50.0, value=15.0, step=1.0)
    rate_hike = st.slider("Central Bank Rate Hike (bps)", min_value=0, max_value=500, value=150, step=25)
    num_sims = st.selectbox("Monte Carlo Iterations", options=[500, 1000, 5000], index=1)
    
    run_btn = st.button("🚀 Run Monte Carlo Simulation", type="primary")

with col_sim2:
    st.subheader("📊 Stochastic Outcome Distribution")
    
    sim_results = GlobalMLAnalytics.run_monte_carlo_simulation(
        base_gdp_trillion=base_gdp,
        tariff_shock_pct=tariff_shock,
        oil_shock_pct=oil_shock,
        rate_hike_bps=rate_hike,
        num_simulations=num_sims
    )
    
    c1, c2, c3 = st.columns(3)
    c1.metric("Mean GDP Shock Impact", f"{sim_results['mean_gdp_impact_pct']}%")
    c2.metric("Median Projected GDP", f"${sim_results['median_gdp_trillion']} T")
    c3.metric("95% Value at Risk (VaR)", f"${sim_results['var_95_gdp_trillion']} T", delta=f"{round(sim_results['var_95_gdp_trillion'] - base_gdp, 2)} T", delta_color="inverse")
    
    # Histogram of Monte Carlo Outcomes
    fig_hist = px.histogram(
        x=sim_results["simulations"],
        nbins=40,
        labels={"x": "Simulated GDP Outcome (Trillion USD)"},
        template="plotly_dark",
        title=f"Monte Carlo GDP Outcome Probability Density ({num_sims} Iterations)",
        color_discrete_sequence=["#a855f7"]
    )
    
    fig_hist.add_vline(x=base_gdp, line_dash="dash", line_color="#10b981", annotation_text="Baseline GDP")
    fig_hist.add_vline(x=sim_results["var_95_gdp_trillion"], line_dash="dash", line_color="#ef4444", annotation_text="95% VaR Floor")
    
    fig_hist.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    st.plotly_chart(fig_hist, use_container_width=True)
