"""Multi-server launcher for ADIOS Web Ecosystem with proper port management and graceful cleanup."""
import multiprocessing
import os
import socket
import sys
import time
import uvicorn

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0

def run_public_server(port: int = 3000):
    try:
        from public.server import app
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
    except Exception as e:
        print(f"[Public Server Error]: {e}")

def run_admin_server(port: int = 8080):
    try:
        from admin.server import app
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
    except Exception as e:
        print(f"[Admin Server Error]: {e}")

def main():
    public_port = 3000
    admin_port = 8080

    # Fallback to alternate ports if 3000 or 8080 are currently locked
    if is_port_in_use(public_port):
        print(f"[Notice] Port {public_port} is busy, checking 3001...")
        public_port = 3001 if not is_port_in_use(3001) else 3002

    if is_port_in_use(admin_port):
        print(f"[Notice] Port {admin_port} is busy, checking 8081...")
        admin_port = 8081 if not is_port_in_use(8081) else 8082

    print("==================================================")
    print("   ADIOS Web Ecosystem (Admin & Public Portals)   ")
    print("==================================================")
    print(f"1. Public Portal & Downloader: http://127.0.0.1:{public_port}")
    print(f"2. Admin Control Plane:        http://127.0.0.1:{admin_port}/login (jcsayan7@gmail.com)")
    print("==================================================")
    print("Press Ctrl+C to terminate both servers.\n")

    p1 = multiprocessing.Process(target=run_public_server, args=(public_port,), daemon=True)
    p2 = multiprocessing.Process(target=run_admin_server, args=(admin_port,), daemon=True)

    p1.start()
    p2.start()

    try:
        while p1.is_alive() and p2.is_alive():
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping ADIOS web servers...")
    finally:
        if p1.is_alive():
            p1.terminate()
        if p2.is_alive():
            p2.terminate()
        print("Servers stopped cleanly.")

if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
