@extends('emails.layouts.master')

@section('content')
    <div class="alert-info">
        <p class="content-text" style="margin: 0;">
            <strong>📨 Nouvelle demande de réactivation de compte reçue</strong>
        </p>
    </div>

    <p class="content-text">
        Bonjour l'équipe administrative,
    </p>

    <p class="content-text">
        Un utilisateur a soumis une demande de réactivation de compte. Veuillez examiner les détails ci-dessous.
    </p>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        👤 Informations de l'utilisateur
    </h3>

    <div class="highlight-box">
        <div class="info-row">
            <span class="info-label">👤 Nom complet</span>
            <span class="info-value">{{ $user->name }} {{ $user->last_name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📧 Email</span>
            <span class="info-value">{{ $user->email }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📅 Date de désactivation</span>
            <span class="info-value">{{ $deactivatedAt }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">🕐 Dernière connexion</span>
            <span class="info-value">{{ $lastLogin }}</span>
        </div>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        💬 Raison de la demande
    </h3>

    <div class="highlight-box">
        <p class="content-text" style="margin: 0; white-space: pre-wrap;">{{ $reason }}</p>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        ⚡ Actions à effectuer
    </h3>

    <div class="info-list">
        <div class="info-list-item">Vérifier l'historique du compte utilisateur</div>
        <div class="info-list-item">Examiner la raison fournie</div>
        <div class="info-list-item">Décider d'approuver ou refuser la réactivation</div>
        <div class="info-list-item">Notifier l'utilisateur de la décision</div>
    </div>

    <div class="button-container">
        <a href="{{ $adminUrl }}" class="button">🔧 Accéder au panneau d'administration</a>
    </div>

    <p class="content-text" style="font-size: 14px; color: #929E83; text-align: center;">
        Cet email a été généré automatiquement par le système de gestion des comptes.
    </p>
@endsection