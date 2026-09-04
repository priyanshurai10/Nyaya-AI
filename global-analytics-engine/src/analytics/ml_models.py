import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from statsmodels.tsa.holtwinters import ExponentialSmoothing

class GlobalMLAnalytics:
    """Predictive Machine Learning Engine for Economic Forecasting & Anomaly Detection."""

    @staticmethod
    def forecast_timeseries(df: pd.DataFrame, date_col: str, value_col: str, horizon_months: int = 12):
        """Fits an Exponential Smoothing time-series model to forecast future trends."""
        df_clean = df[[date_col, value_col]].copy()
        df_clean[date_col] = pd.to_datetime(df_clean[date_col])
        df_clean = df_clean.sort_values(date_col).set_index(date_col)
        
        # Resample monthly
        ts = df_clean[value_col].asfreq("MS").interpolate(method="linear")
        
        if len(ts) < 24:
            # Fallback for short series: simple linear trend forecast
            last_val = ts.iloc[-1]
            future_dates = pd.date_range(start=ts.index[-1] + pd.DateOffset(months=1), periods=horizon_months, freq="MS")
            forecast_vals = [last_val * (1 + 0.002 * i) for i in range(1, horizon_months + 1)]
            lower_bound = [v * 0.93 for v in forecast_vals]
            upper_bound = [v * 1.07 for v in forecast_vals]
        else:
            model = ExponentialSmoothing(ts, trend="add", seasonal="add", seasonal_periods=12).fit()
            forecast_vals = model.forecast(horizon_months)
            future_dates = forecast_vals.index
            
            # Estimate confidence intervals via residuals standard error
            stderr = np.std(model.resid) if len(model.resid) > 0 else 1.0
            lower_bound = forecast_vals - 1.96 * stderr
            upper_bound = forecast_vals + 1.96 * stderr

        forecast_df = pd.DataFrame({
            "date": future_dates,
            "forecast": np.round(forecast_vals, 2),
            "lower_ci": np.round(lower_bound, 2),
            "upper_ci": np.round(upper_bound, 2)
        })
        return forecast_df

    @staticmethod
    def detect_anomalies(df: pd.DataFrame, feature_cols: list, contamination: float = 0.05) -> pd.DataFrame:
        """Applies Isolation Forest algorithm to flag macroeconomic & supply chain anomalies."""
        df_work = df.copy()
        X = df_work[feature_cols].fillna(0)
        
        iso = IsolationForest(contamination=contamination, random_state=42)
        df_work["anomaly_score"] = iso.fit_predict(X)
        df_work["is_anomaly"] = df_work["anomaly_score"] == -1
        
        return df_work

    @staticmethod
    def run_monte_carlo_simulation(base_gdp_trillion: float, tariff_shock_pct: float, oil_shock_pct: float, rate_hike_bps: float, num_simulations: int = 1000) -> dict:
        """Runs Monte Carlo simulations to model GDP impact under combined geopolitical shocks."""
        np.random.seed(99)
        
        # Shock factors (empirical sensitivity multipliers)
        tariff_impact = -0.08 * (tariff_shock_pct / 5.0)
        oil_impact = -0.12 * (oil_shock_pct / 10.0)
        rate_impact = -0.05 * (rate_hike_bps / 100.0)
        
        baseline_impact_pct = tariff_impact + oil_impact + rate_impact
        
        # Stochastic variance
        simulated_impacts = np.random.normal(loc=baseline_impact_pct, scale=0.8, size=num_simulations)
        simulated_gdp_outcomes = base_gdp_trillion * (1 + (simulated_impacts / 100.0))
        
        return {
            "mean_gdp_impact_pct": round(float(np.mean(simulated_impacts)), 2),
            "median_gdp_trillion": round(float(np.median(simulated_gdp_outcomes)), 2),
            "var_95_gdp_trillion": round(float(np.percentile(simulated_gdp_outcomes, 5)), 2), # 95% Value at Risk
            "simulations": simulated_gdp_outcomes.tolist()
        }
