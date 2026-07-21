import asyncio
import dotenv
dotenv.load_dotenv()
from app.agents.document import DocumentAnalysisAgent

async def test():
    print("Testing document analysis agent...")
    agent = DocumentAnalysisAgent()
    try:
        res = await agent.analyze_document(
            text="RENT AGREEMENT\nThis rent agreement is made on this 21st day of July 2026, between Rajesh Kumar (Landlord) and Priyanshu Rai (Tenant). The rent is set at Rs. 15,000 per month. The security deposit is Rs. 45,000. Notice period is 2 months.",
            filename="rent_agreement.txt",
            language="en"
        )
        print("\n=== ANALYSIS SUCCESS ===")
        print("Document type:", res.document_type)
        print("Summary:", res.summary)
        print("Key points:", res.key_points)
        print("Clauses:", res.clauses)
        print("Recommended steps:", res.recommended_steps)
        print("Legal implications:", res.legal_implications)
    except Exception as e:
        print("\n=== ANALYSIS FAILURE ===")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(test())
