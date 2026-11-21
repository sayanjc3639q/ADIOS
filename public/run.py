"""Runner for Public Website Portal."""
import uvicorn
from public.server import app

def run(port: int = 3000):
    print(f"Starting Public Download & License Portal on http://127.0.0.1:{port}")
    uvicorn.run(app, host="127.0.0.1", port=port)

if __name__ == "__main__":
    run()
