"""
Brevo SMTP Email Service for Nyaya AI
Sends transactional emails for consultation payments and status updates.
"""
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
from typing import Optional

# Brevo SMTP Configuration (read from environment)
BREVO_SMTP_HOST = os.getenv("BREVO_SMTP_HOST", "smtp-relay.brevo.com")
BREVO_SMTP_PORT = int(os.getenv("BREVO_SMTP_PORT", "587"))
BREVO_SMTP_USER = os.getenv("BREVO_SMTP_USER", "")
BREVO_SMTP_PASS = os.getenv("BREVO_SMTP_PASS", "")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "noreply@nyayaai.com")
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Nyaya AI")

SUPER_ADMIN_EMAIL = "priyanshurai121111@gmail.com"
ADMIN_PHONE = "+91 75418 81152"
WHATSAPP_LINK = "https://wa.me/917541881152"


def _send_email(to_email: str, subject: str, html_body: str, attachment_path: Optional[str] = None) -> bool:
    """Core SMTP send function using Brevo."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{BREVO_SENDER_NAME} <{BREVO_SENDER_EMAIL}>"
        msg["To"] = to_email

        msg.attach(MIMEText(html_body, "html"))

        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, "rb") as f:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(f.read())
            encoders.encode_base64(part)
            fname = os.path.basename(attachment_path)
            part.add_header("Content-Disposition", f"attachment; filename={fname}")
            msg.attach(part)

        with smtplib.SMTP(BREVO_SMTP_HOST, BREVO_SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(BREVO_SMTP_USER, BREVO_SMTP_PASS)
            server.sendmail(BREVO_SENDER_EMAIL, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"[EMAIL_ERROR] Failed to send email to {to_email}: {e}")
        return False


def send_admin_new_payment_request(
    user_name: str,
    user_email: str,
    user_mobile: str,
    legal_issue: str,
    amount: float,
    utr_number: str,
    payment_id: str,
    screenshot_path: Optional[str],
    submitted_at: datetime,
) -> bool:
    """Send notification to admin when a new payment request is submitted."""
    ist_time = submitted_at.strftime("%d %b %Y, %I:%M %p") + " IST"
    subject = f"🔔 New Consultation Payment Request – {payment_id}"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><style>
      body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }}
      .card {{ background: #fff; border-radius: 16px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }}
      .header {{ background: linear-gradient(135deg, #FF9933, #FF6600); padding: 32px; text-align: center; color: #fff; }}
      .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; }}
      .header p {{ margin: 8px 0 0; opacity: 0.9; }}
      .body {{ padding: 32px; }}
      .row {{ display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }}
      .label {{ color: #64748b; font-size: 14px; font-weight: 600; }}
      .value {{ color: #0f172a; font-size: 14px; font-weight: 700; text-align: right; max-width: 60%; }}
      .badge {{ display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }}
      .btn {{ display: inline-block; background: #FF9933; color: #fff !important; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; margin: 8px; }}
      .footer {{ background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
    </style></head>
    <body>
      <div class="card">
        <div class="header">
          <h1>⚖️ New Payment Request</h1>
          <p>A user has submitted a consultation payment request</p>
        </div>
        <div class="body">
          <div class="row"><span class="label">Payment ID</span><span class="value" style="color:#FF9933;font-family:monospace">{payment_id}</span></div>
          <div class="row"><span class="label">Full Name</span><span class="value">{user_name}</span></div>
          <div class="row"><span class="label">Email</span><span class="value">{user_email}</span></div>
          <div class="row"><span class="label">Mobile</span><span class="value">{user_mobile}</span></div>
          <div class="row"><span class="label">Legal Issue</span><span class="value">{legal_issue}</span></div>
          <div class="row"><span class="label">Amount</span><span class="value" style="color:#16a34a;font-size:18px">₹{amount:.0f}</span></div>
          <div class="row"><span class="label">UTR Number</span><span class="value" style="font-family:monospace">{utr_number}</span></div>
          <div class="row"><span class="label">Status</span><span class="value"><span class="badge">⏳ Pending Verification</span></span></div>
          <div class="row"><span class="label">Submitted At</span><span class="value">{ist_time}</span></div>
          <br>
          <p style="color:#64748b;font-size:14px;text-align:center">Please log into the <strong>Admin Panel</strong> to verify or decline this payment.</p>
          <div style="text-align:center;margin-top:16px">
            <a class="btn" href="https://nyaya-ai.vercel.app/admin">Open Admin Panel →</a>
          </div>
        </div>
        <div class="footer">Nyaya AI · Legal Intelligence Platform · This is an automated notification.</div>
      </div>
    </body></html>
    """
    return _send_email(SUPER_ADMIN_EMAIL, subject, html, screenshot_path)


def send_user_payment_verified(
    user_email: str,
    user_name: str,
    payment_id: str,
    amount: float,
) -> bool:
    """Notify user that their payment was verified."""
    subject = "✅ Payment Verified – Your Consultation is Being Scheduled"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><style>
      body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }}
      .card {{ background: #fff; border-radius: 16px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }}
      .header {{ background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center; color: #fff; }}
      .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; }}
      .body {{ padding: 32px; }}
      .row {{ display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }}
      .label {{ color: #64748b; font-size: 14px; font-weight: 600; }}
      .value {{ color: #0f172a; font-size: 14px; font-weight: 700; }}
      .contact-box {{ background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; }}
      .btn {{ display: inline-block; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 15px; margin: 6px; }}
      .btn-phone {{ background: #1e40af; color: #fff !important; }}
      .btn-wa {{ background: #16a34a; color: #fff !important; }}
      .footer {{ background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
    </style></head>
    <body>
      <div class="card">
        <div class="header">
          <h1>✅ Payment Verified!</h1>
          <p>Great news, {user_name}! Your payment has been confirmed.</p>
        </div>
        <div class="body">
          <p style="color:#334155;font-size:15px">Your consultation request has been verified and our senior legal specialist will contact you shortly to schedule your session.</p>
          <div class="row"><span class="label">Payment ID</span><span class="value" style="color:#FF9933;font-family:monospace">{payment_id}</span></div>
          <div class="row"><span class="label">Amount Verified</span><span class="value" style="color:#16a34a">₹{amount:.0f}</span></div>
          <div class="row"><span class="label">Status</span><span class="value" style="color:#10b981">✅ Payment Verified</span></div>

          <div class="contact-box">
            <p style="margin:0 0 8px;color:#166534;font-weight:700;font-size:16px">📞 Contact Your Legal Specialist</p>
            <p style="margin:0 0 16px;color:#4b5563;font-size:14px">You can also reach us directly at:</p>
            <a class="btn btn-phone" href="tel:{ADMIN_PHONE}">📞 Call: {ADMIN_PHONE}</a>
            <a class="btn btn-wa" href="{WHATSAPP_LINK}">💬 WhatsApp Us</a>
          </div>

          <p style="color:#94a3b8;font-size:13px;text-align:center">Check your dashboard for real-time consultation updates.</p>
        </div>
        <div class="footer">Nyaya AI · Legal Intelligence Platform · © {datetime.now().year}</div>
      </div>
    </body></html>
    """
    return _send_email(user_email, subject, html)


def send_user_payment_declined(
    user_email: str,
    user_name: str,
    payment_id: str,
    reason: str,
) -> bool:
    """Notify user that their payment was declined."""
    subject = "❌ Payment Could Not Be Verified – Action Required"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><style>
      body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }}
      .card {{ background: #fff; border-radius: 16px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }}
      .header {{ background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px; text-align: center; color: #fff; }}
      .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; }}
      .body {{ padding: 32px; }}
      .reason-box {{ background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 0; }}
      .btn {{ display: inline-block; background: #FF9933; color: #fff !important; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; }}
      .footer {{ background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
    </style></head>
    <body>
      <div class="card">
        <div class="header">
          <h1>❌ Payment Declined</h1>
          <p>We could not verify your payment for {payment_id}</p>
        </div>
        <div class="body">
          <p style="color:#334155;font-size:15px">Dear {user_name}, we regret to inform you that your payment verification was unsuccessful.</p>
          <div class="reason-box">
            <p style="margin:0 0 4px;color:#b91c1c;font-weight:700">Reason:</p>
            <p style="margin:0;color:#7f1d1d">{reason}</p>
          </div>
          <p style="color:#334155;font-size:15px">Please resubmit your request with the correct payment details. If you believe this is an error, contact us on WhatsApp.</p>
          <div style="text-align:center;margin-top:24px">
            <a class="btn" href="https://nyaya-ai.vercel.app/consultation">Resubmit Request</a>
          </div>
        </div>
        <div class="footer">Nyaya AI · Legal Intelligence Platform · © {datetime.now().year}</div>
      </div>
    </body></html>
    """
    return _send_email(user_email, subject, html)


def send_user_consultation_scheduled(
    user_email: str,
    user_name: str,
    payment_id: str,
    consultation_id: str,
    scheduled_date: str,
    scheduled_time: str,
    meeting_mode: str,
) -> bool:
    """Notify user when consultation is scheduled."""
    mode_icon = {"PHONE": "📞", "WHATSAPP": "💬", "GOOGLE_MEET": "🎥"}.get(meeting_mode, "📞")
    mode_label = {"PHONE": "Phone Call", "WHATSAPP": "WhatsApp Call", "GOOGLE_MEET": "Google Meet"}.get(meeting_mode, "Phone Call")
    subject = f"📅 Your Legal Consultation is Scheduled – {consultation_id}"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><style>
      body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }}
      .card {{ background: #fff; border-radius: 16px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }}
      .header {{ background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 32px; text-align: center; color: #fff; }}
      .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; }}
      .body {{ padding: 32px; }}
      .detail-grid {{ background: #f8fafc; border-radius: 16px; padding: 24px; margin: 20px 0; display: grid; gap: 16px; }}
      .detail-item {{ display: flex; align-items: center; gap: 12px; }}
      .detail-icon {{ font-size: 24px; }}
      .detail-text p {{ margin: 0; }}
      .detail-label {{ color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; }}
      .detail-value {{ color: #0f172a; font-size: 16px; font-weight: 800; }}
      .contact-box {{ background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; }}
      .btn {{ display: inline-block; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 15px; margin: 6px; }}
      .btn-phone {{ background: #1e40af; color: #fff !important; }}
      .btn-wa {{ background: #16a34a; color: #fff !important; }}
      .footer {{ background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
    </style></head>
    <body>
      <div class="card">
        <div class="header">
          <h1>📅 Consultation Scheduled!</h1>
          <p>Your legal consultation has been confirmed, {user_name}</p>
        </div>
        <div class="body">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-icon">📋</div>
              <div class="detail-text">
                <p class="detail-label">Consultation ID</p>
                <p class="detail-value" style="color:#6366f1;font-family:monospace">{consultation_id}</p>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">📅</div>
              <div class="detail-text">
                <p class="detail-label">Date</p>
                <p class="detail-value">{scheduled_date}</p>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">🕐</div>
              <div class="detail-text">
                <p class="detail-label">Time</p>
                <p class="detail-value">{scheduled_time} IST</p>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">{mode_icon}</div>
              <div class="detail-text">
                <p class="detail-label">Meeting Mode</p>
                <p class="detail-value">{mode_label}</p>
              </div>
            </div>
          </div>

          <div class="contact-box">
            <p style="margin:0 0 8px;color:#166534;font-weight:700;font-size:16px">📞 Can't make it? Contact us</p>
            <a class="btn btn-phone" href="tel:{ADMIN_PHONE}">📞 {ADMIN_PHONE}</a>
            <a class="btn btn-wa" href="{WHATSAPP_LINK}">💬 WhatsApp</a>
          </div>
        </div>
        <div class="footer">Nyaya AI · Legal Intelligence Platform · © {datetime.now().year}</div>
      </div>
    </body></html>
    """
    return _send_email(user_email, subject, html)


def send_user_consultation_completed(
    user_email: str,
    user_name: str,
    consultation_id: str,
) -> bool:
    """Notify user that consultation is complete."""
    subject = f"✅ Consultation Completed – {consultation_id}"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><style>
      body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }}
      .card {{ background: #fff; border-radius: 16px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }}
      .header {{ background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 32px; text-align: center; color: #fff; }}
      .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; }}
      .body {{ padding: 32px; }}
      .btn {{ display: inline-block; background: #FF9933; color: #fff !important; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; }}
      .footer {{ background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
    </style></head>
    <body>
      <div class="card">
        <div class="header">
          <h1>✅ Consultation Complete</h1>
          <p>Your legal consultation session has been completed</p>
        </div>
        <div class="body">
          <p style="color:#334155;font-size:15px">Dear {user_name}, thank you for choosing Nyaya AI for your legal needs. Your consultation session <strong style="color:#FF9933">{consultation_id}</strong> has been marked as completed.</p>
          <p style="color:#334155;font-size:15px">We hope our legal specialist was able to address your concerns. If you need further assistance, you can book another consultation anytime.</p>
          <div style="text-align:center;margin:24px 0">
            <a class="btn" href="https://nyaya-ai.vercel.app/consultation">Book Another Consultation</a>
          </div>
          <p style="color:#94a3b8;font-size:13px;text-align:center">Need urgent help? Reach us on WhatsApp: <a href="{WHATSAPP_LINK}" style="color:#16a34a">{ADMIN_PHONE}</a></p>
        </div>
        <div class="footer">Nyaya AI · Legal Intelligence Platform · © {datetime.now().year}</div>
      </div>
    </body></html>
    """
    return _send_email(user_email, subject, html)
