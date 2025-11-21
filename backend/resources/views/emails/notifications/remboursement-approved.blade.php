@extends('emails.layouts.master')

@section('content')
    <div class="alert-success">
        <p class="content-text" style="margin: 0;">
            <strong>✅ Votre remboursement a été approuvé</strong>
        </p>
    </div>

    <p class="content-text">
        Bonne nouvelle ! Votre demande de remboursement a été approuvée et le montant sera crédité sur votre compte.
    </p>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        💰 Détails du remboursement
    </h3>

    <div class="highlight-box">
        <div class="info-row">
            <span class="info-label">💵 Montant remboursé</span>
            <span class="info-value">{{ number_format($amount, 2, ',', ' ') }} CAD</span>
        </div>
        <div class="info-row">
            <span class="info-label">📅 Date de traitement</span>
            <span class="info-value">{{ $processedDate }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">🔖 Numéro de remboursement</span>
            <span class="info-value">#{{ $refundId }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">💳 Méthode de remboursement</span>
            <span class="info-value">{{ $paymentMethod }}</span>
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
        💬 Commentaire de l'administrateur
    </h3>

    <div class="highlight-box">
        <p class="content-text" style="margin: 0; font-style: italic;">
            "{{ $commentaire }}"
        </p>
    </div>
    @endif

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        ⏰ Délai de réception
    </h3>

    <div class="info-list">
        <div class="info-list-item"><strong>Carte bancaire :</strong> 5 à 10 jours ouvrables</div>
        <div class="info-list-item"><strong>PayPal :</strong> 1 à 3 jours ouvrables</div>
        <div class="info-list-item"><strong>Virement bancaire :</strong> 3 à 5 jours ouvrables</div>
    </div>

    <div class="alert-info">
        <p class="content-text" style="margin: 0;">
            💡 <strong>Le délai peut varier selon votre institution bancaire.</strong> Si vous ne recevez pas le remboursement dans les délais indiqués, veuillez vérifier auprès de votre banque.
        </p>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        📋 Informations importantes
    </h3>

    <div class="info-list">
        <div class="info-list-item">Le remboursement sera effectué sur le moyen de paiement utilisé lors de l'achat</div>
        <div class="info-list-item">Conservez cet email comme preuve de remboursement</div>
        <div class="info-list-item">Vous recevrez une confirmation de votre banque une fois le montant crédité</div>
        <div class="info-list-item">Ce remboursement apparaîtra sur votre relevé bancaire sous {{ config('app.name') }}</div>
    </div>

    @if(isset($myReservationsUrl))
    <div class="button-container">
        <a href="{{ $myReservationsUrl }}" class="button button-secondary">📋 Mes réservations</a>
    </div>
    @endif

    <hr class="divider">

    <p class="content-text">
        Si vous avez des questions concernant ce remboursement, n'hésitez pas à nous contacter.
    </p>

    <div class="button-container">
        <a href="{{ config('app.url') }}/contact" class="button">💬 Nous contacter</a>
    </div>

    <p class="content-text" style="text-align: center; margin-top: 30px;">
        <strong>Merci pour votre compréhension ! 🙏</strong>
    </p>
@endsection