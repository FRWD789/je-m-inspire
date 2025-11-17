@extends('emails.layouts.master')

@section('content')
    <div class="alert-warning">
        <p class="content-text" style="margin: 0;">
            <strong>⚠️ Mise à jour concernant votre demande professionnelle</strong>
        </p>
    </div>

    <p class="content-text">
        Nous avons examiné votre demande d'inscription en tant que professionnel. Malheureusement, nous ne pouvons pas l'approuver pour le moment.
    </p>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        📋 Raison du refus
    </h3>

    <div class="highlight-box">
        <p class="content-text" style="margin: 0; white-space: pre-wrap;">{{ $reason }}</p>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        🔄 Que faire maintenant ?
    </h3>

    <p class="content-text">
        Cette décision ne signifie pas que vous ne pouvez pas devenir professionnel sur notre plateforme. Voici les options qui s'offrent à vous :
    </p>

    <div class="info-list">
        <div class="info-list-item">Examinez attentivement la raison du refus</div>
        <div class="info-list-item">Corrigez les points mentionnés dans votre profil</div>
        <div class="info-list-item">Rassemblez les documents ou informations manquants</div>
        <div class="info-list-item">Soumettez une nouvelle demande après avoir apporté les améliorations nécessaires</div>
    </div>

    <div class="alert-info">
        <p class="content-text" style="margin: 0;">
            💡 <strong>Conseil :</strong> Prenez le temps de bien compléter votre profil et de fournir toutes les informations requises avant de soumettre une nouvelle demande.
        </p>
    </div>

    <hr class="divider">

    <h3 style="color: #3C493F; font-size: 18px; font-weight: 700; margin: 20px 0 15px 0;">
        📧 Besoin d'éclaircissements ?
    </h3>

    <p class="content-text">
        Si vous avez des questions concernant cette décision ou si vous souhaitez obtenir plus de détails, n'hésitez pas à nous contacter.
    </p>

    <div class="button-container">
        <a href="{{ $contactUrl }}" class="button">💬 Nous contacter</a>
    </div>

    <p class="content-text">
        En attendant, vous pouvez continuer à utiliser votre compte en tant qu'utilisateur standard et participer à tous les événements disponibles sur la plateforme.
    </p>

    <div class="button-container">
        <a href="{{ $loginUrl }}" class="button button-secondary">🏠 Accéder à mon compte</a>
    </div>

    <p class="content-text" style="font-size: 14px; color: #929E83; margin-top: 30px;">
        Nous apprécions votre intérêt pour notre plateforme et espérons pouvoir vous accueillir bientôt parmi nos professionnels.
    </p>
@endsection