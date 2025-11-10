@extends('emails.layouts.master')

@section('content')
    <p class="content-text">
        Merci de vous être inscrit sur notre plateforme ! 🎉
    </p>

    <p class="content-text">
        Pour commencer à profiter de tous nos services, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
    </p>

    <div class="button-container">
        <a href="{{ $url }}" class="button">✉️ Vérifier mon email</a>
    </div>

    <div class="alert-info">
        <p class="content-text" style="margin: 0;">
            ⏰ <strong>Ce lien est valide pendant 60 minutes.</strong>
        </p>
    </div>

    @if(isset($isProfessional) && $isProfessional && isset($isApproved) && $isApproved)
    <hr class="divider">

    <div class="alert-success">
        <p class="content-text" style="margin: 0 0 10px 0;">
            <strong>🎉 Félicitations !</strong>
        </p>
        <p class="content-text" style="margin: 0;">
            Votre demande d'inscription en tant que professionnel a été <strong>approuvée</strong> par notre équipe.
        </p>
    </div>

    <p class="content-text">
        <strong>Prochaines étapes après vérification :</strong>
    </p>

    <div class="info-list">
        <div class="info-list-item">Vous pourrez vous connecter à votre compte professionnel</div>
        <div class="info-list-item">Compléter votre profil professionnel</div>
        <div class="info-list-item">Commencer à créer et gérer vos événements</div>
        <div class="info-list-item">Accéder à votre tableau de bord professionnel</div>
    </div>
    @endif

    <hr class="divider">

    <p class="content-text" style="font-size: 14px; color: #929E83;">
        Si vous n'avez pas créé de compte sur {{ config('app.name') }}, aucune action n'est requise. Vous pouvez ignorer cet email.
    </p>
@endsection