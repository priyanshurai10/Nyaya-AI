import asyncio
import dotenv
dotenv.load_dotenv()
from app.agents.document import DocumentAnalysisAgent
from app.agents.risk import RiskDetectionAgent

async def test():
    print("Testing document and risk analysis agents flow...")
    doc_agent = DocumentAnalysisAgent()
    risk_agent = RiskDetectionAgent()
    
    text = "RENT AGREEMENT\nThis rent agreement is made on this 21st day of July 2026, between Rajesh Kumar (Landlord) and Priyanshu Rai (Tenant). The rent is set at Rs. 15,000 per month. The security deposit is Rs. 45,000. Notice period is 2 months."
    try:
        analysis_res = await doc_agent.analyze_document(text, "rent_agreement.txt")
        print("1. Document analysis succeeded. Document Type:", analysis_res.document_type)
        
        risk_res = await risk_agent.analyze_risks(text, analysis_res.document_type)
        print("2. Risk analysis succeeded. Risk Score:", risk_res.risk_score)
        print("Risks found:", len(risk_res.risks))
    except Exception as e:
        print("Flow failure:")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(test())
