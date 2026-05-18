import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import nodemailer from 'nodemailer';
import asyncHandler from '../middleware/asyncHandler.js';
import crypto from 'crypto'; // For generating unique request IDs

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    logger: false, // Set to false in production to keep logs clean
    debug: false,
});

transporter.verify((err, success) => {
    if (err) {
        console.error("❌ SMTP VERIFY ERROR:", err.message);
    } else {
        console.log("✔ SMTP READY: Quantum Secure Tunnel Established");
    }
});

export const sendVerificationEmail = asyncHandler(async (email, otp) => {
    console.log(`📤 Dispatching Quantum Authentication Key to ${email}...`);

    // Generate a unique tracking ID for a professional touch
    const requestId = crypto.randomBytes(3).toString('hex').toUpperCase();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: 0; padding: 0; background-color: #050a0f; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            .wrapper { width: 100%; background-color: #050a0f; padding: 30px 0; }
            .main-card { 
                max-width: 500px; 
                margin: 0 auto; 
                background: #0d1117; 
                border: 1px solid #30363d; 
                border-radius: 12px; 
                overflow: hidden;
            }
            .header-img { width: 100%; height: 180px; object-fit: cover; border-bottom: 2px solid #00d4ff; }
            .content { padding: 30px; text-align: center; }
            .badge { 
                display: inline-block; padding: 4px 12px; background: rgba(0, 212, 255, 0.1); 
                color: #00d4ff; border: 1px solid #00d4ff; border-radius: 20px; 
                font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px;
            }
            .title { color: #ffffff; font-size: 22px; margin: 0 0 10px 0; }
            .otp-box { 
                margin: 25px 0; padding: 20px; background: #161b22; 
                border-radius: 8px; border: 1px dashed #30363d;
            }
            .otp-code { 
                font-family: 'Courier New', monospace; font-size: 36px; 
                font-weight: bold; color: #00d4ff; letter-spacing: 10px; 
            }
            .footer { padding: 20px; text-align: center; color: #484f58; font-size: 11px; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="main-card">
                <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600" class="header-img">
                <div class="content">
                    <div class="badge">Quantum-Safe Protocol</div>
                    <h1 class="title">Verification Required</h1>
                    <p style="color: #8b949e; font-size: 14px;">Use the following key to verify your identity on the <b>Quantum Job Tracker</b> dashboard.</p>
                    
                    <div class="otp-box">
                        <div class="otp-code">${otp}</div>
                    </div>

                    <p style="color: #6e7681; font-size: 12px;">Valid for 10 minutes | ID: QS-${requestId}</p>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 IBM Quantum Hackathon Project <br>
                Automated System - Please do not reply.
            </div>
        </div>
    </body>
    </html>`;

    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: `[SECURE] Verification Code: ${otp}`,
        text: `Your Quantum Verification Code is: ${otp} (Request ID: QS-${requestId})`, // Fallback for simple devices
        html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📬 QUANTUM EMAIL DISPATCHED → ID:", info.messageId);
    return info;
});