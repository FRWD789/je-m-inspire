<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Liste des participants - {{ $event->name }}</title>
    <style>
        /* RESET & BASE */
        body {
            font-family: 'DejaVu Sans', Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* UTILITAIRES LAYOUT (Remplacent Flexbox pour compatibilité PDF) */
        .w-full { width: 100%; }
        .w-50 { width: 50%; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .align-top { vertical-align: top; }
        .mb-10 { margin-bottom: 10px; }
        .mb-20 { margin-bottom: 20px; }
        .mt-20 { margin-top: 20px; }

        /* COULEURS */
        .text-primary { color: #3C493F; }
        .bg-light { background-color: #f4f6f5; }

        /* HEADER */
        .header-table {
            border-bottom: 2px solid #3C493F;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .logo-placeholder {
            font-size: 24px;
            font-weight: bold;
            color: #3C493F;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .document-title {
            font-size: 18px;
            font-weight: bold;
            color: #3C493F;
            margin: 0;
        }
        .document-subtitle {
            font-size: 10px;
            color: #666;
            margin-top: 5px;
        }

        /* INFO BOXES */
        .info-table {
            margin-bottom: 20px;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #3C493F;
            padding: 12px;
            margin-right: 10px; /* Marge simulée */
        }
        .info-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #666;
            font-weight: bold;
            margin-bottom: 4px;
            display: block;
        }
        .info-value {
            font-size: 12px;
            font-weight: bold;
            color: #333;
        }

        /* STATS BAR (Clean version) */
        .stats-container {
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 10px 0;
            margin-bottom: 30px;
        }
        .stat-item {
            padding: 0 15px;
            border-right: 1px solid #e0e0e0;
        }
        .stat-item:last-child { border-right: none; }
        .stat-number {
            font-size: 16px;
            font-weight: bold;
            color: #3C493F;
        }
        .stat-desc {
            font-size: 9px;
            color: #777;
            text-transform: uppercase;
        }

        /* TABLEAU DE DONNÉES */
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        .data-table thead th {
            background-color: #3C493F;
            color: white;
            padding: 10px 8px;
            font-size: 10px;
            text-transform: uppercase;
            text-align: left;
        }
        .data-table tbody td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }
        /* Alternance de couleur subtile */
        .data-table tbody tr:nth-child(even) {
            background-color: #fdfdfd;
        }
        /* Important pour PDF : empêche de couper une ligne en deux entre deux pages */
        .data-table tr {
            page-break-inside: avoid;
        }

        /* BADGES */
        .badge {
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            display: inline-block; /* Nécessaire pour PDF */
        }
        .badge-stripe { background: #e8f0fe; color: #1967d2; border: 1px solid #d2e3fc; }
        .badge-paypal { background: #fff4e5; color: #b06000; border: 1px solid #fedfc8; }
        .badge-other { background: #f1f3f4; color: #5f6368; border: 1px solid #dadce0; }

        /* FOOTER & TOTAL */
        .total-row td {
            background-color: #f4f6f5;
            font-weight: bold;
            border-top: 2px solid #3C493F;
            color: #333;
        }

        .footer {
            position: fixed;
            bottom: -30px;
            left: 0px;
            right: 0px;
            height: 50px;
            font-size: 9px;
            color: #aaa;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }

        .page-break { page-break-after: always; }
    </style>
</head>
<body>

    <table class="w-full header-table">
        <tr>
            <td class="w-50 align-top">
                <div class="logo-placeholder">JE M'INSPIRE</div>
                <div style="font-size: 10px; color: #777; margin-top: 5px;">
                    Organisé par : {{ $organizer }}
                </div>
            </td>
            <td class="w-50 text-right align-top">
                <h1 class="document-title">LISTE DES PARTICIPANTS</h1>
                <p class="document-subtitle">Événement : {{ $event->name }}</p>
                <p class="document-subtitle">Généré le : {{ $generated_at }}</p>
            </td>
        </tr>
    </table>

    <table class="w-full info-table" cellspacing="0" cellpadding="0">
        <tr>
            <td class="w-50" style="padding-right: 10px;">
                <div class="info-box">
                    <span class="info-label">Début de l'événement</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($event->start_date)->format('d/m/Y à H:i') }}</span>
                </div>
            </td>
            <td class="w-50" style="padding-left: 10px;">
                <div class="info-box">
                    <span class="info-label">Lieu</span>
                    <span class="info-value">{{ $event->localisation->name ?? 'Non spécifié' }}</span>
                </div>
            </td>
        </tr>
    </table>

    <table class="w-full stats-container" cellspacing="0">
        <tr>
            <td class="text-center stat-item">
                <div class="stat-number">{{ $total_participants }}</div>
                <div class="stat-desc">Inscrits</div>
            </td>
            <td class="text-center stat-item">
                <div class="stat-number">{{ $event->capacity }}</div>
                <div class="stat-desc">Capacité</div>
            </td>
            <td class="text-center stat-item">
                <div class="stat-number">{{ number_format(($total_participants / ($event->capacity > 0 ? $event->capacity : 1)) * 100, 0) }}%</div>
                <div class="stat-desc">Remplissage</div>
            </td>
            <td class="text-center stat-item" style="border-right: none;">
                <div class="stat-number">{{ number_format($participants->sum(function($p) { return $p->paiement->total; }), 2) }} $</div>
                <div class="stat-desc">Total Revenus</div>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%; text-align: center;">#</th>
                <th style="width: 25%">Participant</th>
                <th style="width: 25%">Contact</th>
                <th style="width: 15%">Date Inscription</th>
                <th style="width: 10%" class="text-center">Méthode</th>
                <th style="width: 20%" class="text-right">Montant</th>
            </tr>
        </thead>
        <tbody>
            @foreach($participants as $index => $participant)
            <tr>
                <td class="text-center" style="color: #777;">{{ $index + 1 }}</td>
                <td>
                    <div style="font-weight: bold; color: #333;">{{ $participant->user->name }} {{ $participant->user->last_name }}</div>
                    <div style="font-size: 9px; color: #888;">ID: {{ $participant->id }}</div>
                </td>
                <td>
                    <div>{{ $participant->user->email }}</div>
                    @if($participant->user->phone)
                        <div style="font-size: 9px; color: #666;">📞 {{ $participant->user->phone }}</div>
                    @endif
                </td>
                <td>
                    {{ \Carbon\Carbon::parse($participant->created_at)->format('d/m/Y') }}
                    <div style="font-size: 9px; color: #888;">{{ \Carbon\Carbon::parse($participant->created_at)->format('H:i') }}</div>
                </td>
                <td class="text-center">
                    @if($participant->paiement->session_id)
                        <span class="badge badge-stripe">Stripe</span>
                    @elseif($participant->paiement->paypal_id)
                        <span class="badge badge-paypal">PayPal</span>
                    @else
                        <span class="badge badge-other">Autre</span>
                    @endif
                </td>
                <td class="text-right">
                    <span style="font-weight: bold;">{{ number_format($participant->paiement->total, 2) }} $</span>
                </td>
            </tr>
            @endforeach

            <tr class="total-row">
                <td colspan="5" class="text-right">TOTAL GÉNÉRAL</td>
                <td class="text-right">{{ number_format($participants->sum(function($p) { return $p->paiement->total; }), 2) }} $</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 50px; page-break-inside: avoid;">
        <table class="w-full">
            <tr>
                <td class="w-50">
                    <p style="font-size: 10px; font-weight: bold;">Notes / Commentaires :</p>
                    <div style="border-bottom: 1px solid #ccc; height: 20px; width: 90%; margin-bottom: 15px;"></div>
                    <div style="border-bottom: 1px solid #ccc; height: 20px; width: 90%;"></div>
                </td>
                <td class="w-50 text-center">
                    <p style="font-size: 10px; margin-bottom: 40px;">Signature de l'organisateur</p>
                    <div style="border-bottom: 1px solid #333; width: 60%; margin: 0 auto;"></div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Document confidentiel généré par Je m'inspire • Page <span class="page-number"></span>
    </div>


</body>
</html>
