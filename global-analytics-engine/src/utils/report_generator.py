import io
import pandas as pd
from fpdf import FPDF

class ExecutiveReportGenerator:
    """Generates PDF and CSV Executive Briefing documents for international decision makers."""

    @staticmethod
    def generate_pdf_report(country_name: str, kpi_summary: dict, forecast_summary: str) -> bytes:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 18)
        
        # Title
        pdf.cell(0, 10, "GLOBAL ANALYTICS ENGINE - EXECUTIVE BRIEF", new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 6, "International Economic & Risk Intelligence Report", new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.ln(8)
        
        # Section 1: Country Profile
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 8, f"1. Country / Hub Focus: {country_name}", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        
        for key, val in kpi_summary.items():
            pdf.cell(0, 6, f"- {key}: {val}", new_x="LMARGIN", new_y="NEXT")
            
        pdf.ln(6)
        
        # Section 2: AI Forecast & Risk Insights
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 8, "2. AI Predictive Analytics & Risk Assessment", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(0, 6, forecast_summary)
        
        pdf.ln(10)
        pdf.set_font("Helvetica", "I", 9)
        pdf.cell(0, 6, "Generated automatically by Global Analytics Engine Cloud Platform.", new_x="LMARGIN", new_y="NEXT", align="R")
        
        return bytes(pdf.output())

    @staticmethod
    def export_csv(df: pd.DataFrame) -> str:
        return df.to_csv(index=False)
