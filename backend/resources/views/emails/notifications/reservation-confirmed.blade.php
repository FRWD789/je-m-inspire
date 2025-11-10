@extends('emails.layouts.master')

@section('content')
    <div class="alert-success">
        <p class="content-text" style="margin: 0;">
            <strong>🎉 Votre réservation a été confirmée avec succès !</strong>
        </p>
    </div>

    <p class="content-text">
        Félicitations ! Vous êtes maintenant inscrit(e) à cet événement. Retrouvez ci-dessous tous les détails importants.
    </p>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        📅 Détails de l'événement
    </h3>

    <div class="highlight-box">
        <div class="info-row">
            <span class="info-label">📌 Événement</span>
            <span class="info-value">{{ $event->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📅 Date de début</span>
            <span class="info-value">{{ $event->start_date->locale('fr')->isoFormat('dddd D MMMM YYYY à HH:mm') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📅 Date de fin</span>
            <span class="info-value">{{ $event->end_date->locale('fr')->isoFormat('dddd D MMMM YYYY à HH:mm') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📍 Lieu</span>
            <span class="info-value">{{ $event->localisation->name }}<br>{{ $event->localisation->address }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📊 Niveau</span>
            <span class="info-value">{{ $event->level }}</span>
        </div>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        💰 Détails du paiement
    </h3>

    <div class="highlight-box">
        <div class="info-row">
            <span class="info-label">💵 Montant payé</span>
            <span class="info-value">{{ number_format($paiement->total, 2, ',', ' ') }} CAD</span>
        </div>
        <div class="info-row">
            <span class="info-label">✅ Statut</span>
            <span class="info-value">{{ $paiement->status === 'paid' ? 'Payé' : ucfirst($paiement->status) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">🔖 Numéro de réservation</span>
            <span class="info-value">#{{ $operation->id }}</span>
        </div>
    </div>

    <div class="button-container">
        <a href="{{ $eventUrl }}" class="button">🎫 Voir l'événement</a>
    </div>

    <div class="button-container" style="margin-top: 15px;">
        <a href="{{ $myReservationsUrl }}" class="button button-secondary">📋 Mes réservations</a>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        ℹ️ Informations importantes
    </h3>

    <div class="info-list">
        <div class="info-list-item">Veuillez conserver cet email comme preuve de réservation</div>
        <div class="info-list-item">En cas de questions, contactez l'organisateur via la page de l'événement</div>
        <div class="info-list-item">Consultez notre politique d'annulation sur notre site</div>
        <div class="info-list-item">Pensez à ajouter l'événement à votre agenda</div>
    </div>

    <p class="content-text" style="text-align: center; font-size: 18px; margin-top: 30px;">
        <strong>Nous vous souhaitons un excellent événement ! 🎊</strong>
    </p>
@endsection