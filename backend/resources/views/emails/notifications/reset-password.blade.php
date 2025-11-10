@extends('emails.layouts.master')

@section('content')
    <p class="content-text">
        Vous recevez cet email car nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.
    </p>

    <div class="button-container">
        <a href="{{ $url }}" class="button">🔐 Réinitialiser mon mot de passe</a>
    </div>

    <div class="alert-warning">
        <p class="content-text" style="margin: 0;">
            ⏰ <strong>Ce lien expirera dans {{ $count ?? 60 }} minutes.</strong>
        </p>
    </div>

    <p class="content-text">
        Si vous n'avez pas demandé de réinitialisation de mot de passe, aucune action supplémentaire n'est requise de votre part.
    </p>

    <hr class="divider">

    <div class="highlight-box">
        <p class="content-text" style="margin: 0 0 10px 0;">
            <strong>🔒 Conseils de sécurité :</strong>
        </p>
        <div class="info-list" style="background-color: transparent; padding: 0;">
            <div class="info-list-item">Utilisez un mot de passe unique et complexe</div>
            <div class="info-list-item">Combinez lettres majuscules, minuscules, chiffres et symboles</div>
            <div class="info-list-item">Ne réutilisez jamais un ancien mot de passe</div>
            <div class="info-list-item">Ne partagez jamais votre mot de passe</div>
        </div>
    </div>

    <p class="content-text" style="font-size: 14px; color: #929E83;">
        Si vous rencontrez des difficultés, n'hésitez pas à contacter notre support.
    </p>
@endsection