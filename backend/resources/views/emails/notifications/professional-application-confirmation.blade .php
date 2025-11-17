@extends('emails.layouts.master')

@section('content')
    <div class="alert-success">
        <p class="content-text" style="margin: 0;">
            <strong>✅ Votre demande a bien été reçue</strong>
        </p>
    </div>

    <p class="content-text">
        Nous avons bien reçu votre demande d'inscription en tant que professionnel sur <strong>Je m'inspire</strong>.
    </p>

    <div class="highlight-box">
        <p class="content-text" style="margin: 0;">
            <strong>📋 Prochaines étapes :</strong>
        </p>
        <ul style="color: #3C493F; font-size: 16px; line-height: 1.8; margin: 10px 0 0 0; padding-left: 20px;">
            <li>Notre équipe va examiner votre candidature</li>
            <li>Vous recevrez un email de confirmation dans les prochains jours</li>
            <li>Une fois approuvé, vous pourrez accéder à toutes les fonctionnalités professionnelles</li>
        </ul>
    </div>

    <p class="content-text">
        Nous vous remercions de votre intérêt pour notre plateforme et nous vous contacterons très prochainement.
    </p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $loginUrl }}" class="button">
            Retour à l'accueil
        </a>
    </div>

    <p class="content-text" style="font-size: 14px; color: #929E83; text-align: center; margin-top: 30px;">
        Vous avez des questions ? Contactez-nous à <a href="mailto:{{ config('mail.from.address') }}" style="color: #60993E;">{{ config('mail.from.address') }}</a>
    </p>
@endsection
