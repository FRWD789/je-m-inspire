@extends('emails.layouts.master')

@section('content')
    <div class="alert-success">
        <p class="content-text" style="margin: 0; font-size: 18px;">
            <strong>🎉 Félicitations ! Votre compte professionnel a été approuvé</strong>
        </p>
    </div>

    <p class="content-text">
        Excellente nouvelle ! Votre demande d'inscription en tant que <strong>professionnel</strong> a été examinée et approuvée par notre équipe.
    </p>

    <p class="content-text">
        Vous pouvez maintenant accéder à toutes les fonctionnalités professionnelles de notre plateforme.
    </p>

    <div class="button-container">
        <a href="{{ $loginUrl }}" class="button">🚀 Accéder à mon compte</a>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        ✨ Ce que vous pouvez faire maintenant
    </h3>

    <div class="info-list">
        <div class="info-list-item">Créer et publier vos événements</div>
        <div class="info-list-item">Gérer vos participants et réservations</div>
        <div class="info-list-item">Configurer vos moyens de paiement (Stripe, PayPal)</div>
        <div class="info-list-item">Accéder aux statistiques et rapports</div>
        <div class="info-list-item">Personnaliser votre profil professionnel</div>
        <div class="info-list-item">Recevoir vos paiements directement</div>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        🎯 Prochaines étapes recommandées
    </h3>

    <div class="highlight-box">
        <p class="content-text" style="margin: 0 0 15px 0;">
            <strong>1. Complétez votre profil professionnel</strong><br>
            <span style="color: #929E83; font-size: 14px;">Ajoutez une description, vos compétences et votre photo de profil</span>
        </p>

        <p class="content-text" style="margin: 15px 0;">
            <strong>2. Configurez vos paiements</strong><br>
            <span style="color: #929E83; font-size: 14px;">Liez votre compte Stripe ou PayPal pour recevoir vos revenus</span>
        </p>

        <p class="content-text" style="margin: 15px 0 0 0;">
            <strong>3. Créez votre premier événement</strong><br>
            <span style="color: #929E83; font-size: 14px;">Commencez à partager votre passion avec la communauté</span>
        </p>
    </div>

    <div class="button-container">
        <a href="{{ $dashboardUrl }}" class="button button-secondary">📊 Mon tableau de bord</a>
    </div>

    <hr class="divider">

    <div class="alert-info">
        <p class="content-text" style="margin: 0;">
            💡 <strong>Besoin d'aide ?</strong> Consultez notre guide professionnel ou contactez notre support dédié.
        </p>
    </div>

    <p class="content-text" style="text-align: center; font-size: 18px; margin-top: 30px;">
        <strong>Bienvenue dans notre communauté de professionnels ! 🌟</strong>
    </p>
@endsection