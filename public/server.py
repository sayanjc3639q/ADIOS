"""Public Web Application & Installer Portal for ADIOS.
Runs locally at http://localhost:3000 (or on standard web port).

Features:
- Download standalone Windows .exe installer / binary
- Free 3-Day Trial enrollment with email registration
- Product Key Purchase and Activation Portal
- Clear explanation of Offline-First vs Cloud Sync capabilities
- REST API for Desktop App Client activation & sync telemetry checks
"""
from __future__ import annotations
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional
from pathlib import Path
from fastapi import FastAPI, Request, Form, Response, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, FileResponse
from pydantic import BaseModel

from admin.db import get_connection, hash_password, init_server_db

app = FastAPI(title="ADIOS Desktop Application - Official Portal")

init_server_db()

# Models for desktop app API
class LicenseCheckRequest(BaseModel):
    email: str
    product_key: Optional[str] = None
    machine_id: Optional[str] = None

class SyncTelemetryRequest(BaseModel):
    email: str
    bytes_uploaded: int
    bytes_downloaded: int

@app.get("/", response_class=HTMLResponse)
def home_page():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ADIOS - The High-Performance Offline-First Personal Desktop Manager</title>
        <style>
            :root {
                --primary: #0284c7;
                --primary-dark: #0369a1;
                --bg: #0b0f17;
                --card: #151d2c;
                --border: #233148;
                --text: #f8fafc;
                --text-muted: #94a3b8;
            }
            * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
            body { background: var(--bg); color: var(--text); line-height: 1.6; }
            
            nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 48px; border-bottom: 1px solid var(--border); }
            .brand { font-size: 20px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 10px; }
            .brand span { background: #0284c7; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            .nav-links a { color: var(--text-muted); text-decoration: none; margin-left: 24px; font-size: 14px; font-weight: 500; transition: 0.2s; }
            .nav-links a:hover { color: #fff; }
            .btn-cta { background: var(--primary); color: white; padding: 8px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }

            .hero { text-align: center; padding: 70px 24px 50px; max-width: 860px; margin: 0 auto; }
            .hero h1 { font-size: 46px; font-weight: 800; line-height: 1.2; margin-bottom: 18px; background: linear-gradient(135deg, #fff 40%, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .hero p { font-size: 18px; color: var(--text-muted); margin-bottom: 32px; }
            .hero-btns { display: flex; justify-content: center; gap: 16px; margin-bottom: 40px; }
            .btn-download { background: #0284c7; color: white; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.4); }
            .btn-download:hover { background: #0369a1; }
            .btn-secondary { background: #1e293b; color: white; border: 1px solid var(--border); padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; text-decoration: none; }

            .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1100px; margin: 40px auto; padding: 0 24px; }
            .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 30px; }
            .card h3 { font-size: 20px; margin-bottom: 12px; color: #38bdf8; }
            .card p { font-size: 14px; color: var(--text-muted); }
            
            .pricing-section { max-width: 1000px; margin: 60px auto; padding: 0 24px; text-align: center; }
            .pricing-section h2 { font-size: 32px; margin-bottom: 10px; }
            .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 36px; text-align: left; }
            .pricing-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 32px; position: relative; }
            .pricing-card.featured { border-color: #0284c7; box-shadow: 0 0 30px -5px rgba(2, 132, 199, 0.3); }
            .pricing-card .badge-pro { position: absolute; top: -12px; right: 24px; background: #0284c7; color: white; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
            .price { font-size: 38px; font-weight: 800; color: #fff; margin: 18px 0; }
            .price span { font-size: 15px; color: var(--text-muted); font-weight: 400; }
            .features-list { list-style: none; margin: 20px 0; font-size: 14px; color: var(--text-muted); }
            .features-list li { margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
            .features-list li::before { content: "✓"; color: #34d399; font-weight: bold; }
            
            footer { text-align: center; padding: 40px; border-top: 1px solid var(--border); color: var(--text-muted); font-size: 13px; margin-top: 60px; }
        </style>
    </head>
    <body>
        <nav>
            <div class="brand">
                ADIOS <span>v2.0 Native</span>
            </div>
            <div class="nav-links">
                <a href="#features">Features</a>
                <a href="#install-guide">Setup Guide</a>
                <a href="#pricing">Product Keys</a>
                <a href="/trial" class="btn-cta">Start 3-Day Trial</a>
            </div>
        </nav>

        <section class="hero">
            <h1>Your Life, Finance & Growth in One Lightning-Fast Desktop App</h1>
            <p>100% Free and Private for Offline Use. No mandatory login. When you want encrypted cloud sync across multiple machines, activate a Product Key or start a 3-Day Free Trial.</p>
            <div class="hero-btns">
                <a href="/download" class="btn-download">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download ADIOS for Windows (.exe)
                </a>
                <a href="/trial" class="btn-secondary">Get 3-Day Cloud Trial</a>
            </div>
            <div style="font-size: 13px; color: #64748b;">Requires Windows 10/11 64-bit • Standalone Executable • Zero Bloat</div>
        </section>

        <section id="features" class="cards-grid">
            <div class="card">
                <h3>100% Offline by Default</h3>
                <p>Never locked behind a paywall. Keep your finance, exams, notes, and habits entirely in local SQLite on your own computer without signing in.</p>
            </div>
            <div class="card">
                <h3>Custom Install & Backups</h3>
                <p>Choose where ADIOS stores your data and backup archives. Automatic rolling backups keep your information safe at all times.</p>
            </div>
            <div class="card">
                <h3>Cloud Sync & Telemetry</h3>
                <p>Optionally connect your account with a license key to sync transactions, reminders, and documents seamlessly.</p>
            </div>
        </section>

        <!-- PRICING & PRODUCT KEYS -->
        <section id="pricing" class="pricing-section">
            <h2>Fair, Transparent Licensing</h2>
            <p style="color: var(--text-muted);">Pick offline freedom or enhanced cloud sync.</p>

            <div class="pricing-grid">
                <!-- Free Offline -->
                <div class="pricing-card">
                    <h3>Community Edition</h3>
                    <p style="color: var(--text-muted); font-size: 13px;">Full desktop functionality on your PC</p>
                    <div class="price">₹0 <span>/ forever</span></div>
                    <ul class="features-list">
                        <li>All 10 Sections Included</li>
                        <li>Local SQLite Database</li>
                        <li>Automated Local Backups</li>
                        <li>Print & PDF Reports</li>
                        <li>No Cloud Sync Required</li>
                    </ul>
                    <a href="/download" class="btn-secondary" style="display:block; text-align:center;">Download Free</a>
                </div>

                <!-- 3-Day Trial -->
                <div class="pricing-card">
                    <h3>3-Day Cloud Trial</h3>
                    <p style="color: var(--text-muted); font-size: 13px;">Test drive cloud sync with no card</p>
                    <div class="price">Free <span>/ 3 days</span></div>
                    <ul class="features-list">
                        <li>Cloud Sync Enabled</li>
                        <li>50 MB Cloud Sync Bandwidth</li>
                        <li>Instant Email Activation</li>
                        <li>Seamless fallback to Offline</li>
                    </ul>
                    <a href="/trial" class="btn-cta" style="display:block; text-align:center;">Claim Trial</a>
                </div>

                <!-- Pro Edition -->
                <div class="pricing-card featured">
                    <span class="badge-pro">RECOMMENDED</span>
                    <h3>Pro Edition License</h3>
                    <p style="color: var(--text-muted); font-size: 13px;">Permanent key for multi-PC sync</p>
                    <div class="price">₹999 <span>/ lifetime key</span></div>
                    <ul class="features-list">
                        <li>Unlimited Cloud Sync</li>
                        <li>Multi-Device Continuity</li>
                        <li>Priority Server Bandwidth</li>
                        <li>All Future Core Updates</li>
                    </ul>
                    <a href="/purchase" class="btn-download" style="display:block; text-align:center; justify-content:center;">Purchase License Key</a>
                </div>
            </div>
        </section>

        <footer>
            ADIOS Personal Desktop Management • Fast, Native, Respects Your Privacy
        </footer>
    </body>
    </html>
    """)

@app.get("/download")
def download_exe():
    """Serves the generated ADIOS standalone executable."""
    dist_file = Path("dist/ADIOS.exe")
    if dist_file.exists():
        return FileResponse(
            dist_file,
            filename="ADIOS_Setup.exe",
            media_type="application/octet-stream"
        )
    return HTMLResponse("""
    <div style="font-family:sans-serif; padding:40px; text-align:center;">
        <h2>Binary Build In Progress</h2>
        <p>The standalone binary is currently being prepared. You can run the application directly via:</p>
        <code>python -m app.main</code>
        <br><br>
        <a href="/">← Return to Home</a>
    </div>
    """, status_code=200)

@app.get("/trial", response_class=HTMLResponse)
def trial_form():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Start Free 3-Day Trial - ADIOS</title>
        <style>
            * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: #0b0f17; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #151d2c; padding: 36px; border-radius: 12px; border: 1px solid #233148; width: 420px; }
            h2 { color: #38bdf8; margin-bottom: 8px; }
            p { font-size: 13px; color: #94a3b8; margin-bottom: 24px; }
            label { font-size: 13px; display: block; margin-bottom: 6px; }
            input { width: 100%; padding: 10px; margin-bottom: 16px; border-radius: 6px; border: 1px solid #334155; background: #0b0f17; color: white; }
            button { width: 100%; padding: 12px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
            button:hover { background: #0369a1; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Activate 3-Day Free Trial</h2>
            <p>Enter your email to activate full cloud sync for 3 days on your ADIOS desktop application. No credit card required.</p>
            <form action="/trial/start" method="post">
                <label>Your Email Address</label>
                <input type="email" name="email" placeholder="name@example.com" required>
                <label>Create a Password</label>
                <input type="password" name="password" placeholder="Password for sync" required>
                <button type="submit">Activate Free Trial</button>
            </form>
            <div style="margin-top: 18px; text-align: center;">
                <a href="/" style="font-size: 13px; color: #94a3b8; text-decoration: none;">← Back to Home</a>
            </div>
        </div>
    </body>
    </html>
    """)

@app.post("/trial/start", response_class=HTMLResponse)
def start_trial(email: str = Form(...), password: str = Form(...)):
    email = email.strip().lower()
    now = datetime.now()
    trial_end = now + timedelta(days=3)
    
    with get_connection() as conn:
        pwd_hash = hash_password(password)
        existing = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            return HTMLResponse(f"""
            <div style="font-family:sans-serif; background:#0b0f17; color:#fff; padding:50px; text-align:center;">
                <h2>Account Already Registered</h2>
                <p>This email already exists in our system. You can sign in directly from the ADIOS Desktop app!</p>
                <a href="/" style="color:#38bdf8;">Return Home</a>
            </div>
            """)
        
        conn.execute("""
            INSERT INTO users (email, password_hash, role, trial_start, trial_end, data_usage_kb)
            VALUES (?, ?, 'trial_user', ?, ?, 0.0)
        """, (email, pwd_hash, now.strftime("%Y-%m-%d"), trial_end.strftime("%Y-%m-%d")))

    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Trial Activated - ADIOS</title>
        <style>
            * {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
            body {{ background: #0b0f17; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }}
            .card {{ background: #151d2c; padding: 36px; border-radius: 12px; border: 1px solid #233148; width: 440px; text-align: center; }}
            h2 {{ color: #34d399; margin-bottom: 12px; }}
            .info-box {{ background: #0b0f17; border: 1px solid #334155; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: left; font-size: 14px; }}
            .btn {{ display: inline-block; padding: 10px 24px; background: #0284c7; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }}
        </style>
    </head>
    <body>
        <div class="card">
            <h2>🎉 3-Day Trial Activated!</h2>
            <p>Your trial cloud sync account is ready. Open your ADIOS Desktop App and sign in:</p>
            <div class="info-box">
                <div><b>Email:</b> {email}</div>
                <div><b>Trial Expires On:</b> {trial_end.strftime("%B %d, %Y")}</div>
                <div style="margin-top:8px; font-size:12px; color:#94a3b8;">After 3 days, ADIOS continues working 100% offline. A product key is only required if you want to keep syncing.</div>
            </div>
            <a href="/download" class="btn">Download Desktop App (.exe)</a>
        </div>
    </body>
    </html>
    """)

@app.get("/purchase", response_class=HTMLResponse)
def purchase_page():
    # Show available key for immediate checkout simulation
    with get_connection() as conn:
        key = conn.execute("SELECT key_code FROM product_keys WHERE is_used = 0 LIMIT 1").fetchone()
        sample_key = key["key_code"] if key else "ADIOS-PRO-SAMPLE-KEY"

    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Purchase ADIOS License Key</title>
        <style>
            * {{ box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
            body {{ background: #0b0f17; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }}
            .card {{ background: #151d2c; padding: 36px; border-radius: 12px; border: 1px solid #233148; width: 440px; }}
            h2 {{ color: #38bdf8; margin-bottom: 8px; }}
            .key-display {{ background: #0b0f17; padding: 14px; border-radius: 6px; font-size: 16px; font-family: monospace; color: #34d399; font-weight: 700; border: 1px dashed #34d399; text-align: center; margin: 20px 0; }}
            .btn {{ display: block; text-align: center; padding: 12px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: 700; text-decoration: none; }}
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Instant Product Key Activation</h2>
            <p style="font-size: 13px; color: #94a3b8;">Copy your genuine product key and paste it into ADIOS under <b>Settings → Account & Cloud Sync</b>:</p>
            <div class="key-display">{sample_key}</div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Lifetime Pro • Unlimited Cloud Sync • Multi-Device Support</p>
            <a href="/" class="btn" style="margin-top: 18px;">← Return to ADIOS Homepage</a>
        </div>
    </body>
    </html>
    """)

# ----------------- DESKTOP CLIENT API ENDPOINTS -----------------

@app.post("/api/license/verify")
def api_verify_license(req: LicenseCheckRequest):
    """Called by ADIOS desktop client to verify product key & trial status."""
    with get_connection() as conn:
        # Check product key if provided
        if req.product_key:
            key_row = conn.execute("SELECT * FROM product_keys WHERE key_code = ?", (req.product_key.strip(),)).fetchone()
            if key_row:
                if not key_row["is_used"]:
                    conn.execute("UPDATE product_keys SET is_used = 1, assigned_to_email = ?, used_at = CURRENT_TIMESTAMP WHERE id = ?", (req.email, key_row["id"]))
                    conn.execute("UPDATE users SET role = 'pro_user' WHERE email = ?", (req.email,))
                return {
                    "valid": True,
                    "plan": key_row["plan_type"],
                    "message": "Product key activated successfully. Cloud sync enabled."
                }
            return {"valid": False, "message": "Invalid product key"}

        # Check trial status for email
        user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email.strip().lower(),)).fetchone()
        if user:
            if user["role"] in ("admin", "pro_user"):
                return {"valid": True, "plan": user["role"], "message": "Active Pro subscription"}
            if user["trial_end"]:
                today_str = datetime.now().strftime("%Y-%m-%d")
                if today_str <= user["trial_end"]:
                    return {"valid": True, "plan": "trial", "message": f"Trial active until {user['trial_end']}"}
            return {
                "valid": False,
                "plan": "expired",
                "message": "3-day free trial has expired. Purchase a product key to continue cloud sync, or continue using offline."
            }

    return {"valid": False, "message": "User not found. Register a 3-day trial or continue offline."}

@app.post("/api/sync/telemetry")
def api_sync_telemetry(req: SyncTelemetryRequest):
    """Logs data usage per user for admin bandwidth auditing."""
    kb = (req.bytes_uploaded + req.bytes_downloaded) / 1024.0
    with get_connection() as conn:
        conn.execute("UPDATE users SET data_usage_kb = data_usage_kb + ? WHERE email = ?", (kb, req.email.strip().lower()))
        conn.execute("INSERT INTO sync_logs (user_email, payload_size_kb) VALUES (?, ?)", (req.email, kb))
    return {"status": "recorded", "kb_added": kb}
