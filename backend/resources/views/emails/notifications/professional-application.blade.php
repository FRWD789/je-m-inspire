@extends('emails.layouts.master')

@section('content')
    <div class="alert-info">
        <p class="content-text" style="margin: 0;">
            <strong>📨 Nouvelle demande d'inscription professionnelle reçue</strong>
        </p>
    </div>

    <p class="content-text">
        Bonjour l'équipe administrative,
    </p>

    <p class="content-text">
        Un utilisateur a soumis une demande pour devenir professionnel sur la plateforme. Veuillez examiner les détails ci-dessous.
    </p>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        👤 Informations du candidat
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
        @if($user->phone)
        <div class="info-row">
            <span class="info-label">📱 Téléphone</span>
            <span class="info-value">{{ $user->phone }}</span>
        </div>
        @endif
        <div class="info-row">
            <span class="info-label">📅 Date d'inscription</span>
            <span class="info-value">{{ $user->created_at->locale('fr')->isoFormat('D MMMM YYYY') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📅 Date de la demande</span>
            <span class="info-value">{{ now()->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</span>
        </div>
    </div>

    @if(isset($motivation) && $motivation)
    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        💬 Motivation du candidat
    </h3>

    <div class="highlight-box">
        <p class="content-text" style="margin: 0; white-space: pre-wrap;">{{ $motivation }}</p>
    </div>
    @endif

    @if(isset($experience) && $experience)
    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        🎯 Expérience
    </h3>

    <div class="highlight-box">
        <p class="content-text" style="margin: 0; white-space: pre-wrap;">{{ $experience }}</p>
    </div>
    @endif

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        ⚡ Actions à effectuer
    </h3>

    <div class="info-list">
        <div class="info-list-item">Examiner le profil complet de l'utilisateur</div>
        <div class="info-list-item">Vérifier les informations fournies</div>
        <div class="info-list-item">Évaluer la motivation et l'expérience</div>
        <div class="info-list-item">Approuver ou refuser la demande avec justification</div>
    </div>

    <div class="alert-warning">
        <p class="content-text" style="margin: 0;">
            ⏰ <strong>Rappel :</strong> Merci de traiter cette demande dans un délai de 48-72 heures.
        </p>
    </div>

    <p class="content-text" style="font-size: 14px; color: #929E83; text-align: center; margin-top: 30px;">
        Cet email a été généré automatiquement par le système de gestion des candidatures.
    </p>
@endsection
