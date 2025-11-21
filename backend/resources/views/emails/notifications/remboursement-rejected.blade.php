@extends('emails.layouts.master')

@section('content')
    <div class="alert-error">
        <p class="content-text" style="margin: 0;">
            <strong>❌ Votre demande de remboursement a été refusée</strong>
        </p>
    </div>

    <p class="content-text">
        Nous avons examiné votre demande de remboursement et malheureusement, nous ne pouvons pas y donner suite.
    </p>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        📋 Détails de la demande
    </h3>

    <div class="highlight-box">
        <div class="info-row">
            <span class="info-label">💵 Montant demandé</span>
            <span class="info-value">{{ number_format($amount, 2, ',', ' ') }} CAD</span>
        </div>
        <div class="info-row">
            <span class="info-label">📅 Date de traitement</span>
            <span class="info-value">{{ $processedDate }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">🔖 Numéro de demande</span>
            <span class="info-value">#{{ $refundId }}</span>
        </div>
    </div>

    @if(isset($event))
    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        📅 Événement concerné
    </h3>

    <div class="highlight-box">
        <div class="info-row">
            <span class="info-label">📌 Événement</span>
            <span class="info-value">{{ $event->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📅 Date prévue</span>
            <span class="info-value">{{ $event->start_date->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</span>
        </div>
    </div>
    @endif

    @if(!empty($commentaire))
    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        💬 Raison du refus
    </h3>

    <div class="highlight-box" style="background-color: #FEF2F2; border: 1px solid #FCA5A5;">
        <p class="content-text" style="margin: 0; color: #991B1B;">
            {{ $commentaire }}
        </p>
    </div>
    @endif

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        ℹ️ Que faire maintenant ?
    </h3>

    <div class="info-list">
        <div class="info-list-item">Vérifiez les conditions d'annulation de votre réservation</div>
        <div class="info-list-item">Consultez notre politique de remboursement</div>
        <div class="info-list-item">Si vous pensez qu'il y a une erreur, contactez notre support</div>
    </div>

    <div class="alert-info">
        <p class="content-text" style="margin: 0;">
            💡 <strong>Besoin d'aide ?</strong> Notre équipe est disponible pour répondre à vos questions et vous accompagner.
        </p>
    </div>

    <hr class="divider">

    <p class="content-text">
        Si vous souhaitez contester cette décision ou obtenir plus d'informations, n'hésitez pas à nous contacter.
    </p>

    <div class="button-container">
        <a href="{{ $contactUrl }}" class="button">💬 Contacter le support</a>
    </div>

    <p class="content-text" style="text-align: center; margin-top: 30px;">
        <strong>Merci de votre compréhension ! 🙏</strong>
    </p>
@endsection