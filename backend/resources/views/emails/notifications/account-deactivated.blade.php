@extends('emails.layouts.master')

@section('content')
    <div class="alert-warning">
        <p class="content-text" style="margin: 0;">
            <strong>⚠️ Votre compte a été désactivé pour inactivité</strong>
        </p>
    </div>

    <p class="content-text">
        Nous vous informons que votre compte a été désactivé en raison d'une période d'inactivité prolongée.
    </p>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        📊 Détails de l'inactivité
    </h3>

    <div class="highlight-box">
        <div class="info-row">
            <span class="info-label">🕐 Dernière connexion</span>
            <span class="info-value">{{ $lastLogin }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">⏱️ Durée d'inactivité</span>
            <span class="info-value">{{ $daysInactive }} jours</span>
        </div>
        <div class="info-row">
            <span class="info-label">🚫 Seuil de désactivation</span>
            <span class="info-value">90 jours</span>
        </div>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        🔄 Comment réactiver votre compte ?
    </h3>

    <p class="content-text">
        Pour réactiver votre compte, veuillez nous contacter à l'adresse suivante :
    </p>

    <div class="highlight-box">
        <p class="content-text" style="margin: 0; text-align: center;">
            <strong style="color: #60993E; font-size: 18px;">📧 {{ $contactEmail }}</strong>
        </p>
    </div>

    <p class="content-text">
        Notre équipe traitera votre demande de réactivation dans les plus brefs délais.
    </p>

    <div class="info-list">
        <div class="info-list-item">Précisez votre nom complet et adresse email</div>
        <div class="info-list-item">Indiquez la raison de votre demande de réactivation</div>
        <div class="info-list-item">Nous vous répondrons sous 48 heures ouvrées</div>
    </div>

    <hr class="divider">

    <p class="content-text" style="font-size: 14px; color: #929E83;">
        Si vous ne souhaitez plus utiliser notre plateforme, aucune action n'est requise. Vos données seront conservées conformément à notre politique de confidentialité.
    </p>
@endsection