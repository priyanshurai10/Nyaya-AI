# 🌍 Global Analytics Engine (GAE)
### International Macroeconomics, Bilateral Trade & Geopolitical Risk BI Platform
*Built with Python 3.10+, DuckDB Data Lakehouse, AWS S3 Integration, PyArrow Parquet, Machine Learning & Streamlit*

---

## 🚀 Key Architectural Features

1. **High-Performance Data Lakehouse (Columnar Storage)**
   - High-throughput ETL data ingestion using **Pandas**, **Polars**, and **PyArrow**.
   - Storage format: Compressed `.parquet` with **DuckDB** in-memory query engine.
   - Unified Cloud Storage abstraction supporting **AWS S3**, **Supabase Cloud**, and local fallback.

2. **Predictive Machine Learning Engine**
   - **Exponential Smoothing (Holt-Winters)** time-series forecasting for GDP growth, inflation, and commodity prices.
   - **Isolation Forest** anomaly detection for macroeconomic shock identification.
   - **Stochastic Monte Carlo Simulator** (500–5,000 iterations) for stress-testing GDP under tariff, energy, and interest rate shocks with 95% Value-at-Risk (VaR).

3. **Enterprise Visualization Dashboard**
   - Interactive 3D/2D Natural Earth Choropleth maps.
   - International Trade Flow **Sankey Diagrams**.
   - Direct DuckDB SQL query console with real-time CSV export.
   - Automated **Executive Briefing PDF Report Generator** (FPDF).

4. **Cloud Infrastructure & DevOps Ready**
   - **Terraform IaC** scripts for AWS S3 Data Lake & IAM role provisioning.
   - **Docker** & **Docker Compose** containerization.
   - **GitHub Actions** CI/CD pipeline with automated Pytest unit tests.

---

## 📁 Repository Structure

```
global-analytics-engine/
├── .github/workflows/deploy.yml   # CI/CD Pipeline
├── terraform/main.tf               # Infrastructure-as-Code for AWS
├── Dockerfile                      # Containerization setup
├── docker-compose.yml              # Container orchestration
├── config/cloud_config.py          # Cloud & Lakehouse settings
├── src/
│   ├── cloud/storage_manager.py    # S3 / DuckDB Parquet Storage Manager
│   ├── pipeline/etl_pipeline.py    # Ingestion & Transformation Pipeline
│   ├── analytics/ml_models.py      # Forecasting, Anomalies & Monte Carlo
│   └── utils/report_generator.py   # PDF & CSV Export engine
├── app/
│   ├── main.py                     # Main Streamlit Application
│   ├── pages/                      # Multi-Page Sub-Apps
│   └── styles/custom.css           # Glassmorphism Dark Theme Styling
├── tests/test_pipeline.py          # Pytest Unit Test Suite
├── requirements.txt                # Dependencies
└── run_app.py                      # Single-command launcher
```

---

## 💻 Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Launch the Application
```bash
python run_app.py
```
Or run directly via Streamlit:
```bash
streamlit run app/main.py
```

### 3. Run Automated Tests
```bash
pytest tests/
```

### 4. Run via Docker Container
```bash
docker-compose up --build
```
Access the application at `http://localhost:8501`.
