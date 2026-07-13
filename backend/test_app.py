import sys

if __name__ == "__main__":
    try:
        print("Testing Nyaya AI backend module resolution...")
        from app.main import app
        print("SUCCESS: FastAPI application loaded and database tables initialized successfully!")
        sys.exit(0)
    except Exception as e:
        print(f"FAILURE: Module initialization failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
