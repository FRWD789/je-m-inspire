@extends('emails.layouts.master')

@section('content')
    <div class="alert-info">
        <p class="content-text" style="margin: 0;">
            <strong>⏰ Rappel : Votre événement approche !</strong>
        </p>
    </div>

    <p class="content-text">
        Nous vous rappelons que vous êtes inscrit(e) à l'événement suivant qui aura lieu <strong>dans {{ $daysUntil }} jour(s)</strong>.
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
            <span class="info-label">📅 Date et heure</span>
            <span class="info-value">{{ $event->start_date->locale('fr')->isoFormat('dddd D MMMM YYYY à HH:mm') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📍 Lieu</span>
            <span class="info-value">{{ $event->localisation->name }}<br>{{ $event->localisation->address }}</span>
        </div>
        @if($event->description)
        <div class="info-row">
            <span class="info-label">📝 Description</span>
            <span class="info-value">{{ Str::limit($event->description, 150) }}</span>
        </div>
        @endif
    </div>

    <div class="button-container">
        <a href="{{ $eventUrl }}" class="button">🎫 Voir les détails de l'événement</a>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        📋 Préparation suggérée
    </h3>

    <div class="info-list">
        <div class="info-list-item">Vérifiez l'adresse et planifiez votre trajet</div>
        <div class="info-list-item">Préparez le matériel nécessaire (si applicable)</div>
        <div class="info-list-item">Consultez les informations pratiques sur la page de l'événement</div>
        <div class="info-list-item">N'oubliez pas d'ajouter l'événement à votre agenda</div>
    </div>

    <div class="alert-warning">
        <p class="content-text" style="margin: 0;">
            ⚠️ <strong>Pensez à consulter notre politique d'annulation</strong> si vous ne pouvez plus participer.
        </p>
    </div>

    <p class="content-text" style="text-align: center; font-size: 18px; margin-top: 30px;">
        <strong>À très bientôt ! 🎉</strong>
    </p>
@endsection