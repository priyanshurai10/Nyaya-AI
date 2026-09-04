import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

from src.cloud.storage_manager import CloudStorageManager

st.set_page_config(page_title="Global GIS Explorer | GAE", page_icon="🌐", layout="wide")

storage = CloudStorageManager()
df_macro = storage.load_parquet("macroeconomic_indicators")
df_trade = storage.load_parquet("bilateral_trade_flows")

st.title("🌐 International GIS & Trade Flow Explorer")
st.caption("3D/2D World Heatmap & Bilateral Trade Flow Network Visualization")

indicator_choice = st.selectbox(
    "Select Global Indicator to Map",
    options=["gdp_growth_pct", "inflation_pct", "trade_balance_busd", "esg_risk_score", "supply_chain_stress"],
    format_func=lambda x: x.replace("_", " ").upper()
)

# Latest year map data
df_latest = df_macro[df_macro["year"] == 2025].groupby("iso3").first().reset_index()

fig_map = px.choropleth(
    df_latest,
    locations="iso3",
    color=indicator_choice,
    hover_name="country_name",
    color_continuous_scale="Viridis",
    projection="natural earth",
    template="plotly_dark",
    title=f"Global Choropleth Heatmap: {indicator_choice.replace('_', ' ').upper()} (2025)"
)
fig_map.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", height=520)
st.plotly_chart(fig_map, use_container_width=True)

st.divider()

st.subheader("🔁 International Bilateral Trade Flows (Sankey Diagram)")
st.write("Top Trade Volumes between Major World Trading Hubs:")

# Aggregate trade flows
top_flows = df_trade.sort_values(by="trade_volume_busd", ascending=False).head(20)

all_nodes = list(pd.concat([top_flows["exporter_name"], top_flows["importer_name"]]).unique())
node_indices = {name: idx for idx, name in enumerate(all_nodes)}

sources = [node_indices[exp] for exp in top_flows["exporter_name"]]
targets = [node_indices[imp] for imp in top_flows["importer_name"]]
values = top_flows["trade_volume_busd"].tolist()

fig_sankey = go.Figure(data=[go.Sankey(
    node=dict(
        pad=15,
        thickness=20,
        line=dict(color="black", width=0.5),
        label=all_nodes,
        color="#6366f1"
    ),
    link=dict(
        source=sources,
        target=targets,
        value=values,
        color="rgba(99, 102, 241, 0.4)"
    )
)])

fig_sankey.update_layout(template="plotly_dark", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", height=500)
st.plotly_chart(fig_sankey, use_container_width=True)
