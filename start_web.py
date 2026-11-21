"""Start script to run both Public Download Portal and Admin Control Plane simultaneously."""
import subprocess
import sys
import time

def main():
    print("==================================================")
    print("   ADIOS Web Ecosystem (Admin & Public Portals)   ")
    print("==================================================")
    print("1. Public Portal & Downloader: http://localhost:3000")
    print("2. Admin Control Plane:        http://localhost:8080/login (jcsayan7@gmail.com)")
    print("==================================================")

    p_public = subprocess.Popen([sys.executable, "-m", "uvicorn", "public.server:app", "--host", "127.0.0.1", "--port", "3000"])
    p_admin = subprocess.Popen([sys.executable, "-m", "uvicorn", "admin.server:app", "--host", "127.0.0.1", "--port", "8080"])

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down web portals...")
        p_public.terminate()
        p_admin.terminate()

if __name__ == "__main__":
    main()
