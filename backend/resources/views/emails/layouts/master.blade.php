<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $subject ?? config('app.name') }}</title>
    <style>
        /* Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

        /* Fonts fallback */
        * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; }

        /* Colors from frontend */
        .email-container { max-width: 600px; margin: 0 auto; background-color: #E5DDCE; }
        .email-header { background-color: #3C493F; padding: 30px 20px; text-align: center; }
        .logo { max-width: 180px; height: auto; }
        .email-body { background-color: #FFFFFF; padding: 40px 30px; }

        .greeting {
            color: #3C493F;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 20px 0;
            line-height: 1.3;
        }

        .content-text {
            color: #3C493F;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 15px 0;
        }

        .highlight-box {
            background-color: #E5DDCE;
            border-left: 4px solid #60993E;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .info-row {
            padding: 12px 0;
            border-bottom: 1px solid #E5DDCE;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-label {
            color: #929E83;
            font-size: 14px;
            font-weight: 600;
            display: block;
            margin-bottom: 5px;
        }

        .info-value {
            color: #3C493F;
            font-size: 15px;
            font-weight: 600;
            display: block;
        }

        /* Button */
        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .button {
            display: inline-block;
            padding: 16px 40px;
            background-color: #60993E;
            color: #FFFFFF !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
        }

        .button:hover {
            background-color: #4d7a32 !important;
        }

        .button-secondary {
            background-color: #3C493F;
        }

        .button-secondary:hover {
            background-color: #2d3730 !important;
        }

        /* Divider */
        .divider {
            border: 0;
            border-top: 2px solid #E5DDCE;
            margin: 30px 0;
        }

        /* List */
        .info-list {
            background-color: #F9F8F6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .info-list-item {
            color: #3C493F;
            font-size: 15px;
            line-height: 1.8;
            margin: 8px 0;
            padding-left: 25px;
            position: relative;
        }

        .info-list-item:before {
            content: "•";
            color: #60993E;
            font-weight: bold;
            font-size: 18px;
            position: absolute;
            left: 5px;
        }

        /* Alert boxes */
        .alert-success {
            background-color: #E8F5E9;
            border-left: 4px solid #60993E;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .alert-warning {
            background-color: #FFF3E0;
            border-left: 4px solid #FF9800;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .alert-info {
            background-color: #E3F2FD;
            border-left: 4px solid #2196F3;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        /* Footer */
        .email-footer {
            background-color: #3C493F;
            padding: 30px 20px;
            text-align: center;
        }

        .footer-text {
            color: #E5DDCE;
            font-size: 14px;
            line-height: 1.6;
            margin: 10px 0;
        }

        .footer-link {
            color: #60993E;
            text-decoration: none;
        }

        .footer-link:hover {
            color: #4d7a32;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-body { padding: 30px 20px !important; }
            .greeting { font-size: 20px !important; }
            .content-text { font-size: 15px !important; }
            .button { padding: 14px 30px !important; font-size: 15px !important; display: block !important; }
            .highlight-box { padding: 15px !important; }
            .info-list { padding: 15px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #E5DDCE;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #E5DDCE;">
        <tr>
            <td style="padding: 20px 10px;">
                <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" align="center" width="600">

                    <!-- Header -->
                    <tr>
                        <td class="email-header">
                            <img src="{{ $logoUrl ?? config('app.url') . '/assets/img/logo-white.png' }}" alt="{{ config('app.name') }}" class="logo">
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td class="email-body">
                            @if(isset($greeting))
                            <h1 class="greeting">{!! $greeting !!}</h1>
                            @endif

                            @yield('content')
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="email-footer">
                            <p class="footer-text">
                                © {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.
                            </p>
                            <p class="footer-text">
                                Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
                            </p>
                            <p class="footer-text">
                                Des questions ? <a href="{{ config('app.url') }}/contact" class="footer-link">Contactez-nous</a>
                            </p>

                            @if(isset($unsubscribeUrl))
                            <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
                                <a href="{{ $unsubscribeUrl }}" class="footer-link">Se désabonner</a>
                            </p>
                            @endif
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>