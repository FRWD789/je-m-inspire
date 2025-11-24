<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liste des participants - {{ $event->name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.5;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3C493F;
        }

        .header h1 {
            font-size: 22px;
            color: #3C493F;
            margin-bottom: 10px;
            font-weight: bold;
        }

        .header .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }

        .event-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #3C493F;
        }

        .event-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }

        .event-info-label {
            font-weight: bold;
            color: #3C493F;
            width: 40%;
        }

        .event-info-value {
            color: #555;
            width: 60%;
        }

        .stats-row {
            display: flex;
            justify-content: space-around;
            margin-bottom: 25px;
            gap: 15px;
        }

        .stat-card {
            flex: 1;
            text-align: center;
            padding: 15px;
            background: linear-gradient(135deg, #3C493F 0%, #2a3529 100%);
            color: white;
            border-radius: 8px;
        }

        .stat-number {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 11px;
            opacity: 0.9;
        }

        .table-container {
            margin-top: 20px;
        }

        .table-title {
            font-size: 16px;
            font-weight: bold;
            color: #3C493F;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 2px solid #3C493F;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        thead {
            background-color: #3C493F;
            color: white;
        }

        th {
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }

        tbody tr {
            border-bottom: 1px solid #e0e0e0;
        }

        tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        tbody tr:hover {
            background-color: #f0f0f0;
        }

        td {
            padding: 10px 8px;
            font-size: 10px;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
        }

        .badge-stripe {
            background-color: #5469d4;
            color: white;
        }

        .badge-paypal {
            background-color: #ffc439;
            color: #003087;
        }

        .badge-other {
            background-color: #95a5a6;
            color: white;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            color: #999;
            font-size: 9px;
        }

        .signature-section {
            margin-top: 50px;
            padding: 20px;
            border: 2px dashed #ccc;
            border-radius: 8px;
        }

        .signature-box {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }

        .signature-item {
            width: 45%;
            text-align: center;
        }

        .signature-line {
            border-top: 2px solid #333;
            margin-top: 40px;
            padding-top: 8px;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <!-- En-tête -->
    <div class="header">
        <h1>📋 Liste des Participants</h1>
        <p class="subtitle">{{ $event->name }}</p>
        <p class="subtitle" style="font-size: 11px; color: #999;">Généré le {{ $generated_at }}</p>
    </div>

    <!-- Informations sur l'événement -->
    <div class="event-info">
        <div class="event-info-row">
            <span class="event-info-label">📅 Date de début:</span>
            <span class="event-info-value">{{ \Carbon\Carbon::parse($event->start_date)->format('d/m/Y à H:i') }}</span>
        </div>
        <div class="event-info-row">
            <span class="event-info-label">📅 Date de fin:</span>
            <span class="event-info-value">{{ \Carbon\Carbon::parse($event->end_date)->format('d/m/Y à H:i') }}</span>
        </div>
        <div class="event-info-row">
            <span class="event-info-label">📍 Lieu:</span>
            <span class="event-info-value">{{ $event->localisation->name ?? 'Non spécifié' }}</span>
        </div>
        <div class="event-info-row">
            <span class="event-info-label">🎯 Catégorie:</span>
            <span class="event-info-value">{{ $event->categorie->name ?? 'Non spécifiée' }}</span>
        </div>
        <div class="event-info-row">
            <span class="event-info-label">👤 Organisateur:</span>
            <span class="event-info-value">{{ $organizer }}</span>
        </div>
    </div>

    <!-- Statistiques -->
    <div class="stats-row">
        <div class="stat-card">
            <div class="stat-number">{{ $total_participants }}</div>
            <div class="stat-label">Participants inscrits</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{{ $event->capacity }}</div>
            <div class="stat-label">Capacité maximale</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{{ number_format(($total_participants / $event->capacity) * 100, 0) }}%</div>
            <div class="stat-label">Taux de remplissage</div>
        </div>
    </div>

    <!-- Table des participants -->
    <div class="table-container">
        <div class="table-title">👥 Liste complète des participants</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 5%">#</th>
                    <th style="width: 25%">Nom complet</th>
                    <th style="width: 25%">Email</th>
                    <th style="width: 15%">Téléphone</th>
                    <th style="width: 15%" class="text-right">Montant payé</th>
                    <th style="width: 10%" class="text-center">Méthode</th>
                    <th style="width: 15%">Date réservation</th>
                </tr>
            </thead>
            <tbody>
                @foreach($participants as $index => $participant)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $participant->user->name }} {{ $participant->user->last_name }}</strong>
                    </td>
                    <td>{{ $participant->user->email }}</td>
                    <td>{{ $participant->user->phone ?? 'N/A' }}</td>
                    <td class="text-right">
                        <strong>{{ number_format($participant->paiement->total, 2) }} $</strong>
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
                    <td>{{ \Carbon\Carbon::parse($participant->created_at)->format('d/m/Y H:i') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Totaux -->
    <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span><strong>Total des paiements reçus:</strong></span>
            <span><strong>{{ number_format($participants->sum(function($p) { return $p->paiement->total; }), 2) }} $</strong></span>
        </div>
    </div>

    <!-- Section signature (optionnelle) -->
    <div class="signature-section">
        <p style="font-weight: bold; margin-bottom: 10px;">📝 Attestation de présence</p>
        <p style="font-size: 10px; color: #666;">Ce document peut servir d'attestation de présence pour l'événement.</p>

        <div class="signature-box">
            <div class="signature-item">
                <p style="font-size: 10px; color: #666; margin-bottom: 5px;">Organisateur</p>
                <div class="signature-line">
                    <p style="font-size: 10px;">{{ $organizer }}</p>
                </div>
            </div>
            <div class="signature-item">
                <p style="font-size: 10px; color: #666; margin-bottom: 5px;">Date</p>
                <div class="signature-line">
                    <p style="font-size: 10px;">{{ now()->format('d/m/Y') }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Pied de page -->
    <div class="footer">
        <p>Document généré automatiquement par Je m'inspire</p>
        <p>Ce document est confidentiel et destiné uniquement à l'organisateur de l'événement</p>
    </div>
</body>
</html>
