"""Public Web Application & Installer Portal for ADIOS.
Crafted with clean, crisp, minimalist UI matching the native desktop app.
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

# Shared CSS design system matching Windows native clean aesthetic
SHARED_HEAD = """
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
    :root {
        --bg: #f8fafc;
        --surface: #ffffff;
        --border: #e2e8f0;
        --border-hover: #cbd5e1;
        --text: #0f172a;
        --text-secondary: #475569;
        --text-muted: #64748b;
        --primary: #0284c7;
        --primary-hover: #0369a1;
        --primary-light: #e0f2fe;
        --success: #16a34a;
        --success-light: #dcfce7;
        --radius: 8px;
        --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
        --shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.08);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
    
    header { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
    .nav-container { max-width: 1024px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; }
    .brand { font-size: 18px; font-weight: 700; color: var(--text); text-decoration: none; display: flex; align-items: center; gap: 8px; letter-spacing: -0.3px; }
    .brand-badge { background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; }
    .nav-links { display: flex; gap: 20px; align-items: center; }
    .nav-links a { color: var(--text-secondary); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.15s ease; }
    .nav-links a:hover { color: var(--text); }
    
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 16px; font-size: 14px; font-weight: 600; border-radius: var(--radius); text-decoration: none; border: 1px solid transparent; cursor: pointer; transition: all 0.15s ease; }
    .btn-primary { background: var(--primary); color: #ffffff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-secondary { background: var(--surface); color: var(--text-secondary); border-color: var(--border); }
    .btn-secondary:hover { background: #f1f5f9; color: var(--text); border-color: var(--border-hover); }
    .btn-lg { padding: 12px 24px; font-size: 15px; }

    .main-container { max-width: 1024px; margin: 0 auto; padding: 48px 24px; }
    
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm); }
    
    footer { border-top: 1px solid var(--border); background: var(--surface); color: var(--text-muted); font-size: 13px; text-align: center; padding: 32px 24px; margin-top: 60px; }
</style>
"""

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
    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>ADIOS — Simple, Native Personal Desktop Manager</title>
        {SHARED_HEAD}
        <style>
            .hero {{ text-align: center; padding: 50px 0 60px; max-width: 720px; margin: 0 auto; }}
            .hero-tag {{ display: inline-block; background: #e2e8f0; color: #334155; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-bottom: 20px; letter-spacing: 0.5px; text-transform: uppercase; }}
            .hero h1 {{ font-size: 40px; font-weight: 700; color: var(--text); line-height: 1.25; margin-bottom: 16px; letter-spacing: -0.5px; }}
            .hero p {{ font-size: 17px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 32px; }}
            .hero-actions {{ display: flex; justify-content: center; gap: 12px; margin-bottom: 16px; }}
            .hero-meta {{ font-size: 13px; color: var(--text-muted); }}

            .section-title {{ text-align: center; margin-bottom: 36px; }}
            .section-title h2 {{ font-size: 26px; font-weight: 700; color: var(--text); margin-bottom: 8px; }}
            .section-title p {{ font-size: 15px; color: var(--text-secondary); }}

            .grid-3 {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 64px; }}
            @media (max-width: 768px) {{ .grid-3 {{ grid-template-columns: 1fr; }} }}
            
            .feature-card {{ background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; transition: border-color 0.2s ease; }}
            .feature-card:hover {{ border-color: var(--border-hover); }}
            .feature-icon {{ width: 36px; height: 36px; border-radius: 6px; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; margin-bottom: 16px; }}
            .feature-card h3 {{ font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--text); }}
            .feature-card p {{ font-size: 14px; color: var(--text-secondary); line-height: 1.5; }}

            .pricing-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: stretch; margin-bottom: 40px; }}
            @media (max-width: 800px) {{ .pricing-grid {{ grid-template-columns: 1fr; }} }}
            
            .plan-card {{ background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; display: flex; flex-direction: column; justify-content: space-between; }}
            .plan-card.highlight {{ border: 2px solid var(--primary); box-shadow: var(--shadow); position: relative; }}
            .plan-badge {{ position: absolute; top: -11px; right: 20px; background: var(--primary); color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; text-transform: uppercase; }}
            .plan-name {{ font-size: 17px; font-weight: 600; margin-bottom: 4px; }}
            .plan-desc {{ font-size: 13px; color: var(--text-muted); margin-bottom: 20px; min-height: 38px; }}
            .plan-price {{ font-size: 32px; font-weight: 700; color: var(--text); margin-bottom: 24px; }}
            .plan-price span {{ font-size: 14px; font-weight: 400; color: var(--text-muted); }}
            
            .plan-features {{ list-style: none; margin-bottom: 28px; border-top: 1px solid var(--border); padding-top: 20px; }}
            .plan-features li {{ font-size: 13.5px; color: var(--text-secondary); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }}
            .plan-features li svg {{ stroke: var(--success); flex-shrink: 0; }}
        </style>
    </head>
    <body>
        <header>
            <div class="nav-container">
                <a href="/" class="brand">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                    ADIOS
                    <span class="brand-badge">Windows Native</span>
                </a>
                <nav class="nav-links">
                    <a href="#features">Features</a>
                    <a href="#pricing">Licensing</a>
                    <a href="/trial" class="btn btn-secondary">3-Day Trial</a>
                    <a href="/download" class="btn btn-primary">Download .exe</a>
                </nav>
            </div>
        </header>

        <main class="main-container">
            <section class="hero">
                <div class="hero-tag">Fast • Clean • Private</div>
                <h1>The Simplest Desktop Manager for Windows</h1>
                <p>Track your finances in ₹ Rupees, schedule exams, manage habits, subscriptions, and skills in a crisp, zero-bloat Windows native application. 100% functional offline.</p>
                <div class="hero-actions">
                    <a href="/download" class="btn btn-primary btn-lg">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download Standalone .exe
                    </a>
                    <a href="/trial" class="btn btn-secondary btn-lg">Free 3-Day Cloud Trial</a>
                </div>
                <div class="hero-meta">Version 2.0 • Standalone Windows Executable • No Setup Wizard Required</div>
            </section>

            <section id="features">
                <div class="section-title">
                    <h2>Built for Clarity, Not Complexity</h2>
                    <p>Everything you need in clean native Qt panels. No heavy web wrappers.</p>
                </div>

                <div class="grid-3">
                    <div class="feature-card">
                        <div class="feature-icon">📁</div>
                        <h3>100% Offline-First</h3>
                        <p>All your data is stored in your personal local SQLite database. Never locked behind an internet connection or subscription paywall.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🛡️</div>
                        <h3>Your Chosen Folders</h3>
                        <p>Pick exactly where your database and automatic backup files are saved on your drive. Complete control over your files.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">☁️</div>
                        <h3>Optional Cloud Sync</h3>
                        <p>Need your tasks and transactions across multiple computers? Connect with a product key for encrypted peer-to-cloud sync.</p>
                    </div>
                </div>
            </section>

            <section id="pricing">
                <div class="section-title">
                    <h2>Transparent & Fair Pricing</h2>
                    <p>Free for local offline use forever. Pay once if you need encrypted cloud sync.</p>
                </div>

                <div class="pricing-grid">
                    <!-- Offline Plan -->
                    <div class="plan-card">
                        <div>
                            <div class="plan-name">Community / Offline</div>
                            <div class="plan-desc">For users who prefer keeping all their data local on their PC.</div>
                            <div class="plan-price">₹0 <span>/ forever</span></div>
                            <ul class="plan-features">
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> All 10 Application Sections</li>
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Local SQLite Database</li>
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Automated Local Rolling Backups</li>
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Full PDF Print & Reports</li>
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> No Product Key Needed</li>
                            </ul>
                        </div>
                        <a href="/download" class="btn btn-secondary">Download Free</a>
                    </div>

                    <!-- 3-Day Trial -->
                    <div class="plan-card">
                        <div>
                            <div class="plan-name">3-Day Cloud Trial</div>
                            <div class="plan-desc">Test out multi-machine synchronization with zero commitments.</div>
                            <div class="plan-price">Free <span>/ 3 days</span></div>
                            <ul class="plan-features">
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Instant Email Activation</li>
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 3 Days of Full Cloud Sync</li>
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 50 MB Sync Quota</li>
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Seamless Offline Fallback</li>
                            </ul>
                        </div>
                        <a href="/trial" class="btn btn-secondary">Claim 3-Day Trial</a>
                    </div>

                    <!-- Pro License -->
                    <div class="plan-card highlight">
                        <div class="plan-badge">Recommended</div>
                        <div>
                            <div class="plan-name">Pro License Key</div>
                            <div class="plan-desc">Permanent product key for continuous multi-device cloud synchronization.</div>
                            <div class="plan-price">₹999 <span>/ lifetime</span></div>
                            <ul class="plan-features">
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Unlimited Cloud Sync</li>
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Synchronize Across Any Windows PC</li>
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Priority Server Bandwidth</li>
                                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> All Future Core Updates</li>
                            </ul>
                        </div>
                        <a href="/purchase" class="btn btn-primary">Get Product Key</a>
                    </div>
                </div>
            </section>
        </main>

        <footer>
            ADIOS Personal Desktop Manager • Lightweight Windows Native Application
        </footer>
    </body>
    </html>
    """)

@app.get("/download")
def download_exe():
    dist_file = Path("dist/ADIOS.exe")
    if dist_file.exists():
        return FileResponse(
            dist_file,
            filename="ADIOS.exe",
            media_type="application/octet-stream"
        )
    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Download ADIOS</title>
        {SHARED_HEAD}
    </head>
    <body style="display:flex; align-items:center; justify-content:center; height:100vh;">
        <div class="card" style="max-width:440px; text-align:center;">
            <h2 style="margin-bottom:12px;">Standalone Executable Ready</h2>
            <p style="color:var(--text-secondary); margin-bottom:20px; font-size:14px;">The standalone build dist/ADIOS.exe is generated. If running from source, execute:</p>
            <div style="background:#f1f5f9; padding:10px; border-radius:6px; font-family:monospace; font-size:13px; margin-bottom:20px;">python -m app.main</div>
            <a href="/" class="btn btn-primary">Return to Homepage</a>
        </div>
    </body>
    </html>
    """)

@app.get("/trial", response_class=HTMLResponse)
def trial_form():
    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Start 3-Day Free Trial — ADIOS</title>
        {SHARED_HEAD}
        <style>
            body {{ display: flex; align-items: center; justify-content: center; min-height: 100vh; }}
            .form-box {{ width: 100%; max-width: 400px; }}
            label {{ display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }}
            input {{ width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 14px; margin-bottom: 16px; outline: none; }}
            input:focus {{ border-color: var(--primary); }}
        </style>
    </head>
    <body>
        <div class="form-box">
            <div class="card">
                <a href="/" class="brand" style="margin-bottom:20px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                    ADIOS
                </a>
                <h2 style="font-size:20px; font-weight:700; margin-bottom:6px;">Start 3-Day Free Trial</h2>
                <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Experience cloud sync across your devices. No credit card required.</p>
                
                <form action="/trial/start" method="post">
                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="name@example.com" required>
                    <label>Password (for Cloud Sync)</label>
                    <input type="password" name="password" placeholder="••••••••" required>
                    <button type="submit" class="btn btn-primary" style="width:100%; padding:10px;">Activate Free Trial</button>
                </form>
                <div style="text-align:center; margin-top:16px;">
                    <a href="/" style="font-size:13px; color:var(--text-muted); text-decoration:none;">← Cancel and return home</a>
                </div>
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
            <!DOCTYPE html><html><head><title>Account Exists</title>{SHARED_HEAD}</head>
            <body style="display:flex; align-items:center; justify-content:center; height:100vh;">
                <div class="card" style="max-width:400px; text-align:center;">
                    <h3 style="margin-bottom:8px;">Account Already Active</h3>
                    <p style="font-size:14px; color:var(--text-secondary); margin-bottom:20px;">This email is already registered. You can enter your credentials directly inside the ADIOS Desktop app.</p>
                    <a href="/" class="btn btn-primary">Return Home</a>
                </div>
            </body></html>
            """)
        
        conn.execute("""
            INSERT INTO users (email, password_hash, role, trial_start, trial_end, data_usage_kb)
            VALUES (?, ?, 'trial_user', ?, ?, 0.0)
        """, (email, pwd_hash, now.strftime("%Y-%m-%d"), trial_end.strftime("%Y-%m-%d")))

    return HTMLResponse(f"""
    <!DOCTYPE html><html><head><title>Trial Activated</title>{SHARED_HEAD}</head>
    <body style="display:flex; align-items:center; justify-content:center; height:100vh;">
        <div class="card" style="max-width:440px; text-align:center;">
            <div style="width:40px; height:40px; border-radius:50%; background:var(--success-light); color:var(--success); display:inline-flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold; margin-bottom:12px;">✓</div>
            <h2 style="font-size:20px; margin-bottom:6px;">3-Day Trial Activated!</h2>
            <p style="font-size:13px; color:var(--text-secondary); margin-bottom:20px;">Your cloud sync account is ready for use on the desktop application.</p>
            
            <div style="background:#f8fafc; border:1px solid var(--border); border-radius:6px; padding:14px; text-align:left; font-size:13px; margin-bottom:20px;">
                <div style="margin-bottom:6px;"><b>Email:</b> {email}</div>
                <div><b>Trial Valid Until:</b> {trial_end.strftime('%B %d, %Y')}</div>
            </div>

            <a href="/download" class="btn btn-primary" style="width:100%;">Download Desktop App (.exe)</a>
        </div>
    </body></html>
    """)

@app.get("/purchase", response_class=HTMLResponse)
def purchase_page():
    with get_connection() as conn:
        key = conn.execute("SELECT key_code FROM product_keys WHERE is_used = 0 LIMIT 1").fetchone()
        sample_key = key["key_code"] if key else "ADIOS-PRO-2026-X1"

    return HTMLResponse(f"""
    <!DOCTYPE html><html><head><title>Product Key License — ADIOS</title>{SHARED_HEAD}</head>
    <body style="display:flex; align-items:center; justify-content:center; height:100vh;">
        <div class="card" style="max-width:460px; text-align:center;">
            <h2 style="font-size:22px; margin-bottom:8px;">Genuine Product Key</h2>
            <p style="font-size:13px; color:var(--text-secondary); margin-bottom:20px;">Use this license key to enable permanent cloud synchronization in your desktop app:</p>
            
            <div style="background:#f1f5f9; border:1px dashed #0284c7; padding:16px; border-radius:6px; font-family:monospace; font-size:18px; font-weight:700; color:#0369a1; letter-spacing:1px; margin-bottom:20px;">
                {sample_key}
            </div>

            <p style="font-size:12px; color:var(--text-muted); margin-bottom:24px;">Lifetime License • No recurring fee • Multi-device sync enabled</p>
            <a href="/" class="btn btn-primary" style="width:100%;">Return to Home</a>
        </div>
    </body></html>
    """)

# API routes
@app.post("/api/license/verify")
def api_verify_license(req: LicenseCheckRequest):
    with get_connection() as conn:
        if req.product_key:
            key_row = conn.execute("SELECT * FROM product_keys WHERE key_code = ?", (req.product_key.strip(),)).fetchone()
            if key_row:
                if not key_row["is_used"]:
                    conn.execute("UPDATE product_keys SET is_used = 1, assigned_to_email = ?, used_at = CURRENT_TIMESTAMP WHERE id = ?", (req.email, key_row["id"]))
                    conn.execute("UPDATE users SET role = 'pro_user' WHERE email = ?", (req.email,))
                return {"valid": True, "plan": key_row["plan_type"], "message": "Product key activated successfully."}
            return {"valid": False, "message": "Invalid product key"}

        user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email.strip().lower(),)).fetchone()
        if user:
            if user["role"] in ("admin", "pro_user"):
                return {"valid": True, "plan": user["role"], "message": "Active Pro license"}
            if user["trial_end"]:
                today_str = datetime.now().strftime("%Y-%m-%d")
                if today_str <= user["trial_end"]:
                    return {"valid": True, "plan": "trial", "message": f"Trial active until {user['trial_end']}"}
            return {"valid": False, "plan": "expired", "message": "Trial expired. Continue offline or enter product key."}

    return {"valid": False, "message": "User not found."}

@app.post("/api/sync/telemetry")
def api_sync_telemetry(req: SyncTelemetryRequest):
    kb = (req.bytes_uploaded + req.bytes_downloaded) / 1024.0
    with get_connection() as conn:
        conn.execute("UPDATE users SET data_usage_kb = data_usage_kb + ? WHERE email = ?", (kb, req.email.strip().lower()))
        conn.execute("INSERT INTO sync_logs (user_email, payload_size_kb) VALUES (?, ?)", (req.email, kb))
    return {"status": "recorded", "kb_added": kb}
