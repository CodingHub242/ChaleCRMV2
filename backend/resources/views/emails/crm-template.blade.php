<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>{{ $subject }}</title>
    <style>
        /* Reset styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        
        /* Remove default margin/padding */
        body { margin: 0; padding: 0; }
        
        /* iOS blue link removal */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        
        /* Gmail link removal */
        u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }
        
        /* Outlook fix */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }
            .fluid {
                max-width: 100% !important;
                height: auto !important;
            }
            .stack-column {
                display: block !important;
                width: 100% !important;
                box-sizing: border-box;
            }
            .padding-20 {
                padding: 20px !important;
            }
            .padding-30 {
                padding: 30px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    
    <!-- Preheader (hidden text) -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">
        {{ $subject }}
    </div>
    
    <!-- Email Wrapper -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" id="body" style="background-color: #f4f6f8; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                
                <!-- Email Container -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #073336 0%, #0a4a47 100%); padding: 30px; text-align: center;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <!-- Logo/Brand -->
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
                                            {{ $senderName }}
                                        </h1>
                                        @if($templateName)
                                        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 13px;">
                                            {{ $templateName }}
                                        </p>
                                        @endif
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="padding-30" style="padding: 40px 30px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                
                                <!-- Subject Line -->
                                <tr>
                                    <td style="padding-bottom: 25px; border-bottom: 1px solid #e8eaed;">
                                        <h2 style="margin: 0; color: #1a1a2e; font-size: 22px; font-weight: 600; line-height: 1.3;">
                                            {{ $subject }}
                                        </h2>
                                    </td>
                                </tr>
                                
                                <!-- Body Content -->
                                <tr>
                                    <td style="padding-top: 25px;">
                                        <div style="color: #333333; font-size: 16px; line-height: 1.7; word-wrap: break-word;">
                                            {!! $body !!}
                                        </div>
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Call to Action (if contains CTA link) -->
                    @if(str_contains($body, '<a ') && str_contains($body, 'href='))
                    <tr>
                        <td class="padding-30" style="padding: 0 30px 30px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #e09027 0%, #f5a623 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                                            View Details →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    @endif
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e8eaed;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 15px;">
                                        <!-- Social Links -->
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #073336; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; text-decoration: none; font-size: 14px;">🌐</a>
                                                </td>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #073336; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; text-decoration: none; font-size: 14px;">📧</a>
                                                </td>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #073336; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; text-decoration: none; font-size: 14px;">📱</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0; color: #888888; font-size: 12px; line-height: 1.6;">
                                            You're receiving this email because you're a valued customer.
                                        </p>
                                        <p style="margin: 8px 0 0; color: #888888; font-size: 12px; line-height: 1.6;">
                                            © {{ date('Y') }} {{ $senderName }}. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 15px;">
                                        <p style="margin: 0;">
                                            <a href="#" style="color: #e09027; text-decoration: underline; font-size: 12px; margin: 0 8px;">View in Browser</a>
                                            <span style="color: #cccccc; margin: 0 4px;">|</span>
                                            <a href="#" style="color: #e09027; text-decoration: underline; font-size: 12px; margin: 0 8px;">Unsubscribe</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
                
                <!-- Bottom Spacing -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td height="40" style="font-size: 0; line-height: 0;">
                            &nbsp;
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
