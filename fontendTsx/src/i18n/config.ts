// fontendTsx/src/i18n/config.ts
import i18n from 'i18next';
//import { ref } from 'process';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {

      home: {
        heroTitle: "Explorez des événements holistiques près de chez vous",
        heroSubtitle: "Découvrez, créez et réservez des expériences bien-être, retraites et ateliers qui nourrissent le corps, l'esprit et l'âme.",
        searchPlaceholder: "Rechercher par nom...",
        allCities: "Toutes les villes",
        viewAllWithCount: "Voir tous les {{count}} événements...",
        viewAll: "Voir tous les événements...",
        upcomingEvents: "Événements à venir",
        cards: {
          title: "Rayonnez vos ateliers",
          description: "Rejoignez, partagez vos événements holistiques facilement."
        },
        newsletter: {
          title: "Rejoignez plus de 2 000 abonnés",
          subtitle: "Restez informé·e de tout ce que vous devez savoir.",
          placeholder: "Inscrivez votre e-mail",
          button: "Abonnez-vous",
          privacy: "Nous prenons soin de vos données dans notre politique de confidentialité"
        }
      },
      // ==========================================
      // NAVIGATION
      // ==========================================
      nav: {
        home: 'Accueil',
        events: 'Événements',
        createEvent: 'Créer un événement',
        about: 'À propos',
        myReservations: 'Mes Réservations',
        experiences: 'Expériences',
        account: 'Compte',
        logout: 'Déconnexion',
        login: 'Se connecter',
        register: "S'inscrire",
        profile: 'Profil',
        connection: 'Connexion',
        inscription: 'Inscription'
      },

      // ==========================================
      // EXPÉRIENCES
      // ==========================================
      experiences: {
        meditation: 'Méditation',
        yoga: 'Yoga & Mouvement',
        sonotherapy: 'Sonothérapie',
        circles: 'Cercles de partage'
      },
      
  

      // ==========================================
      // FOOTER
      // ==========================================
      footer: {
        navigation: 'Navigation',
        followUs: 'Suivez-nous',
        copyright: 'Tous droits réservés',
        description: 'Le meilleur sanctuaire holistique pour méditation, yoga et bien-être.',
        emailAutomatic: 'Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.',
        questions: 'Des questions ?',
        contactUs: 'Contactez-nous',
        unsubscribe: 'Se désabonner'
      },

      // ==========================================
      // AUTHENTIFICATION
      // ==========================================
      auth: {
        // Login
        loginTitle: 'Bon Retour',
        loginSubtitle: 'Connectez-vous à votre compte Je m\'inspire',
        email: 'Email',
        emailPlaceholder: 'Entrez votre email',
        password: 'Mot de passe',
        passwordPlaceholder: 'Entrez votre mot de passe',
        loginButton: 'Se connecter',
        noAccount: "Pas encore de compte ?",
        createAccount: 'Créer un compte',
        forgotPassword: 'Mot de passe oublié ?',
        middleText: 'Ou avec votre email',
        googleButton: 'Continuer avec Google',
        googleLoading: 'Connexion en cours...',
        resetPassword: "Réinitialiser le mot de passe",
        resetPasswordDescription: "Entrez votre nouveau mot de passe ci-dessous",
        newPassword: "Nouveau mot de passe",
        enterNewPassword: "Entrez votre nouveau mot de passe",
        confirmPassword: "Confirmer le mot de passe",
        confirmNewPassword: "Confirmez votre nouveau mot de passe",
        resetting: "Réinitialisation...",
        invalidResetLink: "Lien de réinitialisation invalide. Veuillez demander une nouvelle réinitialisation de mot de passe.",
        requestNewReset: "Demander une nouvelle réinitialisation de mot de passe",
        
        
        // Register User
        registerUserTitle: 'Créez votre compte',
        registerUserSubtitle: 'Inscrivez-vous pour rejoindre Je m\'inspire',
        firstName: 'Prénom',
        firstNamePlaceholder: 'Entrez votre prénom',
        lastName: 'Nom',
        lastNamePlaceholder: 'Entrez votre nom',
        dateOfBirth: 'Date de naissance',
        city: 'Ville',
        cityPlaceholder: 'Entrez votre ville',
        passwordConfirmation: 'Confirmation du mot de passe',
        passwordConfirmationPlaceholder: 'Confirmez votre mot de passe',
        registerButton: "S'inscrire",
        alreadyAccount: 'Déjà un compte ?',
        registerPro: 'Rejoignez-nous en tant que professionnel',
        forgotPasswordDescription: "Enter your email and we'll send you a password reset link",
        sendResetLink: "Send Reset Link",
        sending: "Sending...",
        backToLogin: "Back to Login",
        // Register Professional
        registerProTitle: 'Rejoignez en tant que professionnel',
        registerProSubtitle: 'Soumettez votre inscription pour devenir un professionnel vérifié',
        businessName: 'Nom de votre entreprise',
        businessNamePlaceholder: 'Entrez le nom de votre entreprise',
        motivationLetter: 'Lettre de motivation',
        descriptionPlaceholder: 'Décrivez votre activité',
        
        // Messages
        loginSuccess: 'Connexion réussie !',
        loginError: 'Email ou mot de passe incorrect',
        registerSuccess: 'Inscription réussie !',
        registerError: "Erreur lors de l'inscription",
        logoutSuccess: 'Déconnexion réussie',
        emailTaken: 'Cet email est déjà utilisé',
        invalidEmail: 'Email invalide',
        passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
        passwordMismatch: 'Les mots de passe ne correspondent pas',
        requiredField: 'Ce champ est requis',
        invalidDate: 'Date invalide',
        sessionExpired: 'Votre session a expiré, veuillez vous reconnecter'
      },

      // ==========================================
      // DASHBOARD
      // ==========================================
      dashboard: {
        nextEvent: "Prochain événement",
        title: 'Tableau de bord',
        welcome: 'Bienvenue',
        titleSideNav: 'Navigation',
        titleSmallSideNav: 'Nav',
        
        // Menu items
        home: 'Accueil',
        earnings: 'Revenus',
        users: 'Utilisateurs',
        commissions: 'Commissions',
        refunds: 'Remboursements',
        refundRequest: 'Demande de remboursement',
        calendar: 'Calendrier',
        events: 'Événements',
        myEvents: 'Mes événements',
        myReservations: 'Mes réservations',
        settings: 'Paramètres',
        profileSettings: 'Paramètres du profil',
        goodMorning: "Bon matin",
        goodAfternoon: "Bon après-midi",
        goodEvening: "Bonsoir",
        welcomeBack: "Bienvenue sur votre tableau de bord",
        quickAccess: "Accès rapide",
        manageYourEvents: "Gérer vos événements",
        viewReservations: "Voir vos réservations",
        trackEarnings: "Suivre vos revenus",
        manageUsers: "Gérer les utilisateurs"
      },

      // ==========================================
      // APPROVAL (ADMIN)
      // ==========================================
      approval: {
        title: 'Approbation des Professionnels',
        loading: 'Chargement...',
        
        // Stats
        pending: 'En attente',
        approved: 'Approuvés',
        rejected: 'Rejetés',
        all: 'Tous',
        
        // Actions
        refresh: 'Rafraîchir',
        back: 'Retour',
        approve: 'Approuver',
        reject: 'Rejeter',
        revoke: 'Révoquer',
        reApprove: 'Ré-approuver',
        
        // Table headers
        name: 'Nom',
        email: 'Email',
        city: 'Ville',
        registration: 'Inscription',
        message: 'Message',
        actions: 'Actions',
        
        // Empty state
        noRequestsFound: 'Aucune demande trouvée',
        noMatchingProfessional: 'Aucun professionnel correspondant à ce filtre',
        
        // Messages
        viewMessage: 'Voir le message',
        professionalMessage: 'Message du professionnel',
        noMessage: 'Aucun message',
        close: 'Fermer',
        thisUser: 'Cet utilisateur',
        
        // Reject modal
        rejectTitle: 'Rejeter',
        rejectWarning: '⚠️ Attention : Le compte sera rejeté et l\'utilisateur sera informé.',
        rejectPlaceholder: 'Raison du rejet (minimum 10 caractères)...',
        rejectMinLength: 'La raison doit comporter au moins 10 caractères.',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        characters: 'caractères',
        reason: 'Raison',
        
        // Status badges
        statusApproved: 'Approuvé',
        statusRejected: 'Rejeté',
        statusPending: 'En attente'
      },

      // ==========================================
      // EVENTS
      // ==========================================
      events: {
        // Liste
        title: 'Événements',
        availableEvents: 'Événements disponibles',
        availableEventsDesc: 'Parcourez tous les événements publics et réservez votre place',
        myEventsTitle: 'Mes événements',
        myEventsDesc: 'Événements que vous avez créés ou auxquels vous participez',
        noEvents: 'Aucun événement disponible',
        loading: 'Chargement des événements...',
        
        // Détails
        eventDetails: "Détails de l'événement",
        startDate: 'Date de début',
        endDate: 'Date de fin',
        location: 'Lieu',
        price: 'Prix',
        capacity: 'Capacité',
        availablePlaces: 'Places disponibles',
        level: 'Niveau',
        category: 'Catégorie',
        organizer: 'Organisateur',
        
        // Niveaux
        beginner: 'Débutant',
        intermediate: 'Intermédiaire',
        advanced: 'Avancé',
        
        // Actions
        reserve: 'Réserver',
        reserved: 'Réservé',
        cancelReservation: 'Annuler la réservation',
        edit: 'Modifier',
        delete: 'Supprimer',
        requestRefund: 'Demander un remboursement',
        fullEvent: 'Événement complet',
        
        // Création
        createEvent: 'Créer un événement',
        createNewEvent: 'Créer un nouvel événement',
        cancel: 'Annuler',
        eventName: "Nom de l'événement",
        eventDescription: "Description de l'événement",
        eventCategory: 'Catégorie',
        eventLevel: 'Niveau',
        eventPrice: 'Prix',
        eventCapacity: 'Capacité maximale',
        eventStartDate: 'Date de début',
        eventEndDate: 'Date de fin',
        eventLocation: 'Adresse',
        thumbnail: 'Image miniature',
        banner: 'Bannière',
        save: 'Enregistrer',
        creating: 'Création en cours...',
        updating: 'Mise à jour en cours...',
        
        // Messages
        reservationSuccess: 'Réservation confirmée !',
        reservationError: 'Erreur lors de la réservation',
        cancellationSuccess: 'Réservation annulée',
        cancellationError: "Erreur lors de l'annulation",
        createSuccess: 'Événement créé avec succès !',
        createError: 'Erreur lors de la création',
        updateSuccess: 'Événement mis à jour !',
        updateError: 'Erreur lors de la mise à jour',
        deleteSuccess: 'Événement supprimé',
        deleteError: 'Erreur lors de la suppression',
        deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet événement ?',
        noPlaces: 'Plus de places disponibles',

        // Formulaire
        generalInfo: 'Informations générales',
        enterEventName: 'Entrez le nom de votre événement',
        describeEvent: 'Décrivez votre événement...',
        localization: 'Localisation',
        address: 'Adresse',
        datesAndCapacity: 'Dates et capacité',
        selectStartDate: 'Sélectionnez la date de début',
        selectEndDate: 'Sélectionnez la date de fin',
        pricePerParticipant: 'Prix par participant',
        enterPrice: 'Entrez le prix par participant',
        maxCapacity: 'Nombre de participants maximum',
        maxCapacityPlaceholder: 'Nombre de participants maximum',
        eventSettings: 'Paramètres de l\'événement',
        eventImages: 'Images de l\'événement',
        clickOrDragImage: 'Cliquez ou glissez pour ajouter une image',
        clickOrDragImages: 'Cliquez ou glissez pour ajouter des images',
        
        // Actions événement
        organizedBy: 'Organisé par',
        reserveYourSpot: 'Réserver votre place',
        reserveNow: 'Réserver maintenant',
        aboutEvent: 'À propos de l\'événement',
        backToEvents: 'Retour aux événements',
        backToList: 'Retour à la liste',
        addressNotAvailable: 'Adresse non disponible',
        
        // Gestion pro
        manageEvent: 'Gérer l\'événement',
        manage: 'Gérer',
        downloadList: 'Télécharger la liste',
        participantsPdf: 'PDF des participants',
        printList: 'Imprimer la liste',
        directPrint: 'Impression directe',
        cancelEvent: 'Annuler l\'événement',
        hideAndRefund: 'Masquer et rembourser participants',
        listDownloaded: 'Liste des participants téléchargée avec succès !',
        downloadError: 'Erreur téléchargement',
        printError: 'Erreur impression',
        eventCancelled: 'Événement annulé',
        
        // Filtres
        filters: 'Filtres',
        allCategories: 'Toutes les catégories',
        city: 'Ville',
        allCities: 'Toutes les villes',
        sortByPrice: 'Tri par prix',
        default: 'Par défaut',
        priceAscending: 'Prix croissant',
        priceDescending: 'Prix décroissant',
        date: 'Date',
        resetFilters: 'Réinitialiser les filtres',
        
        // États
        loadingEvents: 'Chargement des événements...',
        loadingEvent: 'Chargement de l\'événement...',
        noEventsFound: 'Aucun événement trouvé',
        tryModifyingFilters: 'Essayez de modifier vos filtres de recherche',
        eventNotFound: 'Événement introuvable',
        noEventsOrganized: 'Aucun événement organisé pour le moment',
        
        // Images
        noImage: 'Aucune image',
        
        // Carte événement
        quantity: 'Quantité :',
        totalPaid: 'Total payé :',
        viewDetails: 'Voir détails',
        editShort: 'Éditer',
        deleteShort: 'Sup.',
        deleteEvent: 'Supprimer l\'événement',
        irreversible: 'irréversible',
        confirmDelete: 'Supprimer',
        
        // Statuts
        allStatus: 'Touts les status',
      },

      // ==========================================
      // RÉSERVATIONS
      // ==========================================
      reservations: {
        title: 'Mes réservations',
        myReservations: 'Mes réservations',
        noReservations: "Vous n'avez aucune réservation",
        event: 'Événement',
        date: 'Date',
        price: 'Prix',
        status: 'Statut',
        actions: 'Actions',
        
        // Status
        confirmed: 'Confirmée',
        cancelled: 'Annulée',
        pending: 'En attente',
        
        // Actions
        viewDetails: 'Voir les détails',
        cancel: 'Annuler',
        requestRefund: 'Demander un remboursement',
        
        // Messages
        cancelConfirm: 'Êtes-vous sûr de vouloir annuler cette réservation ?',

        noEventsFound: 'Aucun événement trouvé.',
        searchPlaceholder: 'Rechercher un événement...',
        allCategories: 'Toutes les catégories',
        allStatus: 'Tous les statuts',
        prev: 'Préc.',
        next: 'Suiv.',
      },

      // ==========================================
      // PAIEMENTS
      // ==========================================
      payment: {
        title: 'Paiement',
        chooseMethod: 'Choisissez votre méthode de paiement',
        stripe: 'Carte bancaire (Stripe)',
        paypal: 'PayPal',
        total: 'Total',
        quantity: 'Quantité',
        unitPrice: 'Prix unitaire',
        processing: 'Traitement en cours...',
        success: 'Paiement réussi !',
        error: 'Erreur lors du paiement',
        cancelled: 'Paiement annulé',
        goBack: 'Retour',
        proceed: 'Procéder au paiement'
      },

      // ==========================================
      // PROFIL
      // ==========================================
      profile: {
        title: 'Mon profil',
        editProfile: 'Modifier le profil',
        saveChanges: 'Enregistrer les modifications',
        cancel: 'Annuler',
        saving: 'Enregistrement...',
        
        // Informations
        personalInfo: 'Informations personnelles',
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email',
        dateOfBirth: 'Date de naissance',
        city: 'Ville',
        
        // Photo
        profilePicture: 'Photo de profil',
        changePicture: 'Changer la photo',
        removePicture: 'Supprimer la photo',
        
        // Comptes liés
        linkedAccounts: 'Comptes liés',
        stripeAccount: 'Compte Stripe',
        paypalAccount: 'Compte PayPal',
        linkAccount: 'Lier le compte',
        unlinkAccount: 'Délier le compte',
        accountLinked: 'Compte lié',
        accountNotLinked: 'Compte non lié',
        
        // Mot de passe
        changePassword: 'Changer le mot de passe',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        
        // Suppression
        deleteAccount: 'Supprimer le compte',
        deleteAccountWarning: 'Cette action est irréversible',
        confirmDeletion: 'Confirmer la suppression',
        typeDelete: 'Tapez SUPPRIMER pour confirmer',
        
        // Messages
        updateSuccess: 'Profil mis à jour avec succès !',
        updateError: 'Erreur lors de la mise à jour',
        passwordUpdateSuccess: 'Mot de passe modifié avec succès',
        passwordUpdateError: 'Erreur lors du changement de mot de passe',
        accountDeleted: 'Compte supprimé avec succès',
        accountDeleteError: 'Erreur lors de la suppression',
        linkSuccess: 'Compte lié avec succès',
        linkError: 'Erreur lors de la liaison',
        unlinkSuccess: 'Compte délié avec succès',
        unlinkError: 'Erreur lors de la déliaison',
        unlinkConfirm: 'Êtes-vous sûr de vouloir délier ce compte ?',
        imageTooBig: "L'image ne doit pas dépasser 2MB",
        invalidImageType: "Le fichier doit être une image",
        security: 'Sécurité',
        plan: 'Plan',
        biography: 'Biographie',
        biographyPlaceholder: 'Parlez-nous de vous...',
        accountPlan: 'Plan du compte',
        accountSecurity: 'Sécurité du compte',
        selectImage: 'Sélectionnez une image',
        maxSize: 'Taille maximale: 2MB',
        uploading: 'Téléchargement...'
      },

      // ==========================================
      // ABONNEMENT
      // ==========================================
      subscription: {
        title: 'Abonnement Pro Plus',
        currentPlan: 'Abonnement actuel',
        planName: 'Pro Plus',
        features: 'Fonctionnalités',
        feature1: 'Paiements directs avec commission réduite',
        feature2: 'Tableau de bord des revenus',
        feature3: 'Support prioritaire',
        feature4: 'Outils marketing avancés',
        subscribe: "S'abonner",
        unsubscribe: 'Se désabonner',
        manageSubscription: "Gérer l'abonnement",
        active: 'Actif',
        inactive: 'Inactif',
        titleMyPro: 'Mon Abonnement Pro+',
        mySubscription: 'Mon Abonnement',
        loading: 'Chargement...',
        loadingInfo: 'Chargement des informations...',
        maximizeYourEarnings: 'Maximisez vos ventes avec Pro+',
        limitedFunctions: 'Fonctionnalités limitées avec le compte gratuit',
        advancedTools: 'Outils avancés',
        
        // Messages
        subscribeSuccess: 'Abonnement activé avec succès !',
        subscribeError: "Erreur lors de l'activation",
        unsubscribeSuccess: 'Abonnement annulé',
        unsubscribeError: "Erreur lors de l'annulation",
        unsubscribeConfirm: 'Êtes-vous sûr de vouloir annuler votre abonnement ?',
        subscriptionDataUnavailable: 'Données d\'abonnement non disponibles',
        cannotLoadInfo: 'Impossible de charger vos informations d\'abonnement.',
        paymentLinkNotFound: 'Lien de paiement introuvable',
        subscriptionCreationError: 'Erreur lors de la création de l\'abonnement. Veuillez réessayer.',
        cancelConfirmation: 'Voulez-vous vraiment annuler votre abonnement ? Cette action est irréversible.',
        subscriptionWillCancel: 'Votre abonnement sera annulé à la fin de la période en cours.',
        cancellationError: 'Erreur lors de l\'annulation de l\'abonnement. Veuillez réessayer.',
        subscriptionActivated: 'Abonnement Activé avec Succès !',
        subscriptionActivatedDesc: 'Merci de votre confiance. Vous pouvez maintenant profiter de toutes les fonctionnalités professionnelles.',
        cancelScheduled: 'Annulation programmée',
        cancelScheduledDesc: 'Votre abonnement Pro Plus sera annulé à la fin de la période en cours.',

        // Abonnement actif
        activeTitle: 'Abonnement Pro+ Actif',
        activeSubtitle: 'Vous profitez de tous les avantages premium',
        subscriptionType: 'Type d\'abonnement',
        renewalDate: 'Renouvellement le',
        
        // Avantages
        benefitsTitle: 'Vos avantages Pro+',
        directPayments: 'Paiements directs',
        directPaymentsDesc1: 'Recevez vos revenus ',
        directPayementsDesc2: 'immédiatement ',
        directPayementsDesc3: 'sur vos comptes liés',
        reducedCommission: 'Commission réduite',
        reducedCommissionDesc1: 'Taux préférentiel pour ',
        reducedCommissionDesc2: 'maximiser vos revenus',
        advancedToolsDesc: 'Accédez à des outils marketing et analytiques avancés pour développer votre activité',
        whyPro: 'Pourquoi choisir Pro+ ?',
        whyProDesc1Title: 'Revenus instantanés',
        whyProDesc1: 'Plus besoin d\'attendre les transferts. Recevez vos paiements directement sur vos comptes liés dès qu\'une réservation est effectuée.',
        whyProDesc2Title: 'Plus de profits',
        whyProDesc2: 'Bénéficiez d\'un taux de commission réduit et gardez une plus grande partie de vos revenus.',
        whyProDesc3Title: 'Croissance accélérée',
        whyProDesc3: 'Accédez à des outils d\'analyse avancés pour optimiser vos événements et augmenter vos revenus.',

        // Bannière promo
        proOfferBadge: 'OFFRE PRO+',
        proOfferText1: 'Recevez vos paiements ',
        proOfferText2: 'directement ',
        proOfferText3: 'et payez ',
        proOfferText4: 'moins de commission',
        
        // Compte gratuit
        freeAccountTitle: 'Compte Gratuit',
        indirectPayments: 'Paiements indirects',
        indirectPaymentsDesc: 'Vous devez attendre que nous vous transférions vos revenus',
        standardCommission: 'Commission standard',
        standardCommissionDesc: 'Taux de commission plus élevé sur chaque transaction',
        restrictedAccess: 'Accès restreint aux outils premium',
        
        // Actions
        cancelSubscription: 'Annuler l\'abonnement',
        cancelling: 'Annulation...',
        cancel: 'Annuler',
        continue: 'Continuer',

        // Étapes de préparation
        initializingSubscription: 'Initialisation de votre abonnement...',
        preparingFeatures: 'Préparation des fonctionnalités premium...',
        configuringAccount: 'Configuration de votre compte...',
        almostDone: 'Presque terminé...',
        redirectingToPayment: 'Redirection vers le paiement...',
        autoRedirect: 'Redirection automatique...',
        finalizingInProgress: 'Finalisation en cours...',
        
        // Comptes liés
        linkedAccounts: 'Comptes liés',
        loadingLinkedAccounts: 'Chargement des comptes liés...',
        featureReserved: 'Fonctionnalité réservée',
        featureReservedDesc: 'Le lien vers Stripe et PayPal est réservé aux utilisateurs avec l\'abonnement',
        noLinkedAccount: 'Aucun compte lié',
        accountLinked: 'Compte lié',
        linkingError: 'Erreur lors de la liaison du compte.',
        linkingErrorGeneric: 'Erreur de liaison',
        unlinkingError: 'Erreur lors de la déliaison du compte.',
        unlinkAccount: 'Délier',
        linkStripe: 'Lier Stripe',
        linkPaypal: 'Lier PayPal',
        cancelWarning: 'Vous perdrez l\'accès aux fonctionnalités suivantes :\nVos comptes liés seront automatiquement dissociés.',
        subscriptionCancelled: 'Abonnement annulé avec succès.',
        goToProfile: 'Aller au profil maintenant',
        backToProfile: 'Retour au profil',
        retry: 'Réessayer',
        
        // Providers
        stripe: 'Stripe',
        paypal: 'PayPal',
        accountId: 'ID',

        // Misc
        month: 'mois',
        forSeriousPros: 'Pour les professionnels sérieux',
        cancelAnytime: 'Annulez à tout moment',
        subStripe: 'Abonnement via Stripe',
        subPaypal: 'Abonnement via PayPal',
      },

      // ==========================================
      // ADMIN
      // ==========================================
      admin: {
        // Approbation
        approvalTitle: 'Approbation des utilisateurs',
        pendingApprovals: 'Demandes en attente',
        approve: 'Approuver',
        reject: 'Refuser',
        approved: 'Approuvé',
        rejected: 'Refusé',
        pending: 'En attente',
        
        // Commissions
        commissionsTitle: 'Gestion des commissions',
        user: 'Utilisateur',
        commissionRate: 'Taux de commission',
        totalEarnings: 'Revenus totaux',
        platformEarnings: 'Revenus plateforme',
        vendorEarnings: 'Revenus vendeur',
        updateCommission: 'Mettre à jour',
        
        // Remboursements
        refundsTitle: 'Gestion des remboursements',
        refundRequests: 'Demandes de remboursement',
        requestDate: 'Date de demande',
        amount: 'Montant',
        reason: 'Raison',
        status: 'Statut',
        process: 'Traiter',

        // Messages
        approvalSuccess: 'Utilisateur approuvé',
        approvalError: "Erreur lors de l'approbation",
        rejectionSuccess: 'Utilisateur refusé',
        rejectionError: 'Erreur lors du refus',
        commissionUpdated: 'Commission mise à jour',
        commissionError: 'Erreur lors de la mise à jour',
        refundProcessed: 'Remboursement traité',
        refundError: 'Erreur lors du traitement'
      },

      // ==========================================
      // REFUNDS
      // ==========================================
      refunds: {
        // Titres principaux
        title: 'Mes Demandes de Remboursement',
        newRequest: 'Nouvelle Demande',
        myRequests: 'Mes Demandes',
        myRequestShort: 'Demandes',
        manage: 'Gestion des Remboursements',
        manageShort: 'Gestion',
        
        // Titres de gestion
        adminTitle: 'Remboursements à traiter (Paiements indirects)',
        proTitle: 'Remboursements de mes événements (Paiements directs)',
        
        // Formulaire
        selectReservation: 'Sélectionner une Réservation',
        reason: 'Motif du remboursement',
        reasonPlaceholder: 'Expliquez pourquoi vous demandez un remboursement',
        submit: 'Soumettre',
        submitting: 'Envoi en cours...',
        
        // Onglets de gestion
        pending: 'En Attente',
        approved: 'Approuvés',
        refused: 'Refusés',
        rejected: 'Rejetés',
        all: 'Tous',
        
        // Messages
        submitSuccess: 'Demande de remboursement soumise',
        submitError: 'Erreur lors de l\'envoi',
        noReservations: 'Aucune réservation éligible au remboursement',
        pleaseCompleteRecaptcha: 'Veuillez compléter le captcha',
        
        // Page de gestion
        noRequestsYet: 'Aucune demande de remboursement pour le moment',
        noRequestsDesc: 'Les demandes apparaîtront ici dès qu\'elles seront soumises',
        loading: 'Chargement...',
        refresh: 'Rafraîchir',
        
        // Tableau
        date: 'Date',
        event: 'Événement',
        client: 'Client',
        vendor: 'Vendeur',
        email: 'Courriel',
        amount: 'Montant',
        motive: 'Motif',
        message: 'Message',
        status: 'Statut',
        actions: 'Actions',
        
        // Détails
        refundReason: 'Motif de remboursement',
        adminMessage: 'Message de l\'administrateur',
        noReason: 'Aucun motif',
        viewReason: 'Voir le motif',
        viewMessage: 'Voir le message',
        close: 'Fermer',
        
        // Actions
        approve: 'Approuver',
        refuse: 'Refuser',
        approveRequest: 'Approuver la demande de',
        refuseRequest: 'Refuser la demande de',
        addMessage: 'Ajouter un message (minimum 5 caractères)...',
        messageMinLength: 'Le message doit contenir au moins 5 caractères.',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        
        // Statuts
        statusPending: 'En attente',
        statusApproved: 'Approuvé',
        statusRefused: 'Refusé',
        approvedOn: 'Approuvé le',
        refusedOn: 'Refusé le',
        
        // Formulaire de nouvelle demande
        selectReservationFirst: 'Veuillez sélectionner une réservation',
        noEligibleReservations: 'Vous n\'avez aucune réservation éligible au remboursement',
        eligibleReservationsDesc: 'Seules les réservations payées et annulables sans demande existante sont affichées',
        
        // Erreurs
        errorLoading: 'Erreur lors du chargement',
        errorProcessing: 'Erreur lors du traitement de la demande',
        cannotLoadRequests: 'Impossible de récupérer les demandes de remboursement.'
      },

      // ==========================================
      // REVENUS (VENDEUR)
      // ==========================================
      earnings: {
        title: 'Tableau de bord vendeur',
        subtitle: 'Gérez vos revenus et transactions',
        totalEarnings: 'Revenus totaux',
        platformCommission: 'Commission plateforme',
        netEarnings: 'Revenus nets',
        byEvent: 'Par événement',
        eventName: 'Événement',
        sales: 'Ventes',
        revenue: 'Revenus',
        commission: 'Commission',
        transactions: 'Transactions',
        net: 'Net',
        period: 'Période',
        thisMonth: 'Ce mois',
        today: 'Aujourd\'hui',
        thisWeek: 'Cette semaine',
        allTime: 'Depuis le début',
        exportCSV: 'Exporter CSV',
        overview: 'Vue d\'ensemble',
        statistics: 'Statistiques',
        bestEvent: 'Événements les plus rentables',
        paymentMethod: 'Méthodes de paiement',
        client: 'Client',
        amount: 'Montant',
        method: 'Méthode',
        last12Month: 'Revenus mensuels (12 derniers mois)',


      },

      // ==========================================
      // CALENDRIER
      // ==========================================
     calendar: {
        title: "Calendrier",
        prev: "Mois précédent",
        next: "Mois suivant",
        eventsFor: "Événements du",
        close: "Fermer",
      },

      // ==========================================
      // MESSAGES COMMUNS
      // ==========================================
      common: {
        // Actions
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        view: 'Voir',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        close: 'Fermer',
        confirm: 'Confirmer',
        search: 'Rechercher',
        filter: 'Filtrer',
        sort: 'Trier',
        loading: 'Chargement...',
        noResults: 'Aucun résultat',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Attention',
        info: 'Information',
        upgradeAccount: 'Mettre à niveau',
        freeAccount: 'Gratuit',

        // Profile & Follow
        profileOf: 'Profil de',
        linkCopied: 'Lien du profil copié !',
        contactFeatureComingSoon: 'Fonction de contact à implémenter',
        follow: 'Suivre',
        following: 'Abonné',
        share: 'Partager',
        contact: 'Contacter',
        followers: 'abonnés',
        follower: 'abonné',
        
        // Labels
        name: 'Nom',
        description: 'Description',
        date: 'Date',
        time: 'Heure',
        price: 'Prix',
        quantity: 'Quantité',
        total: 'Total',
        status: 'Statut',
        actions: 'Actions',
        details: 'Détails',
        required: 'Requis',
        optional: 'Optionnel',
        chooseOption: 'Choisir une option',
        
        // Confirmations
        confirmAction: 'Êtes-vous sûr ?',
        cannotUndo: 'Cette action ne peut pas être annulée',
        yes: 'Oui',
        no: 'Non',
        
        // Erreurs
        somethingWentWrong: "Une erreur s'est produite",
        tryAgain: 'Réessayer',
        contactSupport: 'Contactez le support',
        captchaRequired: 'La vérification Captcha est requise',
        
        // Succès
        operationSuccess: 'Opération réussie',
        changesSaved: 'Modifications enregistrées',
        
        // Accès
        accessDenied: 'Accès refusé',
        noPermission: "Vous n'avez pas les permissions nécessaires",
        returnHome: "Retour à l'accueil",
        
        // Pagination
        page: 'Page',
        of: 'de',
        itemsPerPage: 'Éléments par page',
        showing: 'Affichage',
        to: 'à',
        results: 'résultats',

        today: "Aujourd'hui",
        tomorrow: 'Demain',
        days: 'jours',
        pending: 'en attente',
        upgradeToPro: "Passer à Pro Plus",
        unlockFeatures: "Débloquez toutes les fonctionnalités premium",
        upgradeNow: "Mettre à niveau maintenant",
      },

      // ==========================================
      // VALIDATION
      // ==========================================
      validation: {
        required: 'Ce champ est requis',
        email: 'Email invalide',
        minLength: 'Minimum {{count}} caractères',
        maxLength: 'Maximum {{count}} caractères',
        passwordMatch: 'Les mots de passe doivent correspondre',
        invalidDate: 'Date invalide',
        invalidNumber: 'Nombre invalide',
        minValue: 'La valeur doit être au moins {{value}}',
        maxValue: 'La valeur ne peut pas dépasser {{value}}',
        invalidFormat: 'Format invalide',
        fileTooBig: 'Fichier trop volumineux',
        invalidFileType: 'Type de fichier invalide',
        
        // Validation spécifiques
        nameRequired: 'Le nom est requis',
        nameMaxLength: 'Le nom ne doit pas dépasser 255 caractères',
        lastNameRequired: 'Le nom de famille est requis',
        lastNameMaxLength: 'Le nom de famille ne doit pas dépasser 255 caractères',
        emailRequired: 'L\'email est requis',
        emailInvalidFormat: 'Format d\'email invalide',
        emailMaxLength: 'L\'email ne doit pas dépasser 255 caractères',
        dobInvalid: 'La date de naissance doit être une date valide avant aujourd\'hui',
        cityMaxLength: 'La ville ne doit pas dépasser 255 caractères',
        passwordMinLength: 'Le mot de passe doit contenir au moins 6 caractères',
        passwordConfirmMinLength: 'La confirmation doit contenir au moins 6 caractères',
        motivationMinLength: 'La lettre de motivation doit contenir au moins 50 caractères',
        motivationMaxLength: 'La lettre de motivation ne doit pas dépasser 2000 caractères',
        profilePictureInvalid: 'La photo de profil doit être une image valide de moins de 2 Mo',
        passwordsDontMatch: 'Les mots de passe ne correspondent pas',
      },

      // ==========================================
      // FOLLOWING (ABONNEMENTS)
      // ==========================================
      following: {
        title: 'Mes Abonnements',
        myFollowing: 'Professionnels suivis',
        noFollowing: 'Vous ne suivez aucun professionnel',
        noFollowingDesc: 'Découvrez des professionnels et suivez-les pour rester informé de leurs événements',
        noResults: 'Aucun professionnel trouvé',
        searchPlaceholder: 'Rechercher un professionnel...',
        discoverPros: 'Découvrir des pros',
        browseEvents: 'Parcourir les événements',
        professional: 'professionnel',
        professionals: 'professionnels',
        unfollow: 'Ne plus suivre',
        unfollowConfirm: 'Voulez-vous vraiment ne plus suivre {{name}} ?',
        unfollowSuccess: 'Vous ne suivez plus ce professionnel',
        unfollowError: 'Erreur lors du désabonnement',
        mustBeLoggedIn: 'Vous devez être connecté pour suivre un professionnel',
        followError: 'Erreur lors du suivi',
        enableNotifications: 'Activer les notifications',
        disableNotifications: 'Désactiver les notifications',
        notificationsMuted: 'Notifications désactivées',
        notificationError: 'Erreur lors de la modification des notifications',
        notificationsDisabled: 'Notifications désactivées',
        notificationsDisabledSuccess: 'Vous ne recevrez plus de notifications pour ce professionnel',
        notificationDisableError: 'Erreur lors de la désactivation',
        invalidLink: 'Lien invalide ou expiré'
      },

      // ==========================================
      // COOKIES
      // ==========================================
      cookies: {
        message: 'Nous utilisons des cookies pour améliorer votre expérience. En continuant à naviguer sur ce site, vous acceptez notre utilisation des cookies.',
        learnMore: 'En savoir plus sur notre politique de cookies',
        reject: 'Refuser',
        accept: 'Accepter',
        close: 'Fermer',
      },

      // ==========================================
      // ONBOARDING
      // ==========================================
      onboarding: {
        choosePhoto: 'Choisir une photo',
        bio: 'Bio',
        skip: 'Passer',
        preview: 'Aperçu',
        skipError: 'Erreur lors du skip',
      },

      // ==========================================
      // MAP
      // ==========================================
      map: {
        apiKeyMissing: 'Ajoutez VITE_GOOGLE_MAPS_API_KEY dans votre fichier .env',
        noCoordinates: 'Les événements sans coordonnées GPS ne peuvent pas être affichés',
      },

      // ==========================================
      // PAYMENTS
      // ==========================================
      payments: {
        // Titres et états
        success: 'Paiement réussi',
        successTitle: 'Paiement Réussi !',
        error: 'Erreur de paiement',
        failed: 'Paiement échoué',
        pending: 'Paiement en cours',
        processing: 'Traitement du paiement...',
        verifying: 'Vérification en cours...',
        verifyingStatus: 'Vérification du statut de votre paiement',
        verificationError: 'Une erreur est survenue lors du paiement',
        pendingDesc: 'Votre paiement est en cours de traitement. Vous recevrez un email de confirmation une fois le paiement validé.',
        confirmationEmail: 'Vous recevrez un email de confirmation avec tous les détails',
        
        // Détails
        paymentDetails: 'Détails du paiement',
        totalAmount: 'Montant total :',
        total: 'Total',
        status: 'Statut :',
        paid: 'Payé',
        reservationNumber: 'Numéro de réservation :',
        paymentMethod: 'Méthode de paiement',
        
        // Actions
        proceedToPayment: 'Procéder au paiement',
        backToEvents: 'Retour aux événements',
        viewMyReservations: 'Voir mes réservations',
        retryPayment: 'Réessayer',
        
        // Messages
        mustBeLoggedIn: 'Vous devez être connecté pour réserver cet événement.',
        
        // Google
        googleConnectionInProgress: 'Connexion Google en cours...',
        googleConnectionCancelled: 'Connexion Google annulée ou refusée',
        googleConnectionError: 'Erreur lors de la connexion Google',
        authorizationCodeMissing: 'Code d\'autorisation manquant',
        redirectingToLogin: 'Redirection vers la page de connexion...',
      },

      // ==========================================
      // COMMISSIONS (ADMIN)
      // ==========================================
      commissions: {
        // Titres
        title: 'Gestion des Commissions',
        subtitle: 'Gérez les paiements à transférer et les taux de commission',
        loading: 'Chargement...',
        refresh: 'Rafraîchir',
        back: 'Retour',
        
        // Onglets
        paymentsToTransfer: 'Paiements à transférer',
        paymentsShort: 'Paiements',
        commissionRates: 'Taux de commission',
        commissionRatesShort: 'Taux',
        
        // Statistiques
        totalToTransfer: 'Total à transférer',
        numberOfPayments: 'Nombre de paiements',
        commissionsCollected: 'Commissions prélevées',
        
        // Messages
        noPaymentsToTransfer: 'Aucun paiement à transférer',
        noPaymentsDesc: 'Tous les professionnels avec Pro Plus et comptes liés reçoivent déjà les paiements directement.',
        
        // Tableau
        date: 'Date',
        event: 'Événement',
        client: 'Client',
        vendor: 'Vendeur',
        email: 'Courriel',
        totalAmount: 'Montant total',
        commission: 'Commission',
        netAmount: 'Montant net',
        actions: 'Actions',
        
        // Actions
        copyId: 'Copier l\'ID',
        copied: 'Copié !',
        clickToCopy: 'Cliquer pour copier',
        transfer: 'Transférer',
        viewDetails: 'Voir détails',
      },

      // ==========================================
      // PROFESSIONALS
      // ==========================================
      professionals: {
        title: 'Nos Professionnels',
        subtitle: 'Découvrez les professionnels qualifiés de notre plateforme',
        loadingProfessionals: 'Chargement des professionnels...',
        noProfessionalsFound: 'Aucun professionnel trouvé',
        searchPlaceholder: 'Rechercher par nom ou ville...',
        retry: 'Réessayer',
        
        // Profil
        loadingProfile: 'Chargement du profil...',
        profileNotFound: 'Profil non trouvé',
        backToHome: 'Retour à l\'accueil',
        professional: 'Professionnel',
        events: 'Événements',
        about: 'À propos',
        noEventsOrganized: 'Aucun événement organisé pour le moment',
        contact: 'Contact',
        information: 'Informations',
        memberSince: 'Membre depuis:',
        status: 'Statut:',
        backToEvents: 'Retour aux événements',
      },

      // ==========================================
      // ABOUT PAGE
      // ==========================================
      about: {
        title: 'À propos de Je m\'inspire',
        subtitle: 'La plateforme qui connecte les passionnés aux événements qui les inspirent',
        
        // Mission
        missionTitle: 'Notre Mission',
        missionText1: 'Je m\'inspire est née d\'une vision simple : rendre la découverte et l\'organisation d\'événements accessible à tous. Que vous soyez un organisateur passionné cherchant à partager votre expertise, ou un participant en quête de nouvelles expériences, notre plateforme vous accompagne à chaque étape.',
        missionText2: 'Nous croyons que les événements ont le pouvoir de transformer les vies, de créer des connexions authentiques et d\'inspirer le changement. C\'est pourquoi nous mettons tout en œuvre pour offrir une expérience fluide, sécurisée et enrichissante.',
        
        // Valeurs
        valuesTitle: 'Nos Valeurs',
        
        // Histoire
        historyTitle: 'Notre Histoire',
        historyText1: 'Fondée par des passionnés d\'événementiel, Je m\'inspire est le fruit de plusieurs années d\'expérience dans l\'organisation et la gestion d\'événements. Face aux défis rencontrés par les organisateurs indépendants, nous avons créé une solution qui simplifie la billetterie, sécurise les paiements et favorise la visibilité.',
        historyText2: 'Aujourd\'hui, nous sommes fiers d\'accompagner des milliers d\'organisateurs et de participants dans leurs aventures événementielles.',
        
        // Pourquoi nous choisir
        whyChooseUsTitle: 'Pourquoi nous choisir ?',
        securePayments: 'Paiements sécurisés via Stripe et PayPal',
        intuitiveInterface: 'Interface intuitive pour organisateurs et participants',
        affiliateProgram: 'Programme d\'affiliation pour gagner des commissions',
        reactiveSupport: 'Support réactif et accompagnement personnalisé',
        completeDashboard: 'Tableau de bord complet pour suivre vos performances',
        communityEngaged: 'Communauté engagée et passionnée',
        
        // CTA
        joinUsTitle: 'Rejoignez-nous dès aujourd\'hui',
        joinUsText: 'Que vous soyez organisateur ou participant, découvrez comment Je m\'inspire peut transformer votre expérience événementielle.',
        startNow: 'Commencer maintenant',
        explorePlatform: 'Explorer la plateforme',
        back: 'Retour',
      },

      // ==========================================
      // VENDOR DASHBOARD
      // ==========================================
      vendorDashboard: {
        export: 'Exporter',
        date: 'Date',
        commission: 'Commission',
        net: 'Net',
        loadingError: 'Erreur lors du chargement des données',
        exportError: 'Erreur lors de l\'export',
      },

      // ==========================================
      // ERRORS & MESSAGES
      // ==========================================
      errors: {
        somethingWentWrong: 'Une erreur est survenue',
        technicalTeamNotified: 'L\'équipe technique a été notifiée.',
        reloadPage: 'Recharger la page',
        tryAgain: 'Réessayer',
        errorOccurred: 'Une erreur est survenue',
        invalidResetLink: 'Lien de réinitialisation invalide. Veuillez demander une nouvelle réinitialisation de mot de passe.',
      },

      // ==========================================
      // FORM ELEMENTS
      // ==========================================
      form: {
        forgotPassword: 'Mot de passe oublié ?',
        placeholder: {
          email: 'example@email.com',
          password: '********',
        },
      },

      // ==========================================
      // ACCESSIBILITY
      // ==========================================
      accessibility: {
        toggleMenu: 'Ouvrir/Fermer le menu',
        logout: 'Déconnexion',
        back: 'Retour',
        changeLanguage: 'Changer de langue',
        logo: 'Logo',
        heroBackground: 'Image de fond héro',
        ourMission: 'Notre mission',
        avatar: 'Avatar',
        preview: 'Aperçu',
      },

      // ==========================================
      // SOCIAL MEDIA
      // ==========================================
      socialMedia: {
        facebook: 'Facebook',
        instagram: 'Instagram',
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
      },

      
    }
  },

  en: {
    translation: {
      home: {
        heroTitle: "Explore holistic events near you",
        heroSubtitle: "Discover, create, and book wellness experiences, retreats, and workshops that nourish body, mind, and soul.",
        searchPlaceholder: "Search by name...",
        allCities: "All cities",
        viewAllWithCount: "See all {{count}} events...",
        viewAll: "See all events...",
        upcomingEvents: "Upcoming Events",
        cards: {
          title: "Showcase your workshops",
          description: "Join us and share your holistic events easily."
        },
        newsletter: {
          title: "Join over 2,000 subscribers",
          subtitle: "Stay up to date with everything you need to know.",
          placeholder: "Enter your email",
          button: "Subscribe",
          privacy: "We take care of your data in our privacy policy"
        }
      },
      // ==========================================
      // NAVIGATION
      // ==========================================
      nav: {
        home: 'Home',
        events: 'Events',
        createEvent: 'Create Event',
        about: 'About',
        myReservations: 'My Reservations',
        experiences: 'Experiences',
        account: 'Account',
        logout: 'Logout',
        login: 'Login',
        register: 'Sign up',
        profile: 'Profile',
        connection: 'Connection',
        inscription: 'Sign up'
      },

      // ==========================================
      // EXPERIENCES
      // ==========================================
      experiences: {
        meditation: 'Meditation',
        yoga: 'Yoga & Movement',
        sonotherapy: 'Sound Therapy',
        circles: 'Sharing Circles'
      },

      // ==========================================
      // FOOTER
      // ==========================================
      footer: {
        navigation: 'Navigation',
        followUs: 'Follow Us',
        copyright: 'All rights reserved',
        description: 'The best holistic sanctuary for meditation, yoga and wellness.',
        emailAutomatic: 'This email was sent automatically, please do not reply directly.',
        questions: 'Questions?',
        contactUs: 'Contact us',
        unsubscribe: 'Unsubscribe'
      },

      // ==========================================
      // AUTHENTICATION
      // ==========================================
      auth: {
        // Login
        loginTitle: 'Welcome Back',
        loginSubtitle: 'Sign in to your Je m\'inspire account',
        email: 'Email',
        emailPlaceholder: 'Enter your email',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        loginButton: 'Login',
        noAccount: "Don't have an account?",
        createAccount: 'Create account',
        forgotPassword: 'Forgot password?',
        middleText: 'Or with you email',
        googleButton: 'Sign in with google',
        googleLoading: 'Connection in progress...',
        
        // Register User
        registerUserTitle: 'Create your account',
        registerUserSubtitle: 'Sign up to join Je m\'inspire',
        firstName: 'First Name',
        firstNamePlaceholder: 'Enter your first name',
        lastName: 'Last Name',
        lastNamePlaceholder: 'Enter your last name',
        dateOfBirth: 'Date of Birth',
        city: 'City',
        cityPlaceholder: 'Enter your city',
        passwordConfirmation: 'Password Confirmation',
        passwordConfirmationPlaceholder: 'Confirm your password',
        registerButton: 'Sign up',
        alreadyAccount: 'Already have an account?',
        registerPro: 'Join us as a professional',
        
        // Register Professional
        registerProTitle: 'Professional Registration',
        registerProSubtitle: 'Create your professional account',
        businessName: 'Business Name',
        businessNamePlaceholder: 'Enter your business name',
        motivationLetter: 'Motivation Letter',
        descriptionPlaceholder: 'Describe your activity',
        
        // Messages
        loginSuccess: 'Login successful!',
        loginError: 'Invalid email or password',
        registerSuccess: 'Registration successful!',
        registerError: 'Registration error',
        logoutSuccess: 'Logout successful',
        emailTaken: 'This email is already in use',
        invalidEmail: 'Invalid email',
        passwordTooShort: 'Password must be at least 8 characters',
        passwordMismatch: 'Passwords do not match',
        requiredField: 'This field is required',
        invalidDate: 'Invalid date',
        sessionExpired: 'Your session has expired, please log in again',
      },

      // ==========================================
      // DASHBOARD
      // ==========================================
      dashboard: {
        nextEvent: "Next Event",
        title: 'Dashboard',
        welcome: 'Welcome',
        titleSideNav: 'Navigation',
        titleSmallSideNav: 'Nav',
        // Menu items
        home: 'Home',
        earnings: 'Earnings',
        users: 'Users',
        commissions: 'Commissions',
        refunds: 'Refunds',
        refundRequest: 'Refund Request',
        calendar: 'Calendar',
        events: 'Events',
        myEvents: 'My Events',
        myReservations: 'My Reservations',
        settings: 'Settings',
        profileSettings: 'Profile Settings',
        goodMorning: "Good morning",
        goodAfternoon: "Good afternoon",
        goodEvening: "Good evening",
        welcomeBack: "Welcome to your dashboard",
        quickAccess: "Quick access",
        manageYourEvents: "Manage your events",
        viewReservations: "View your reservations",
        trackEarnings: "Track your earnings",
        manageUsers: "Manage users"
      },

      // ==========================================
      // APPROVAL (ADMIN)
      // ==========================================
      approval: {
        title: 'Professional Approvals',
        loading: 'Loading...',
        
        // Stats
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        all: 'All',
        
        // Actions
        refresh: 'Refresh',
        back: 'Back',
        approve: 'Approve',
        reject: 'Reject',
        revoke: 'Revoke',
        reApprove: 'Re-approve',
        
        // Table headers
        name: 'Name',
        email: 'Email',
        city: 'City',
        registration: 'Registration',
        message: 'Message',
        actions: 'Actions',
        
        // Empty state
        noRequestsFound: 'No requests found',
        noMatchingProfessional: 'No professional matching this filter',
        
        // Messages
        viewMessage: 'View message',
        professionalMessage: 'Professional\'s message',
        noMessage: 'No message',
        close: 'Close',
        thisUser: 'This user',
        
        // Reject modal
        rejectTitle: 'Reject',
        rejectWarning: '⚠️ Warning: The account will be rejected and the user will be notified.',
        rejectPlaceholder: 'Reason for rejection (minimum 10 characters)...',
        rejectMinLength: 'The reason must be at least 10 characters long.',
        cancel: 'Cancel',
        confirm: 'Confirm',
        characters: 'characters',
        reason: 'Reason',
        
        // Status badges
        statusApproved: 'Approved',
        statusRejected: 'Rejected',
        statusPending: 'Pending'
      },

      // ==========================================
      // EVENTS
      // ==========================================
      events: {
        // List
        title: 'Events',
        availableEvents: 'Available Events',
        availableEventsDesc: 'Browse all public events and reserve your spot',
        myEventsTitle: 'My Events',
        myEventsDesc: 'Events you created or are participating in',
        noEvents: 'No events available',
        loading: 'Loading events...',
        
        // Details
        eventDetails: 'Event Details',
        startDate: 'Start Date',
        endDate: 'End Date',
        location: 'Location',
        price: 'Price',
        capacity: 'Capacity',
        availablePlaces: 'Available Places',
        level: 'Level',
        category: 'Category',
        organizer: 'Organizer',
        
        // Levels
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
        
        // Actions
        reserve: 'Reserve',
        reserved: 'Reserved',
        cancelReservation: 'Cancel Reservation',
        edit: 'Edit',
        delete: 'Delete',
        requestRefund: 'Request Refund',
        fullEvent: 'Event Full',
        
        // Creation
        createEvent: 'Create Event',
        createNewEvent: 'Create a New Event',
        cancel: 'Cancel',
        eventName: 'Event Name',
        eventDescription: 'Event Description',
        eventCategory: 'Category',
        eventLevel: 'Level',
        eventPrice: 'Price',
        eventCapacity: 'Maximum Capacity',
        eventStartDate: 'Start Date',
        eventEndDate: 'End Date',
        eventLocation: 'Address',
        thumbnail: 'Thumbnail',
        banner: 'Banner',
        save: 'Save',
        creating: 'Creating...',
        updating: 'Updating...',
        
        // Messages
        reservationSuccess: 'Reservation confirmed!',
        reservationError: 'Reservation error',
        cancellationSuccess: 'Reservation cancelled',
        cancellationError: 'Cancellation error',
        createSuccess: 'Event created successfully!',
        createError: 'Creation error',
        updateSuccess: 'Event updated!',
        updateError: 'Update error',
        deleteSuccess: 'Event deleted',
        deleteError: 'Deletion error',
        deleteConfirm: 'Are you sure you want to delete this event?',
        noPlaces: 'No places available',

        // Form
        generalInfo: 'General Information',
        enterEventName: 'Enter your event name',
        describeEvent: 'Describe your event...',
        localization: 'Location',
        address: 'Address',
        datesAndCapacity: 'Dates and Capacity',
        selectStartDate: 'Select start date',
        selectEndDate: 'Select end date',
        pricePerParticipant: 'Price per participant',
        enterPrice: 'Enter price per participant',
        maxCapacity: 'Maximum number of participants',
        maxCapacityPlaceholder: 'Maximum number of participants',
        eventSettings: 'Event Settings',
        eventImages: 'Event Images',
        clickOrDragImage: 'Click or drag to add an image',
        clickOrDragImages: 'Click or drag to add images',
        
        // Event actions
        organizedBy: 'Organized by',
        reserveYourSpot: 'Reserve Your Spot',
        reserveNow: 'Reserve Now',
        aboutEvent: 'About the Event',
        backToEvents: 'Back to Events',
        backToList: 'Back to List',
        addressNotAvailable: 'Address not available',
        
        // Pro management
        manageEvent: 'Manage Event',
        manage: 'Manage',
        downloadList: 'Download List',
        participantsPdf: 'Participants PDF',
        printList: 'Print List',
        directPrint: 'Direct Print',
        cancelEvent: 'Cancel Event',
        hideAndRefund: 'Hide and Refund Participants',
        listDownloaded: 'Participant list downloaded successfully!',
        downloadError: 'Download error',
        printError: 'Print error',
        eventCancelled: 'Event Cancelled',
        
        // Filters
        filters: 'Filters',
        allCategories: 'All Categories',
        city: 'City',
        allCities: 'All Cities',
        sortByPrice: 'Sort by Price',
        default: 'Default',
        priceAscending: 'Price Ascending',
        priceDescending: 'Price Descending',
        date: 'Date',
        resetFilters: 'Reset Filters',
        
        // States
        loadingEvents: 'Loading events...',
        loadingEvent: 'Loading event...',
        noEventsFound: 'No Events Found',
        tryModifyingFilters: 'Try modifying your search filters',
        eventNotFound: 'Event Not Found',
        noEventsOrganized: 'No events organized yet',
        
        // Images
        noImage: 'No Image',
        
        // Event card
        quantity: 'Quantity:',
        totalPaid: 'Total Paid:',
        viewDetails: 'View Details',
        editShort: 'Edit',
        deleteShort: 'Del.',
        deleteEvent: 'Delete Event',
        irreversible: 'irreversible',
        confirmDelete: 'Delete',
        
        // Status
        allStatus: 'All Status',
      },

      // ==========================================
      // RESERVATIONS
      // ==========================================
      reservations: {
        title: 'My Reservations',
        myReservations: 'My Reservations',
        noReservations: 'You have no reservations',
        event: 'Event',
        date: 'Date',
        price: 'Price',
        status: 'Status',
        actions: 'Actions',
        
        // Status
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        pending: 'Pending',
        
        // Actions
        viewDetails: 'View Details',
        cancel: 'Cancel',
        requestRefund: 'Request Refund',
        
        // Messages
        cancelConfirm: 'Are you sure you want to cancel this reservation?',

        noEventsFound: 'No events found.',
        searchPlaceholder: 'Search for an event...',
        allCategories: 'All Categories',
        allStatus: 'All Status',
        prev: 'Prev',
        next: 'Next',
      },

      // ==========================================
      // PAYMENT
      // ==========================================
      payment: {
        title: 'Payment',
        chooseMethod: 'Choose your payment method',
        stripe: 'Credit Card (Stripe)',
        paypal: 'PayPal',
        total: 'Total',
        quantity: 'Quantity',
        unitPrice: 'Unit Price',
        processing: 'Processing...',
        success: 'Payment successful!',
        error: 'Payment error',
        cancelled: 'Payment cancelled',
        goBack: 'Go Back',
        proceed: 'Proceed to Payment'
      },

      // ==========================================
      // PROFILE
      // ==========================================
      profile: {
        title: 'My Profile',
        editProfile: 'Edit Profile',
        saveChanges: 'Save Changes',
        cancel: 'Cancel',
        saving: 'Saving...',
        
        // Information
        personalInfo: 'Personal Information',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        dateOfBirth: 'Date of Birth',
        city: 'City',
        
        // Photo
        profilePicture: 'Profile Picture',
        changePicture: 'Change Picture',
        removePicture: 'Remove Picture',
        
        // Linked Accounts
        linkedAccounts: 'Linked Accounts',
        stripeAccount: 'Stripe Account',
        paypalAccount: 'PayPal Account',
        linkAccount: 'Link Account',
        unlinkAccount: 'Unlink Account',
        accountLinked: 'Account Linked',
        accountNotLinked: 'Account Not Linked',
        
        // Password
        changePassword: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        
        // Deletion
        deleteAccount: 'Delete Account',
        deleteAccountWarning: 'This action is irreversible',
        confirmDeletion: 'Confirm Deletion',
        typeDelete: 'Type DELETE to confirm',
        
        // Messages
        updateSuccess: 'Profile updated successfully!',
        updateError: 'Update error',
        passwordUpdateSuccess: 'Password changed successfully',
        passwordUpdateError: 'Password change error',
        accountDeleted: 'Account deleted successfully',
        accountDeleteError: 'Account deletion error',
        linkSuccess: 'Account linked successfully',
        linkError: 'Linking error',
        unlinkSuccess: 'Account unlinked successfully',
        unlinkError: 'Unlinking error',
        unlinkConfirm: 'Are you sure you want to unlink this account?',
        imageTooBig: 'Image must not exceed 2MB',
        invalidImageType: 'File must be an image',
        security: 'Security',
        plan: 'Plan',
        biography: 'Biography',
        biographyPlaceholder: 'Tell us about yourself...',
        accountPlan: 'Account Plan',
        accountSecurity: 'Account Security',
        selectImage: 'Select an image',
        maxSize: 'Maximum size: 2MB',
        uploading: 'Uploading...'
      },

      // ==========================================
      // SUBSCRIPTION
      // ==========================================
      subscription: {
        title: 'Pro Plus Subscription',
        currentPlan: 'Current Subscription',
        planName: 'Pro Plus',
        features: 'Features',
        feature1: 'Direct payments with reduced commission',
        feature2: 'Earnings dashboard',
        feature3: 'Priority support',
        feature4: 'Advanced marketing tools',
        subscribe: 'Subscribe',
        unsubscribe: 'Unsubscribe',
        manageSubscription: 'Manage Subscription',
        active: 'Active',
        inactive: 'Inactive',
        titleMyPro: 'My Pro+ Subscription',
        mySubscription: 'My Subscription',
        loading: 'Loading...',
        loadingInfo: 'Loading information...',
        maximizeYourEarnings: 'Maximize your earnings with Pro+',
        limitedFunctions: 'Your free ccount has limited functions',
        advancedTools: 'Advanced tools',
        
        // Messages

        
        // Active subscription
        activeTitle: 'Pro+ Subscription Active',
        activeSubtitle: 'You enjoy all premium benefits',
        subscriptionType: 'Subscription type',
        renewalDate: 'Renewal on',
        
        // Benefits
        benefitsTitle: 'Your Pro+ Benefits',
        directPayments: 'Direct Payments',
        directPaymentsDesc1: 'Receive your earnings ',
        directPayementsDesc2: 'right away ',
        directPayementsDesc3: 'on your linked accounts',
        reducedCommission: 'Reduced Commission',
        reducedCommissionDesc1: 'Better rates to ',
        reducedCommissionDesc2: 'maximize your earnings',
        advancedToolsDesc: 'Access advanced marketing and management tools to grow your business',
        whyPro: 'Why choose Pro+?',
        whyProDesc1Title: 'Instant payments',
        whyProDesc1Text: 'No more waiting for transfers. Get paid directly when participants book your events.',
        whyProDesc2Title: 'More earnings',
        whyProDesc2: 'Get better commission rates and keep more of your revenue.',
        whyProDesc3Title: 'Faster growth',
        whyProDesc3: 'Access tools designed to help you attract more participants and grow your business faster.',

        // Promo banner
        proOfferBadge: 'PRO+ OFFER',
        proOfferText1: 'Receive payments',
        proOfferText2: 'directly',
        proOfferText3: 'and pay',
        proOfferText4: 'less commission',
        
        // Free account
        freeAccountTitle: 'Free Account',
        indirectPayments: 'Indirect Payments',
        indirectPaymentsDesc: 'You must wait for us to transfer your revenue',
        standardCommission: 'Standard Commission',
        standardCommissionDesc: 'Higher commission rate on each transaction',
        restrictedAccess: 'Restricted Access to premium features',
        
        // Actions
        cancelSubscription: 'Cancel Subscription',
        cancelling: 'Cancelling...',
        cancel: 'Cancel',
        continue: 'Continue',
        
        // Messages
        subscriptionDataUnavailable: 'Subscription data unavailable',
        cannotLoadInfo: 'Unable to load your subscription information.',
        paymentLinkNotFound: 'Payment link not found',
        subscriptionCreationError: 'Error creating subscription. Please try again.',
        cancelConfirmation: 'Do you really want to cancel your subscription? This action is irreversible.',
        subscriptionWillCancel: 'Your subscription will be cancelled at the end of the current period.',
        cancellationError: 'Error cancelling subscription. Please try again.',
        subscriptionActivated: 'Subscription Activated Successfully!',
        subscriptionActivatedDesc: 'Thank you for your trust. You can now enjoy all professional features.',
        cancelScheduled: 'Cancellation scheduled',
        cancelScheduledDesc: 'Your Pro Plus subscription will be cancelled at the end of the current period.',
        subscribeSuccess: 'Subscription activated successfully!',
        subscribeError: 'Activation error',
        unsubscribeSuccess: 'Subscription cancelled',
        unsubscribeError: 'Cancellation error',
        unsubscribeConfirm: 'Are you sure you want to cancel your subscription?',


        // Preparation steps
        initializingSubscription: 'Initializing your subscription...',
        preparingFeatures: 'Preparing premium features...',
        configuringAccount: 'Configuring your account...',
        almostDone: 'Almost done...',
        redirectingToPayment: 'Redirecting to payment...',
        autoRedirect: 'Automatic redirect...',
        finalizingInProgress: 'Finalization in progress...',
        
        // Linked accounts
        linkedAccounts: 'Linked Accounts',
        loadingLinkedAccounts: 'Loading linked accounts...',
        featureReserved: 'Reserved Feature',
        featureReservedDesc: 'Linking to Stripe and PayPal is reserved for users with',
        noLinkedAccount: 'No linked account',
        accountLinked: 'Account linked',
        linkingError: 'Error linking account.',
        linkingErrorGeneric: 'Linking error',
        unlinkingError: 'Error unlinking account.',
        unlinkAccount: 'Unlink',
        linkStripe: 'Link Stripe',
        linkPaypal: 'Link PayPal',
        cancelWarning: 'You will lose access to the following features:\nYour linked accounts will be automatically disconnected.',
        subscriptionCancelled: 'Subscription cancelled successfully.',
        goToProfile: 'Go to profile now',
        backToProfile: 'Back to profile',
        retry: 'Retry',
        
        // Providers
        stripe: 'Stripe',
        paypal: 'PayPal',
        accountId: 'ID',

        // Misc
        month: 'month',
        forSeriousPros: 'For serious professionals',
        cancelAnytime: 'Cancel anytime',
        subStripe: 'Subscribe with Stripe',
        subPaypal: 'Subscribe with PayPal',

      },

      // ==========================================
      // ADMIN
      // ==========================================
      admin: {
        // Approval
        approvalTitle: 'User Approval',
        pendingApprovals: 'Pending Requests',
        approve: 'Approve',
        reject: 'Reject',
        approved: 'Approved',
        rejected: 'Rejected',
        pending: 'Pending',
        
        // Commissions
        commissionsTitle: 'Commission Management',
        user: 'User',
        commissionRate: 'Commission Rate',
        totalEarnings: 'Total Earnings',
        platformEarnings: 'Platform Earnings',
        vendorEarnings: 'Vendor Earnings',
        updateCommission: 'Update',
        
        // Refunds
        refundsTitle: 'Refund Management',
        refundRequests: 'Refund Requests',
        requestDate: 'Request Date',
        amount: 'Amount',
        reason: 'Reason',
        status: 'Status',
        process: 'Process',

        // Messages
        approvalSuccess: 'User approved',
        approvalError: 'Approval error',
        rejectionSuccess: 'User rejected',
        rejectionError: 'Rejection error',
        commissionUpdated: 'Commission updated',
        commissionError: 'Update error',
        refundProcessed: 'Refund processed',
        refundError: 'Processing error'
      },

      // ==========================================
      // REFUNDS
      // ==========================================
      refunds: {
        // Main titles
        title: 'My Refund Requests',
        newRequest: 'New Request',
        myRequests: 'My Requests',
        myRequestShort: 'Requests',
        manage: 'Refund Management',
        manageShort: 'Management',
        
        // Management titles
        adminTitle: 'Refunds to Process (Indirect Payments)',
        proTitle: 'Refunds for My Events (Direct Payments)',
        
        // Form
        selectReservation: 'Select a Reservation',
        reason: 'Refund Reason',
        reasonPlaceholder: 'Explain why you are requesting a refund',
        submit: 'Submit',
        submitting: 'Submitting...',
        
        // Management tabs
        pending: 'Pending',
        approved: 'Approved',
        refused: 'Refused',
        rejected: 'Rejected',
        all: 'All',
        
        // Messages
        submitSuccess: 'Refund request submitted',
        submitError: 'Submission error',
        noReservations: 'No reservations eligible for refund',
        pleaseCompleteRecaptcha: 'Please complete the captcha',
        
        // Management page
        noRequestsYet: 'No refund requests yet',
        noRequestsDesc: 'Requests will appear here once submitted',
        loading: 'Loading...',
        refresh: 'Refresh',
        
        // Table
        date: 'Date',
        event: 'Event',
        client: 'Customer',
        vendor: 'Vendor',
        email: 'Email',
        amount: 'Amount',
        motive: 'Reason',
        message: 'Message',
        status: 'Status',
        actions: 'Actions',
        
        // Details
        refundReason: 'Refund Reason',
        adminMessage: 'Administrator Message',
        noReason: 'No reason',
        viewReason: 'View reason',
        viewMessage: 'View message',
        close: 'Close',
        
        // Actions
        approve: 'Approve',
        refuse: 'Refuse',
        approveRequest: 'Approve request from',
        refuseRequest: 'Refuse request from',
        addMessage: 'Add a message (minimum 5 characters)...',
        messageMinLength: 'Message must be at least 5 characters long.',
        cancel: 'Cancel',
        confirm: 'Confirm',
        
        // Statuses
        statusPending: 'Pending',
        statusApproved: 'Approved',
        statusRefused: 'Refused',
        approvedOn: 'Approved on',
        refusedOn: 'Refused on',
        
        // New request form
        selectReservationFirst: 'Please select a reservation',
        noEligibleReservations: 'You have no reservations eligible for refund',
        eligibleReservationsDesc: 'Only paid and cancellable reservations without existing requests are shown',
        
        // Errors
        errorLoading: 'Error loading',
        errorProcessing: 'Error processing request',
        cannotLoadRequests: 'Unable to retrieve refund requests.'
      },
      // ==========================================
      // EARNINGS (VENDOR)
      // ==========================================
      earnings: {
        title: 'Seller dashboard',
        subtitle: 'Manage your income and transactions',
        totalEarnings: 'Total Earnings',
        platformCommission: 'Platform Commission',
        netEarnings: 'Net Earnings',
        byEvent: 'By Event',
        eventName: 'Event',
        sales: 'Sales',
        revenue: 'Revenue',
        commission: 'Commission',
        transactions: 'Transactions',
        net: 'Net',
        period: 'Period',
        thisMonth: 'This Month',
        today: 'Today',
        thisWeek: 'This Week',
        allTime: 'All Time',
        exportCSV: 'Export CSV',
        overview: 'Overview',
        statistics: 'Statistics',
        bestEvent: 'Most profitable events',
        paymentMethod: 'Payment methods',
        client: 'Customer',
        amount: 'Amount',
        method: 'Method',
        last12Month: 'Monthly income (last 12 months)',


      },

      // ==========================================
      // CALENDAR
      // ==========================================
      calendar: {
        title: "Calendar",
        prev: "Previous month",
        next: "Next month",
        eventsFor: "Events for",
        close: "Close",
      },

      // ==========================================
      // COMMON MESSAGES
      // ==========================================
      common: {
        // Actions
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        close: 'Close',
        confirm: 'Confirm',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        loading: 'Loading...',
        noResults: 'No results',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        upgradeAccount: 'Upgrade',
        freeAccount: 'Free',

        // Profile & Follow
        profileOf: 'Profile of',
        linkCopied: 'Profile link copied!',
        contactFeatureComingSoon: 'Contact feature to be implemented',
        follow: 'Follow',
        following: 'Following',
        share: 'Share',
        contact: 'Contact',
        followers: 'followers',
        follower: 'follower',

        // Labels
        name: 'Name',
        description: 'Description',
        date: 'Date',
        time: 'Time',
        price: 'Price',
        quantity: 'Quantity',
        total: 'Total',
        status: 'Status',
        actions: 'Actions',
        details: 'Details',
        required: 'Required',
        optional: 'Optional',
        chooseOption: 'Choose an option',
        
        // Confirmations
        confirmAction: 'Are you sure?',
        cannotUndo: 'This action cannot be undone',
        yes: 'Yes',
        no: 'No',
        
        // Errors
        somethingWentWrong: 'Something went wrong',
        tryAgain: 'Try Again',
        contactSupport: 'Contact Support',
        captchaRequired: 'Captcha verification is required',
        
        // Success
        operationSuccess: 'Operation successful',
        changesSaved: 'Changes saved',
        
        // Access
        accessDenied: 'Access Denied',
        noPermission: 'You do not have the necessary permissions',
        returnHome: 'Return Home',
        
        // Pagination
        page: 'Page',
        of: 'of',
        itemsPerPage: 'Items per page',
        showing: 'Showing',
        to: 'to',
        results: 'results',

        today: 'Today',
        tomorrow: 'Tomorrow',
        days: 'days',
        pending: 'pending',
        upgradeToPro: "Upgrade to Pro Plus",
        unlockFeatures: "Unlock all premium features",
        upgradeNow: "Upgrade now"
      },

      // ==========================================
      // VALIDATION
      // ==========================================
      validation: {
        required: 'This field is required',
        email: 'Invalid email',
        minLength: 'Minimum {{count}} characters',
        maxLength: 'Maximum {{count}} characters',
        passwordMatch: 'Passwords must match',
        invalidDate: 'Invalid date',
        invalidNumber: 'Invalid number',
        minValue: 'Value must be at least {{value}}',
        maxValue: 'Value cannot exceed {{value}}',
        invalidFormat: 'Invalid format',
        fileTooBig: 'File too large',
        invalidFileType: 'Invalid file type',
        
        // Specific validations
        nameRequired: 'Name is required',
        nameMaxLength: 'Name must not exceed 255 characters',
        lastNameRequired: 'Last name is required',
        lastNameMaxLength: 'Last name must not exceed 255 characters',
        emailRequired: 'Email is required',
        emailInvalidFormat: 'Invalid email format',
        emailMaxLength: 'Email must not exceed 255 characters',
        dobInvalid: 'Date of birth must be a valid date before today',
        cityMaxLength: 'City must not exceed 255 characters',
        passwordMinLength: 'Password must be at least 6 characters long',
        passwordConfirmMinLength: 'Password confirmation must be at least 6 characters long',
        motivationMinLength: 'Motivation letter must be at least 50 characters',
        motivationMaxLength: 'Motivation letter must not exceed 2000 characters',
        profilePictureInvalid: 'Profile picture must be a valid image under 2MB',
        passwordsDontMatch: 'Passwords don\'t match',
      },
      // ==========================================
      // FOLLOWING (SUBSCRIPTIONS)
      // ==========================================
      following: {
        title: 'My Subscriptions',
        myFollowing: 'Following Professionals',
        noFollowing: 'You are not following any professionals',
        noFollowingDesc: 'Discover professionals and follow them to stay updated on their events',
        noResults: 'No professionals found',
        searchPlaceholder: 'Search for a professional...',
        discoverPros: 'Discover Pros',
        browseEvents: 'Browse Events',
        professional: 'professional',
        professionals: 'professionals',
        unfollow: 'Unfollow',
        unfollowConfirm: 'Do you really want to unfollow {{name}}?',
        unfollowSuccess: 'You are no longer following this professional',
        unfollowError: 'Error while unfollowing',
        mustBeLoggedIn: 'You must be logged in to follow a professional',
        followError: 'Error while following',
        enableNotifications: 'Enable notifications',
        disableNotifications: 'Disable notifications',
        notificationsMuted: 'Notifications disabled',
        notificationError: 'Error updating notification settings',
        notificationsDisabled: 'Notifications Disabled',
        notificationsDisabledSuccess: 'You will no longer receive notifications from this professional',
        notificationDisableError: 'Error disabling notifications',
        invalidLink: 'Invalid or expired link'
      },

      // ==========================================
      // COOKIES
      // ==========================================
      cookies: {
        message: 'We use cookies to enhance your experience. By continuing to browse this site you agree to our use of cookies.',
        learnMore: 'Learn more about our cookie policy',
        reject: 'Reject',
        accept: 'Accept',
        close: 'Close',
      },

      // ==========================================
      // ONBOARDING
      // ==========================================
      onboarding: {
        choosePhoto: 'Choose a photo',
        bio: 'Bio',
        skip: 'Skip',
        preview: 'Preview',
        skipError: 'Error during skip',
      },

      // ==========================================
      // MAP
      // ==========================================
      map: {
        apiKeyMissing: 'Add VITE_GOOGLE_MAPS_API_KEY to your .env file',
        noCoordinates: 'Events without GPS coordinates cannot be displayed',
      },

      // ==========================================
      // PAYMENTS
      // ==========================================
      payments: {
        // Titles and states
        success: 'Payment Successful',
        successTitle: 'Payment Successful!',
        error: 'Payment Error',
        failed: 'Payment Failed',
        pending: 'Payment Pending',
        processing: 'Processing payment...',
        verifying: 'Verifying...',
        verifyingStatus: 'Verifying your payment status',
        verificationError: 'An error occurred during payment',
        pendingDesc: 'Your payment is being processed. You will receive a confirmation email once the payment is validated.',
        confirmationEmail: 'You will receive a confirmation email with all details',
        
        // Details
        paymentDetails: 'Payment Details',
        totalAmount: 'Total amount:',
        total: 'Total',
        status: 'Status:',
        paid: 'Paid',
        reservationNumber: 'Reservation number:',
        paymentMethod: 'Payment method',
        
        // Actions
        proceedToPayment: 'Proceed to Payment',
        backToEvents: 'Back to Events',
        viewMyReservations: 'View My Reservations',
        retryPayment: 'Retry',
        
        // Messages
        mustBeLoggedIn: 'You must be logged in to reserve this event.',
        
        // Google
        googleConnectionInProgress: 'Google connection in progress...',
        googleConnectionCancelled: 'Google connection cancelled or refused',
        googleConnectionError: 'Error during Google connection',
        authorizationCodeMissing: 'Authorization code missing',
        redirectingToLogin: 'Redirecting to login page...',
      },

      // ==========================================
      // COMMISSIONS (ADMIN)
      // ==========================================
      commissions: {
        // Titles
        title: 'Commission Management',
        subtitle: 'Manage payments to transfer and commission rates',
        loading: 'Loading...',
        refresh: 'Refresh',
        back: 'Back',
        
        // Tabs
        paymentsToTransfer: 'Payments to Transfer',
        paymentsShort: 'Payments',
        commissionRates: 'Commission Rates',
        commissionRatesShort: 'Rates',
        
        // Statistics
        totalToTransfer: 'Total to transfer',
        numberOfPayments: 'Number of payments',
        commissionsCollected: 'Commissions collected',
        
        // Messages
        noPaymentsToTransfer: 'No payments to transfer',
        noPaymentsDesc: 'All professionals with Pro Plus and linked accounts already receive payments directly.',
        
        // Table
        date: 'Date',
        event: 'Event',
        client: 'Customer',
        vendor: 'Vendor',
        email: 'Email',
        totalAmount: 'Total amount',
        commission: 'Commission',
        netAmount: 'Net amount',
        actions: 'Actions',
        
        // Actions
        copyId: 'Copy ID',
        copied: 'Copied!',
        clickToCopy: 'Click to copy',
        transfer: 'Transfer',
        viewDetails: 'View Details',
      },

      // ==========================================
      // PROFESSIONALS
      // ==========================================
      professionals: {
        title: 'Our Professionals',
        subtitle: 'Discover the qualified professionals on our platform',
        loadingProfessionals: 'Loading professionals...',
        noProfessionalsFound: 'No professionals found',
        searchPlaceholder: 'Search by name or city...',
        retry: 'Retry',
        
        // Profile
        loadingProfile: 'Loading profile...',
        profileNotFound: 'Profile Not Found',
        backToHome: 'Back to Home',
        professional: 'Professional',
        events: 'Events',
        about: 'About',
        noEventsOrganized: 'No events organized yet',
        contact: 'Contact',
        information: 'Information',
        memberSince: 'Member since:',
        status: 'Status:',
        backToEvents: 'Back to Events',
      },

      // ==========================================
      // ABOUT PAGE
      // ==========================================
      about: {
        title: 'About Je m\'inspire',
        subtitle: 'The platform that connects enthusiasts to events that inspire them',
        
        // Mission
        missionTitle: 'Our Mission',
        missionText1: 'Je m\'inspire was born from a simple vision: to make the discovery and organization of events accessible to all. Whether you are a passionate organizer looking to share your expertise, or a participant seeking new experiences, our platform supports you every step of the way.',
        missionText2: 'We believe that events have the power to transform lives, create authentic connections and inspire change. That\'s why we strive to offer a smooth, secure and enriching experience.',
        
        // Values
        valuesTitle: 'Our Values',
        
        // History
        historyTitle: 'Our Story',
        historyText1: 'Founded by event enthusiasts, Je m\'inspire is the result of several years of experience in event organization and management. Faced with the challenges encountered by independent organizers, we created a solution that simplifies ticketing, secures payments and promotes visibility.',
        historyText2: 'Today, we are proud to support thousands of organizers and participants in their event adventures.',
        
        // Why choose us
        whyChooseUsTitle: 'Why Choose Us?',
        securePayments: 'Secure payments via Stripe and PayPal',
        intuitiveInterface: 'Intuitive interface for organizers and participants',
        affiliateProgram: 'Affiliate program to earn commissions',
        reactiveSupport: 'Responsive support and personalized assistance',
        completeDashboard: 'Complete dashboard to track your performance',
        communityEngaged: 'Engaged and passionate community',
        
        // CTA
        joinUsTitle: 'Join Us Today',
        joinUsText: 'Whether you are an organizer or participant, discover how Je m\'inspire can transform your event experience.',
        startNow: 'Start Now',
        explorePlatform: 'Explore Platform',
        back: 'Back',
      },

      // ==========================================
      // VENDOR DASHBOARD
      // ==========================================
      vendorDashboard: {
        export: 'Export',
        date: 'Date',
        commission: 'Commission',
        net: 'Net',
        loadingError: 'Error loading data',
        exportError: 'Export error',
      },

      // ==========================================
      // ERRORS & MESSAGES
      // ==========================================
      errors: {
        somethingWentWrong: 'Something Went Wrong',
        technicalTeamNotified: 'The technical team has been notified.',
        reloadPage: 'Reload Page',
        tryAgain: 'Try Again',
        errorOccurred: 'An error occurred',
        invalidResetLink: 'Invalid reset link. Please request a new password reset.',
      },

      // ==========================================
      // FORM ELEMENTS
      // ==========================================
      form: {
        forgotPassword: 'Forgot your password?',
        placeholder: {
          email: 'example@email.com',
          password: '********',
        },
      },

      // ==========================================
      // ACCESSIBILITY
      // ==========================================
      accessibility: {
        toggleMenu: 'Toggle Menu',
        logout: 'Logout',
        back: 'Back',
        changeLanguage: 'Change Language',
        logo: 'Logo',
        heroBackground: 'Hero Background',
        ourMission: 'Our Mission',
        avatar: 'Avatar',
        preview: 'Preview',
      },

      // ==========================================
      // SOCIAL MEDIA
      // ==========================================
      socialMedia: {
        facebook: 'Facebook',
        instagram: 'Instagram',
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
      },
    }
  }
};

// Récupérer la langue sauvegardée ou utiliser 'fr' par défaut
const savedLanguage = typeof window !== 'undefined' 
  ? localStorage.getItem('language') || 'fr'
  : 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

// Sauvegarder automatiquement la langue à chaque changement
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
  }
});
export default i18n;
