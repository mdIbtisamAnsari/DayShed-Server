// src/utils/emailTemplate.js
export function getEmailTemplate(otpCode) {
    return `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, sans-serif;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f7; padding: 20px;">
                <tr>
                    <td align="center">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #4f46e5; padding: 30px; text-align: center; color: #ffffff;">
                                    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">DayShed</h1>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px; color: #333333;">
                                    <h2 style="margin-top: 0; font-size: 20px; color: #111827;">Verification Code</h2>
                                    <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
                                        Please use the following One-Time Password (OTP) to complete your registration or login. This code is valid for <strong>5 minutes</strong>.
                                    </p>
                                    <!-- OTP Box -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <span style="display: inline-block; background-color: #f3f4f6; color: #1f2937; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 15px 30px; border-radius: 6px; border: 1px solid #e5e7eb;">
                                            ${otpCode}
                                        </span>
                                    </div>
                                    <p style="font-size: 14px; line-height: 1.5; color: #6b7280; margin-bottom: 0;">
                                        If you didn't request this, you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                                    &copy; ${new Date().getFullYear()} DayShed. All rights reserved.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}
