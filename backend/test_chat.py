import asyncio
import dotenv
dotenv.load_dotenv()
from app.agents.orchestrator import orchestrator_service
from app.core.database import SessionLocal

async def test():
    print("Testing orchestrator chat message processing...")
    db = SessionLocal()
    try:
        res = await orchestrator_service.process_message(
            user_message="Hello, my landlord is refusing to return my security deposit. What are my rights under Indian law?",
            current_summary="",
            chat_history=[],
            mother_mode=False,
            db=db,
            client_ip="127.0.0.1",
            session_id="test-session"
        )
        print("\n=== CHAT SUCCESS ===")
        print("Response:", res["response"])
        print("Laws Cited:", res["laws_cited"])
        print("Sections Cited:", res["sections_cited"])
        print("Next Steps:", res["next_steps"])
    except Exception as e:
        print("\n=== CHAT FAILURE ===")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    asyncio.run(test())
