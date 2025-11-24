@extends('emails.layouts.master')

@section('content')
    <div class="alert-error">
        <p class="content-text" style="margin: 0;">
            <strong>⚠️ Votre événement a été annulé avec succès</strong>
        </p>
    </div>

    <p class="content-text">
        L'événement <strong>{{ $event->name }}</strong> a été annulé. Des demandes de remboursement ont été automatiquement créées pour tous les participants ayant effectué une réservation.
    </p>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        📋 Résumé de l'annulation
    </h3>

    <div class="highlight-box">
        <div class="info-row">
            <span class="info-label">📅 Événement</span>
            <span class="info-value">{{ $event->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">🗓️ Date prévue</span>
            <span class="info-value">{{ $event->start_date->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">👥 Participants concernés</span>
            <span class="info-value">{{ $participantsCount }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">💵 Total à rembourser</span>
            <span class="info-value">{{ number_format($totalRefunds, 2, ',', ' ') }} CAD</span>
        </div>
        <div class="info-row">
            <span class="info-label">📅 Date d'annulation</span>
            <span class="info-value">{{ now()->locale('fr')->isoFormat('D MMMM YYYY à HH:mm') }}</span>
        </div>
    </div>

    @if(count($refundsList) > 0)
    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        💳 Liste des remboursements à effectuer
    </h3>

    <div class="alert-warning">
        <p class="content-text" style="margin: 0;">
            ⚠️ <strong>Action requise :</strong> Vous devez effectuer les remboursements manuellement pour chaque participant via votre système de paiement (Stripe ou PayPal).
        </p>
    </div>

    <div style="background-color: #F9F8F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        @foreach($refundsList as $index => $refund)
        <div style="background-color: #FFFFFF; padding: 15px; margin-bottom: {{ $loop->last ? '0' : '15px' }}; border-radius: 6px; border-left: 3px solid #60993E;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div style="flex: 1;">
                    <div style="color: #3C493F; font-size: 16px; font-weight: 600; margin-bottom: 5px;">
                        {{ $refund['participant'] }}
                    </div>
                    <div style="color: #929E83; font-size: 14px;">
                        📧 {{ $refund['email'] }}
                    </div>
                </div>
                <div style="color: #60993E; font-size: 18px; font-weight: 700; white-space: nowrap; margin-left: 15px;">
                    {{ number_format($refund['montant'], 2, ',', ' ') }} CAD
                </div>
            </div>
            <div style="color: #929E83; font-size: 13px; margin-top: 8px;">
                🔖 Demande #{{ $refund['remboursement_id'] }}
            </div>
        </div>
        @endforeach
    </div>
    @endif

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        ℹ️ Prochaines étapes
    </h3>

    <div class="info-list">
        <div class="info-list-item">Connectez-vous à votre compte Stripe ou PayPal</div>
        <div class="info-list-item">Effectuez les remboursements manuellement pour chaque participant</div>
        <div class="info-list-item">Une fois le remboursement effectué, marquez la demande comme "traitée" dans votre tableau de bord</div>
        <div class="info-list-item">Les participants recevront une notification automatique une fois leur remboursement approuvé</div>
    </div>

    <div class="alert-info">
        <p class="content-text" style="margin: 0;">
            💡 <strong>Important :</strong> L'événement reste visible dans votre historique mais n'est plus accessible aux nouveaux utilisateurs. Tous les participants existants ont été automatiquement notifiés de l'annulation.
        </p>
    </div>

    <div class="button-container">
        <a href="{{ $myEventsUrl }}" class="button">📋 Voir mes événements</a>
    </div>

    <p class="content-text" style="font-size: 14px; color: #929E83; text-align: center; margin-top: 30px;">
        Besoin d'aide ? Contactez notre support à <a href="mailto:{{ config('mail.from.address') }}" style="color: #60993E;">{{ config('mail.from.address') }}</a>
    </p>
@endsection
