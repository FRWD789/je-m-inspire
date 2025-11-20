@extends('emails.layouts.master')

@section('content')
    <div class="alert-info">
        <p class="content-text" style="margin: 0;">
            <strong>🎉 Nouveau événement disponible !</strong>
        </p>
    </div>

    <p class="content-text">
        <strong>{{ $pro->name }} {{ $pro->last_name }}</strong>, un professionnel que vous suivez, vient de publier un nouvel événement.
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
            <span class="info-value">{{ \Carbon\Carbon::parse($event->start_date)->locale('fr')->isoFormat('dddd D MMMM YYYY à HH:mm') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📍 Lieu</span>
            <span class="info-value">{{ $event->localisation->name }}<br>{{ $event->localisation->address }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">💰 Prix</span>
            <span class="info-value">{{ number_format($event->base_price, 2, ',', ' ') }} €</span>
        </div>
        <div class="info-row">
            <span class="info-label">👥 Places disponibles</span>
            <span class="info-value">{{ $event->available_places }} / {{ $event->max_places }}</span>
        </div>
        @if($event->description)
        <div class="info-row">
            <span class="info-label">📝 Description</span>
            <span class="info-value">{{ Str::limit($event->description, 200) }}</span>
        </div>
        @endif
    </div>

    <div class="button-container">
        <a href="{{ $eventUrl }}" class="button">🎫 Voir l'événement et réserver</a>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        👤 À propos du professionnel
    </h3>

    <div class="info-list">
        <div class="info-list-item">
            <strong>{{ $pro->name }} {{ $pro->last_name }}</strong>
            @if($pro->city)
                - {{ $pro->city }}
            @endif
        </div>
    </div>

    <div class="button-container" style="margin-top: 15px;">
        <a href="{{ $proProfileUrl }}" class="button-secondary">👤 Voir le profil du professionnel</a>
    </div>

    <hr class="divider">

    <div class="alert-warning">
        <p class="content-text" style="margin: 0;">
            ⚠️ <strong>Les places sont limitées !</strong> Ne tardez pas à réserver si cet événement vous intéresse.
        </p>
    </div>

    <p class="content-text" style="font-size: 14px; color: #666; margin-top: 20px;">
        Vous recevez cet email car vous suivez <strong>{{ $pro->name }} {{ $pro->last_name }}</strong>.
        <a href="{{ $myFollowingUrl }}" style="color: #7C9885;">Gérer mes abonnements</a>
    </p>

    <p class="content-text" style="text-align: center; font-size: 18px; margin-top: 30px;">
        <strong>À bientôt sur Je m'inspire ! 🌟</strong>
    </p>
@endsection