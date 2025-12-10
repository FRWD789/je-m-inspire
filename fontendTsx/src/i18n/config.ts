// fontendTsx/src/i18n/config.ts
import i18n from 'i18next';
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
        
        // Forgot Password
        forgotPasswordDescription: "Entrez votre email et nous vous enverrons un lien de réinitialisation",
        sendResetLink: "Envoyer le lien",
        sending: "Envoi...",
        backToLogin: "Retour à la connexion",
        emailRequired: "L'email est requis",
        resetLinkSent: "Lien de réinitialisation envoyé à votre email",
        resetLinkError: "Une erreur s'est produite. Veuillez réessayer.",
        
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
      // VALIDATION MESSAGES
      // ==========================================
      validation: {
        email: 'Veuillez entrer une adresse email valide',
        minLength: 'Doit contenir au moins {{count}} caractères',
        maxLength: 'Ne doit pas dépasser {{count}} caractères',
        required: 'Ce champ est requis',
        passwordMismatch: 'Les mots de passe ne correspondent pas',
        invalidDate: 'Date invalide',
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
        back: 'Retour',
        
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
        confirmApprove: 'Êtes-vous sûr de vouloir approuver {{name}} ?',
        confirmReject: 'Êtes-vous sûr de vouloir rejeter {{name}} ?',
        confirmRevoke: 'Êtes-vous sûr de vouloir révoquer {{name}} ?',
        approveSuccess: 'Professionnel approuvé avec succès',
        rejectSuccess: 'Professionnel rejeté avec succès',
        revokeSuccess: 'Professionnel révoqué avec succès',
        actionError: "Erreur lors de l'opération",
        close: 'Fermer',
      },

      // ==========================================
      // SUIVIS (FOLLOWING)
      // ==========================================
      following: {
        title: 'Mes Suivis',
        noFollowing: 'Vous ne suivez aucun professionnel pour le moment',
        discover: 'Découvrir des professionnels',
        loading: 'Chargement de vos suivis...',
        error: 'Erreur lors du chargement',
        retry: 'Réessayer',
        follow: 'Suivre',
        unfollow: 'Ne plus suivre',
        followers: 'abonnés',
        viewProfile: 'Voir le profil',
        notifications: 'Notifications',
        notificationsEnabled: 'Notifications activées',
        notificationsDisabled: 'Notifications désactivées',
        toggleNotifications: 'Activer/Désactiver les notifications',
        unfollowSuccess: 'Vous ne suivez plus {{name}}',
        followSuccess: 'Vous suivez maintenant {{name}}',
        notificationToggleSuccess: 'Préférences de notification mises à jour',
        searchPlaceholder: 'Rechercher des professionnels...',
        browseEvents: 'Parcourir les événements',
        discoverPros: 'Découvrir des professionnels',
        noFollowingDesc: 'Suivez des professionnels pour recevoir des mises à jour sur leurs nouveaux événements et offres.',

      },

      // ==========================================
      // CALENDAR
      // ==========================================
      calendar: {
        title: 'Calendrier des événements',
        prev: 'Mois précédent',
        next: 'Mois suivant',
        eventsFor: 'Événements du',
        close: 'Fermer',
        noEventsThisMonth: 'Aucun événement ce mois-ci',
        clickDate: 'Cliquez sur une date pour voir les événements',
      },

      // ==========================================
      // COMMON ELEMENTS
      // ==========================================
      common: {
        // Actions
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        view: 'Voir',
        close: 'Fermer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        confirm: 'Confirmer',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Attention',
        info: 'Information',
        
        // Time
        today: "Aujourd'hui",
        yesterday: 'Hier',
        tomorrow: 'Demain',
        thisWeek: 'Cette semaine',
        thisMonth: 'Ce mois-ci',
        thisYear: 'Cette année',
        
        // Status
        active: 'Actif',
        inactive: 'Inactif',
        pending: 'En attente',
        completed: 'Terminé',
        cancelled: 'Annulé',
        
        // Other
        search: 'Rechercher',
        filter: 'Filtrer',
        sort: 'Trier',
        noResults: 'Aucun résultat',
        viewAll: 'Voir tout',
        showMore: 'Voir plus',
        showLess: 'Voir moins',
        freeAccount: 'Compte gratuit',
        upgradeAccount: 'Améliorer',
        required: 'Requis',
        optional: 'Optionnel',
        yes: 'Oui',
        no: 'Non',
      },

      // ==========================================
      // EVENTS
      // ==========================================
      events: {
        // List & Cards
        title: 'Événements',
        upcoming: 'Événements à venir',
        past: 'Événements passés',
        all: 'Tous les événements',
        myEvents: 'Mes événements',
        noEvents: 'Aucun événement trouvé',
        createEvent: 'Créer un événement',
        viewDetails: 'Voir les détails',
        edit: 'Modifier',
        delete: 'Supprimer',
        share: 'Partager',
        
        // Filters
        filterByCity: 'Filtrer par ville',
        filterByDate: 'Filtrer par date',
        filterByCategory: 'Filtrer par catégorie',
        searchPlaceholder: 'Rechercher un événement...',
        
        // Details
        description: 'Description',
        location: 'Lieu',
        date: 'Date',
        startDate: 'Date de début',
        endDate: 'Date de fin',
        price: 'Prix',
        capacity: 'Capacité',
        spotsLeft: 'Places restantes',
        organizer: 'Organisateur',
        category: 'Catégorie',
        
        // Status
        published: 'Publié',
        draft: 'Brouillon',
        archived: 'Archivé',
        soldOut: 'Complet',
        
        // Actions
        reserve: 'Réserver',
        register: 'S\'inscrire',
        cancel: 'Annuler',
        
        // Messages
        createSuccess: 'Événement créé avec succès',
        updateSuccess: 'Événement mis à jour',
        deleteSuccess: 'Événement supprimé',
        deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet événement ?',
        reservationSuccess: 'Réservation effectuée avec succès',
        reservationError: 'Erreur lors de la réservation',
        
        // Form labels
        eventName: 'Nom de l\'événement',
        eventDescription: 'Description',
        eventLocation: 'Lieu',
        eventAddress: 'Adresse',
        eventCity: 'Ville',
        eventStartDate: 'Date de début',
        eventEndDate: 'Date de fin',
        eventPrice: 'Prix',
        eventCapacity: 'Capacité',
        eventCategory: 'Catégorie',
        eventImage: 'Image',
        
        // Placeholders
        enterEventName: 'Entrez le nom de l\'événement',
        enterDescription: 'Décrivez votre événement',
        selectCategory: 'Sélectionnez une catégorie',
        enterPrice: 'Entrez le prix',
        enterCapacity: 'Nombre de places',
        searchAddress: 'Rechercher une adresse',
      },

      // ==========================================
      // RESERVATIONS
      // ==========================================
      reservations: {
        title: 'Mes Réservations',
        upcoming: 'À venir',
        past: 'Passées',
        cancelled: 'Annulées',
        noReservations: 'Vous n\'avez aucune réservation',
        viewEvent: 'Voir l\'événement',
        cancelReservation: 'Annuler la réservation',
        confirmCancel: 'Êtes-vous sûr de vouloir annuler cette réservation ?',
        cancelSuccess: 'Réservation annulée',
        reservationNumber: 'Numéro de réservation',
        reservationDate: 'Date de réservation',
        totalAmount: 'Montant total',
        status: 'Statut',
        refundAmount: 'Montant remboursé',
        refundStatus: 'Statut du remboursement',
      },

      // ==========================================
      // PAYMENT
      // ==========================================
      payment: {
        title: 'Paiement',
        selectMethod: 'Sélectionnez un mode de paiement',
        creditCard: 'Carte bancaire',
        paypal: 'PayPal',
        orderSummary: 'Récapitulatif de la commande',
        subtotal: 'Sous-total',
        fees: 'Frais',
        total: 'Total',
        proceedToPayment: 'Procéder au paiement',
        processing: 'Traitement en cours...',
        success: 'Paiement réussi !',
        error: 'Erreur de paiement',
        cancelled: 'Paiement annulé',
        retry: 'Réessayer',
        backToEvents: 'Retour aux événements',
        viewReservation: 'Voir ma réservation',
        paymentMethod: 'Mode de paiement',
        securePayment: 'Paiement sécurisé',
        confirmPayment: 'Confirmer le paiement',
      },

      // ==========================================
      // PROFILE & SETTINGS
      // ==========================================
      profile: {
        title: 'Mon Profil',
        editProfile: 'Modifier le profil',
        personalInfo: 'Informations personnelles',
        accountSettings: 'Paramètres du compte',
        name: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        bio: 'Biographie',
        profilePicture: 'Photo de profil',
        changePassword: 'Changer le mot de passe',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        updateSuccess: 'Profil mis à jour',
        passwordUpdateSuccess: 'Mot de passe mis à jour',
        uploadPhoto: 'Télécharger une photo',
        deleteAccount: 'Supprimer le compte',
        deleteAccountConfirm: 'Êtes-vous sûr ? Cette action est irréversible.',
        
        // Professional settings
        businessInfo: 'Informations professionnelles',
        businessName: 'Nom de l\'entreprise',
        businessDescription: 'Description',
        website: 'Site web',
        socialMedia: 'Réseaux sociaux',
        
        // Subscription
        subscription: 'Abonnement',
        currentPlan: 'Forfait actuel',
        upgradePlan: 'Améliorer le forfait',
        cancelSubscription: 'Annuler l\'abonnement',
        renewalDate: 'Date de renouvellement',
        
        // Payment methods
        paymentMethods: 'Modes de paiement',
        addPaymentMethod: 'Ajouter un mode de paiement',
        defaultPaymentMethod: 'Mode de paiement par défaut',
        
        // Linked accounts
        linkedAccounts: 'Comptes liés',
        linkStripe: 'Lier Stripe',
        linkPayPal: 'Lier PayPal',
        unlinkAccount: 'Délier le compte',
        accountLinked: 'Compte lié',
        accountNotLinked: 'Compte non lié',
      },

      // ==========================================
      // SUBSCRIPTION & PLANS
      // ==========================================
      subscription: {
        title: 'Abonnement',
        choosePlan: 'Choisissez votre forfait',
        currentPlan: 'Forfait actuel',
        upgrade: 'Améliorer',
        downgrade: 'Rétrograder',
        cancel: 'Annuler',
        
        // Plans
        free: 'Gratuit',
        pro: 'Pro',
        proPlus: 'Pro Plus',
        
        // Features
        features: 'Fonctionnalités',
        eventsPerMonth: 'événements par mois',
        commission: 'commission',
        support: 'Support',
        analytics: 'Analytiques',
        prioritySupport: 'Support prioritaire',
        customBranding: 'Personnalisation',
        
        // Billing
        monthly: 'Mensuel',
        yearly: 'Annuel',
        savePercent: 'Économisez {{percent}}%',
        billingCycle: 'Cycle de facturation',
        nextBilling: 'Prochaine facturation',
        
        // Messages
        upgradeSuccess: 'Abonnement mis à jour',
        cancelSuccess: 'Abonnement annulé',
        cancelConfirm: 'Êtes-vous sûr de vouloir annuler votre abonnement ?',
      },

      // ==========================================
      // NOTIFICATIONS
      // ==========================================
      notifications: {
        title: 'Notifications',
        markAllRead: 'Tout marquer comme lu',
        noNotifications: 'Aucune notification',
        newEvent: 'Nouvel événement',
        newReservation: 'Nouvelle réservation',
        eventUpdate: 'Mise à jour d\'événement',
        eventCancelled: 'Événement annulé',
        paymentReceived: 'Paiement reçu',
        refundProcessed: 'Remboursement traité',
        
        // Settings
        notificationSettings: 'Paramètres de notification',
        emailNotifications: 'Notifications par email',
        pushNotifications: 'Notifications push',
        eventReminders: 'Rappels d\'événements',
        reservationUpdates: 'Mises à jour de réservations',
        paymentAlerts: 'Alertes de paiement',
        marketingEmails: 'Emails marketing',
      },

      // ==========================================
      // ANALYTICS (PRO)
      // ==========================================
      analytics: {
        title: 'Analytiques',
        overview: 'Vue d\'ensemble',
        revenue: 'Revenus',
        events: 'Événements',
        reservations: 'Réservations',
        visitors: 'Visiteurs',
        
        // Metrics
        totalRevenue: 'Revenus totaux',
        totalEvents: 'Total événements',
        totalReservations: 'Total réservations',
        averageTicketPrice: 'Prix moyen du billet',
        conversionRate: 'Taux de conversion',
        
        // Time periods
        last7Days: '7 derniers jours',
        last30Days: '30 derniers jours',
        last90Days: '90 derniers jours',
        thisYear: 'Cette année',
        custom: 'Personnalisé',
        
        // Charts
        revenueChart: 'Graphique des revenus',
        reservationsChart: 'Graphique des réservations',
        popularEvents: 'Événements populaires',
        
        // Export
        exportData: 'Exporter les données',
        exportCSV: 'Exporter en CSV',
        exportPDF: 'Exporter en PDF',
      },

      // ==========================================
      // GOOGLE CALLBACK
      // ==========================================
      google: {
        connectionInProgress: 'Connexion Google en cours...',
        connectionCancelled: 'Connexion Google annulée ou refusée',
        connectionError: 'Erreur lors de la connexion Google',
        authorizationCodeMissing: 'Code d\'autorisation manquant',
        redirectingToLogin: 'Redirection vers la page de connexion...',
      },

      // ==========================================
      // LINKED ACCOUNTS
      // ==========================================
      linkedAccount: {
        finalizingInProgress: 'Finalisation en cours...',
        linkingAccount: 'Liaison de votre compte {{provider}} en cours',
        linkingError: 'Erreur de liaison',
        backToProfile: 'Retour au profil',
        accountLinkedSuccess: 'Compte {{provider}} lié avec succès !',
        canReceivePayments: 'Vous pouvez maintenant recevoir des paiements via {{provider}}',
        automaticRedirection: 'Redirection automatique...',
        goToProfileNow: 'Aller au profil maintenant',
      },

      // ==========================================
      // SUBSCRIPTION SUCCESS
      // ==========================================
      subscriptionSuccess: {
        title: 'Abonnement Activé avec Succès !',
        message: 'Merci de votre confiance. Vous pouvez maintenant profiter de toutes les fonctionnalités professionnelles.',
        continue: 'Continuer',
      },

      // ==========================================
      // PAYMENT SUCCESS
      // ==========================================
      paymentSuccess: {
        verificationInProgress: 'Vérification en cours...',
        verifyingPaymentStatus: 'Vérification du statut de votre paiement',
        paymentFailed: 'Paiement échoué',
        paymentError: 'Une erreur est survenue lors du paiement',
        backToEvents: 'Retour aux événements',
        retry: 'Réessayer',
        paymentPending: 'Paiement en cours',
        paymentPendingMessage: 'Votre paiement est en cours de traitement. Vous recevrez un email de confirmation une fois le paiement validé.',
        viewMyReservations: 'Voir mes réservations',
        reservationConfirmed: 'Réservation confirmée !',
        emailConfirmation: 'Vous recevrez un email de confirmation avec tous les détails',
        paymentDetails: 'Détails du paiement',
        totalAmount: 'Montant total',
        status: 'Statut',
        paid: 'Payé',
        reservationNumber: 'Numéro de réservation',
      },

      // ==========================================
      // ABONNEMENT (SUBSCRIPTION)
      // ==========================================
      abonnement: {
        // Loading & Errors
        subscriptionDataUnavailable: 'Données d\'abonnement indisponibles',
        cannotLoadInfo: 'Impossible de charger les informations d\'abonnement',
        
        // Preparation steps
        initializingSubscription: 'Initialisation de l\'abonnement...',
        preparingFeatures: 'Préparation des fonctionnalités...',
        configuringAccount: 'Configuration de votre compte...',
        almostDone: 'Presque terminé...',
        redirectingToPayment: 'Redirection vers le paiement...',
        preparingYourSubscription: 'Préparation de votre abonnement',
        
        // Subscribe actions
        paymentLinkNotFound: 'Lien de paiement introuvable',
        subscriptionCreationError: 'Erreur lors de la création de l\'abonnement',
        cancelConfirmation: 'Êtes-vous sûr de vouloir annuler votre abonnement Pro Plus ?',
        subscriptionWillCancel: 'Votre abonnement sera annulé à la fin de la période en cours',
        cancellationError: 'Erreur lors de l\'annulation',
        
        // Active subscription page
        myProPlusSubscription: 'Mon Abonnement Pro Plus',
        activeSubscription: 'Abonnement Actif',
        unlimitedAccess: 'Accès illimité à toutes les fonctionnalités professionnelles',
        subscriptionType: 'Type d\'abonnement',
        renewalDate: 'Date de renouvellement',
        cancelSubscription: 'Annuler l\'abonnement',
        yourCurrentBenefits: 'Vos avantages actuels',
        directPayments: 'Paiements directs',
        directPaymentsDesc: 'Recevez les paiements instantanément sans délai',
        reducedCommission: 'Commission réduite',
        reducedCommissionDesc: 'Seulement 5% au lieu de 15%',
        
        // Subscription offer page
        proOfferBadge: 'OFFRE PRO+',
        maximizeYourEarnings: 'Maximisez vos revenus avec Pro Plus',
        unlockProPlus: 'Débloquez Pro Plus et recevez vos paiements instantanément avec seulement 5% de commission',
        
        // Free plan
        freeAccount: 'Compte Gratuit',
        currentPlan: 'Votre plan actuel',
        indirectPayments: 'Paiements indirects',
        indirectPaymentsDesc: 'Délai de 7-14 jours pour recevoir vos paiements',
        standardCommission: 'Commission standard',
        standardCommissionDesc: '15% de commission sur chaque vente',
        limitedFeatures: 'Fonctionnalités limitées',
        restrictedAccess: 'Accès restreint aux outils avancés',
        
        // Pro Plus plan
        recommended: 'RECOMMANDÉ',
        forSeriousProfessionals: 'Pour les professionnels sérieux',
        instantPayments: 'Paiements instantanés',
        instantPaymentsDesc: 'Recevez vos paiements immédiatement après chaque vente',
        reducedCommissionProDesc: 'Seulement 5% de commission au lieu de 15%',
        advancedTools: 'Outils avancés',
        advancedToolsDesc: 'Statistiques détaillées et gestion complète',
        month: 'mois',
        cancelAnytime: 'Annuler à tout moment',
        subscribeWithStripe: 'S\'abonner avec Stripe',
        subscribeWithPayPal: 'S\'abonner avec PayPal',
        
        // Why Pro Plus section
        whyChooseProPlus: 'Pourquoi choisir Pro Plus ?',
        instantAccess: 'Accès Instantané',
        instantAccessDesc: 'Recevez vos paiements immédiatement sans attendre',
        moreEarnings: 'Plus de Revenus',
        moreEarningsDesc: 'Économisez 10% sur chaque transaction avec notre commission réduite',
        growYourBusiness: 'Développez votre Activité',
        growYourBusinessDesc: 'Accédez à des outils professionnels pour optimiser vos performances',
      },

      // ==========================================
      // LINKED ACCOUNTS SECTION
      // ==========================================
      linkedAccounts: {
        loadingInfo: 'Chargement des informations...',
        loadingLinkedAccounts: 'Chargement des comptes liés...',
        
        // Feature reserved
        featureReserved: 'Fonctionnalité réservée',
        featureReservedDesc: 'Le lien vers Stripe et PayPal est réservé aux utilisateurs avec l\'abonnement Pro Plus.',
        upgradeToProPlus: 'Passer à Pro Plus',
        
        // Account status
        accountLinked: 'Compte lié',
        noAccountLinked: 'Aucun compte lié',
        
        // Actions
        linkStripe: 'Lier Stripe',
        linkPayPal: 'Lier PayPal',
        unlink: 'Délier',
        linkingError: 'Erreur lors de la liaison du compte.',
        unlinkingError: 'Erreur lors de la déliaison du compte.',
        accountUnlinkedSuccess: 'Compte {{provider}} délié avec succès.',
        
        // Cancel subscription
        cancelConfirmation: 'Êtes-vous sûr de vouloir annuler votre abonnement Pro Plus ?\n\nVous perdrez l\'accès aux fonctionnalités suivantes :\n• Liaison de comptes Stripe et PayPal\n• Réception directe des paiements\nVos comptes liés seront automatiquement dissociés.',
        subscriptionCancelledSuccess: 'Abonnement annulé avec succès.',
        cancellationError: 'Erreur lors de l\'annulation de l\'abonnement.',
        
        // Status messages
        scheduledCancellation: 'Annulation programmée',
        scheduledCancellationDesc: 'Votre abonnement Pro Plus sera annulé à la fin de la période en cours.',
        endDate: 'Date de fin',
        activeProPlusSubscription: 'Abonnement Pro Plus actif',
        canCancelAnytime: 'Vous pouvez annuler votre abonnement à tout moment. Les comptes liés seront dissociés automatiquement.',
        cancelSubscription: 'Annuler l\'abonnement',
        cancel: 'Annuler',
        cancelling: 'Annulation...',
        processing: 'Traitement en cours...',
      },

      // ==========================================
      // COMMISSIONS (ADMIN)
      // ==========================================
      commissions: {
        // Titles
        title: 'Gestion des Commissions',
        subtitle: 'Gérez les paiements à transférer et les taux de commission',
        loading: 'Chargement...',
        refresh: 'Rafraîchir',
        back: 'Retour',
        
        // Tabs
        paymentsToTransfer: 'Paiements à Transférer',
        paymentsShort: 'Paiements',
        commissionRates: 'Taux de Commission',
        commissionRatesShort: 'Taux',
        
        // Statistics
        totalToTransfer: 'Total à transférer',
        numberOfPayments: 'Nombre de paiements',
        commissionsCollected: 'Commissions prélevées',
        
        // Messages
        noPaymentsToTransfer: 'Aucun paiement à transférer',
        proPlusDirectPayments: 'Tous les professionnels avec Pro Plus et comptes liés reçoivent déjà les paiements directement.',
        noProfessionalsFound: 'Aucun professionnel trouvé',
        noProfessionalsRegistered: 'Il n\'y a actuellement aucun professionnel enregistré.',
        
        // Table headers
        date: 'Date',
        event: 'Événement',
        customer: 'Client',
        vendor: 'Vendeur',
        email: 'Courriel',
        totalAmount: 'Montant total',
        commission: 'Commission',
        toTransfer: 'À transférer',
        actions: 'Actions',
        name: 'Nom',
        currentRate: 'Taux actuel',
        status: 'Statut',
        accounts: 'Comptes',
        
        // Actions
        copied: 'Copié !',
        clickToCopy: 'Cliquer pour copier',
        markAsPaid: 'Marquer comme payé',
        processing: 'Traitement...',
        edit: 'Modifier',
        editRate: 'Modifier le taux',
        save: 'Enregistrer',
        newCommissionRate: 'Nouveau taux de commission',
        
        // Status badges
        proPlus: 'Pro Plus',
        notApproved: 'Non approuvé',
        none: 'Aucun',
        noLinkedAccount: 'Aucun compte lié',
        
        // Alerts & Errors
        confirmTransfer: 'Confirmer que vous avez transféré ce paiement au vendeur ?',
        markedAsPaidSuccess: 'Commission marquée comme payée avec succès',
        markingError: 'Erreur lors du marquage de la commission',
        rateUpdatedSuccess: 'Taux de commission mis à jour avec succès',
        rateUpdateError: 'Erreur lors de la mise à jour du taux',
        loadingError: 'Erreur lors du chargement des commissions',
        professionalsLoadingError: 'Erreur lors du chargement des professionnels',
        copyError: 'Erreur lors de la copie du courriel',
      },

      // ==========================================
      // PROFESSIONALS
      // ==========================================
      professionals: {
        title: 'Nos Professionnels',
        subtitle: 'Découvrez les professionnels qualifiés sur notre plateforme',
        loadingProfessionals: 'Chargement des professionnels...',
        noProfessionalsFound: 'Aucun professionnel trouvé',
        searchPlaceholder: 'Rechercher par nom ou ville...',
        retry: 'Réessayer',
        
        // Profile
        loadingProfile: 'Chargement du profil...',
        profileNotFound: 'Profil Non Trouvé',
        backToHome: 'Retour à l\'Accueil',
        professional: 'Professionnel',
        events: 'Événements',
        about: 'À propos',
        noEventsOrganized: 'Aucun événement organisé pour le moment',
        contact: 'Contact',
        information: 'Informations',
        memberSince: 'Membre depuis :',
        status: 'Statut :',
        backToEvents: 'Retour aux Événements',
      },

      // ==========================================
      // ABOUT PAGE
      // ==========================================
      about: {
        title: 'À propos de Je m\'inspire',
        subtitle: 'La plateforme qui connecte les passionnés aux événements qui les inspirent',
        
        // Stats
        eventsCreated: 'Événements créés',
        activeUsers: 'Utilisateurs actifs',
        customerSatisfaction: 'Satisfaction client',
        supportAvailable: 'Support disponible',
        
        // Values
        valuesTitle: 'Nos Valeurs',
        passionTitle: 'Passion',
        passionDescription: 'Nous croyons que chaque événement est une opportunité de créer des souvenirs inoubliables.',
        communityTitle: 'Communauté',
        communityDescription: 'Connecter les organisateurs avec leur public est au cœur de notre mission.',
        trustTitle: 'Confiance',
        trustDescription: 'Sécurité des paiements et protection des données sont nos priorités absolues.',
        innovationTitle: 'Innovation',
        innovationDescription: 'Nous améliorons constamment notre plateforme pour vous offrir la meilleure expérience.',
        
        // Mission
        ourMission: 'Notre mission',
        missionTitle: 'Notre Mission',
        missionText1: 'Je m\'inspire est né d\'une vision simple : rendre la découverte et l\'organisation d\'événements accessible à tous. Que vous soyez un organisateur passionné cherchant à partager votre expertise, ou un participant en quête de nouvelles expériences, notre plateforme vous accompagne à chaque étape.',
        missionText2: 'Nous croyons que les événements ont le pouvoir de transformer les vies, de créer des connexions authentiques et d\'inspirer le changement. C\'est pourquoi nous mettons tout en œuvre pour offrir une expérience fluide, sécurisée et enrichissante.',
        
        // History
        historyTitle: 'Notre Histoire',
        historyText1: 'Fondée par des passionnés d\'événementiel, Je m\'inspire est le fruit de plusieurs années d\'expérience dans l\'organisation et la gestion d\'événements. Face aux défis rencontrés par les organisateurs indépendants, nous avons créé une solution qui simplifie la billetterie, sécurise les paiements et favorise la visibilité.',
        historyText2: 'Aujourd\'hui, nous sommes fiers d\'accompagner des milliers d\'organisateurs et de participants dans leurs aventures événementielles.',
        
        // Why choose us
        whyChooseUsTitle: 'Pourquoi nous choisir ?',
        securePayments: 'Paiements sécurisés via Stripe et PayPal',
        intuitiveInterface: 'Interface intuitive pour organisateurs et participants',
        affiliateProgram: 'Programme d\'affiliation pour gagner des commissions',
        reactiveSupport: 'Support réactif et accompagnement personnalisé',
        completeDashboard: 'Tableau de bord complet pour suivre vos performances',
        
        // Contact
        contactTitle: 'Une question ? Contactez-nous',
        contactDescription: 'Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans votre utilisation de la plateforme.',
        discoverEvents: 'Découvrir les événements',
      },

      // ==========================================
      // VENDOR DASHBOARD
      // ==========================================
      vendorDashboard: {
        export: 'Exporter',
        date: 'Date',
        commission: 'Commission',
        net: 'Net',
        loadingError: 'Erreur de chargement des données',
        exportError: 'Erreur d\'exportation',
      },

      // ==========================================
      // EVENT FORM
      // ==========================================
      eventForm: {
        // Buttons
        createEvent: 'Créer l\'événement',
        editEvent: 'Modifier l\'événement',
        
        // Sections
        generalInfo: 'Informations générales',
        location: 'Localisation',
        datesCapacity: 'Dates et capacité',
        eventSettings: 'Paramètres de l\'événement',
        eventImages: 'Images de l\'événement',
        
        // General Info
        eventName: 'Nom de l\'événement *',
        eventNamePlaceholder: 'Ex: Retraite de méditation en montagne',
        description: 'Description *',
        descriptionPlaceholder: 'Décrivez votre événement en détails...',
        
        // Location
        eventAddress: 'Adresse de l\'événement *',
        
        // Dates & Capacity
        startDate: 'Date de début *',
        endDate: 'Date de fin *',
        price: 'Prix (CAD) *',
        totalCapacity: 'Capacité totale *',
        availablePlaces: 'Places disponibles *',
        
        // Settings
        requiredLevel: 'Niveau requis *',
        selectLevel: 'Sélectionnez le niveau',
        category: 'Catégorie *',
        selectCategory: 'Sélectionnez une catégorie',
        
        // Levels
        levelBeginner: 'Débutant',
        levelIntermediate: 'Intermédiaire',
        levelAdvanced: 'Avancé',
        levelExpert: 'Expert',
        
        // Categories
        categoryMeditation: 'Méditation',
        categoryYoga: 'Yoga',
        categoryMentalHealth: 'Santé Mentale',
        categoryRetreat: 'Retraite',
        
        // Images
        thumbnailLabel: 'Image principale (Thumbnail) *',
        clickToAddImage: 'Cliquez pour ajouter une image',
        imageFormat: 'PNG, JPG jusqu\'à 10MB',
        bannerLabel: 'Bannière de l\'événement *',
        clickToAddBanner: 'Cliquez pour ajouter une bannière',
        bannerFormat: 'Format 16:9 recommandé',
        galleryLabel: 'Galerie d\'images (max 5)',
        galleryLimitReached: 'Limite de 5 images atteinte',
        addImagesToGallery: 'Ajouter des images à la galerie',
        imagesCount: '{{count}}/5 images',
        deleteImage: 'Supprimer',
        
        // Status messages
        loadingExistingImages: 'Chargement des images existantes...',
        existingImagesLoaded: 'Images existantes chargées !',
        loadingError: 'Erreur chargement images',
        compressing: 'Compression en cours...',
        compressionError: 'Erreur lors de la compression',
        compressingProgress: 'Compression {{current}}/{{total}}...',
      },

      // ==========================================
      // PROFESSIONAL EVENT CARD
      // ==========================================
      professionalEventCard: {
        // Image
        noImage: 'Aucune image',
        
        // Event info
        level: 'Niveau',
        dateRange: 'Du {{start}} au {{end}}',
        free: 'Gratuit',
        
        // Status
        eventCancelled: 'Événement annulé',
        
        // Buttons
        viewDetails: 'Voir détails',
        edit: 'Modifier',
        editShort: 'Éditer',
        manage: 'Gérer',
        
        // Manage popup
        manageEvent: 'Gérer l\'événement',
        downloadList: 'Télécharger la liste',
        participantsPdf: 'PDF des participants',
        printList: 'Imprimer la liste',
        directPrint: 'Impression directe',
        cancelEvent: 'Annuler l\'événement',
        hideAndRefund: 'Masquer et rembourser participants',
        
        // Messages
        downloadSuccess: 'Liste des participants téléchargée avec succès !',
        downloadError: 'Erreur lors du téléchargement de la liste',
        printError: 'Erreur lors de l\'impression de la liste',
        
        // Cancel confirmation
        cancelConfirmation: '⚠️ ATTENTION : Cette action va :\n\n1. Masquer l\'événement pour les nouveaux utilisateurs\n2. Créer des demandes de remboursement pour tous les participants\n3. Vous devrez rembourser manuellement chaque participant\n\nÊtes-vous sûr de vouloir annuler cet événement ?',
        cancelSuccess: '✅ Événement annulé avec succès !\n\n{{count}} demande(s) de remboursement créée(s).\nVous recevrez un email avec la liste des participants à rembourser.',
        cancelError: 'Erreur lors de l\'annulation de l\'événement',
        
        // Loading
        cancelling: 'Annulation en cours...',
        processing: 'Traitement...',
      },

      // ==========================================
      // EVENT DETAIL
      // ==========================================
      eventDetail: {
        // Hero section
        backToEvents: 'Retour aux événements',
        addressToCome: 'Adresse à venir',
        
        // Organizer
        organizer: 'Organisateur',
        photoOf: 'Photo de {{name}}',
        organizedBy: 'Organisé par',
        anonymousOrganizer: 'Organisateur anonyme',
        
        // Reservation
        reserveYourSpot: 'Réserver votre place',
        reserveNow: 'Réserver maintenant',
        total: 'Total',
        paymentMethod: 'Méthode de paiement',
        proceedToPayment: 'Procéder au paiement',
        mustBeLoggedIn: 'Vous devez être connecté pour réserver un événement.',
        mustBeLoggedInToReserve: 'Vous devez être connecté pour réserver cet événement.',
        
        // Event info
        aboutEvent: 'À propos de l\'événement',
        noDescriptionAvailable: 'Aucune description disponible.',
        category: 'Catégorie',
        noImagesAvailable: 'Aucune image disponible',
        
        // Location
        location: 'Localisation',
        eventLocation: 'Localisation de l\'événement',
        addressNotAvailable: 'Adresse non disponible',
        
        // Loading & Errors
        loadingEvent: 'Chargement de l\'événement...',
        eventNotFound: 'Événement introuvable',
        backToList: 'Retour à la liste',
        paymentError: 'Une erreur est survenue lors du paiement. Veuillez réessayer.',
      },

      // ==========================================
      // PUBLIC EVENTS
      // ==========================================
      publicEvents: {
        // Search & Filters
        searchPlaceholder: 'Rechercher un événement...',
        filters: 'Filtres',
        category: 'Catégorie',
        allCategories: 'Toutes les catégories',
        city: 'Ville',
        allCities: 'Toutes les villes',
        sortByPrice: 'Tri par prix',
        defaultSort: 'Par défaut',
        priceAscending: 'Prix croissant',
        priceDescending: 'Prix décroissant',
        date: 'Date',
        dateAll: 'Tous',
        dateToday: 'Aujourd\'hui',
        dateWeek: 'Cette semaine',
        dateMonth: 'Ce mois',
        maxPrice: 'Prix max: {{price}} $',
        resetFilters: 'Réinitialiser les filtres',
        
        // Results
        loading: 'Chargement...',
        eventsFound: '{{count}} événement trouvé',
        eventsFound_other: '{{count}} événements trouvés',
        loadingEvents: 'Chargement des événements...',
        noEventsFound: 'Aucun événement trouvé',
        tryModifyingFilters: 'Essayez de modifier vos filtres de recherche',
        
        // Event card
        availablePlaces: '{{count}} place',
        availablePlaces_other: '{{count}} places',
        full: 'Complet',
        free: 'Gratuit',
        level: 'Niveau',
        
        // Map
        dragToResize: '← Glisser pour redimensionner →',
        eventsMap: 'Carte des événements',
        eventsOnMap: '{{count}} événement sur la carte',
        eventsOnMap_other: '{{count}} événements sur la carte',
        noEventsToDisplay: 'Aucun événement à afficher',
        eventsWillAppearHere: 'Les événements apparaîtront ici',
      },

      // ==========================================
      // PRO PROFILE
      // ==========================================
      proProfile: {
        // Loading & Errors
        loadingProfile: 'Chargement du profil...',
        failedToLoadProfile: 'Impossible de charger le profil',
        profileNotFound: 'Profil non trouvé',
        backToHome: 'Retour à l\'accueil',
        
        // Profile info
        professional: 'Professionnel',
        memberSince: 'Membre depuis',
        events: 'Événements',
        profileOf: 'Profil de {{name}}',
        
        // Sections
        about: 'À propos',
        organizedEvents: 'Événements organisés ({{count}})',
        seeAllEvents: 'Voir tous les événements →',
        noEventsYet: 'Aucun événement organisé pour le moment',
        
        // Sidebar
        contact: 'Contact',
        information: 'Informations',
        memberSinceLabel: 'Membre depuis',
        status: 'Statut',
        user: 'Utilisateur',
        followYou: 'vous suivent',
        followYou_singular: 'vous suit',
      },

      // ==========================================
      // PROFESSIONALS PAGE
      // ==========================================
      professionalsPage: {
        // Loading & Error
        loadingProfessionals: 'Chargement des professionnels...',
        loadError: 'Impossible de charger les professionnels',
        retry: 'Réessayer',
        
        // Header
        title: 'Nos Professionnels',
        subtitle: 'Découvrez les professionnels qualifiés de notre plateforme',
        
        // Search
        searchPlaceholder: 'Rechercher par nom ou ville...',
        
        // Stats
        professionalsAvailable: 'professionnel disponible',
        professionalsAvailable_other: 'professionnels disponibles',
        resultsOutOf: 'résultat sur {{total}}',
        resultsOutOf_other: 'résultats sur {{total}}',
        
        // Empty state
        noProfessionalsFound: 'Aucun professionnel trouvé',
        tryOtherKeywords: 'Essayez avec d\'autres mots-clés',
        noProfessionalsAvailable: 'Aucun professionnel n\'est disponible pour le moment',
      },

      // ==========================================
      // LANGUAGE SWITCHER
      // ==========================================
      language: {
        switchToEnglish: 'Switch to English',
        switchToFrench: 'Passer en français',
        changeLanguage: 'Changer de langue',
        currentFrench: 'Français',
        currentEnglish: 'Anglais',
      },

      // ==========================================
      // AUTOCOMPLETE
      // ==========================================
      autocomplete: {
        searchAddress: 'Rechercher une adresse...',
        clear: 'Effacer',
      },

      // ==========================================
      // CAROUSEL
      // ==========================================
      carousel: {
        errorMessage: 'useCarousel must be used within a <Carousel />',
      },

      // ==========================================
      // FORM
      // ==========================================
      formField: {
        forgotPassword: 'Mot de passe oublié ?',
      },

      // ==========================================
      // FORGOT PASSWORD PAGE
      // ==========================================
      forgotPassword: {
        resetLinkSent: 'Lien de réinitialisation envoyé à votre email',
        resetLinkError: 'Une erreur est survenue. Veuillez réessayer.',
      },

      // ==========================================
      // ERROR FALLBACK
      // ==========================================
      errorFallback: {
        title: 'Une erreur est survenue',
        description: 'L\'équipe technique a été notifiée.',
        reloadPage: 'Recharger la page',
      },

      // ==========================================
      // ERRORS & MESSAGES
      // ==========================================
      errors: {
        somethingWentWrong: 'Quelque chose s\'est mal passé',
        technicalTeamNotified: 'L\'équipe technique a été notifiée.',
        reloadPage: 'Recharger la page',
        tryAgain: 'Réessayer',
        errorOccurred: 'Une erreur est survenue',
        invalidResetLink: 'Lien de réinitialisation invalide. Veuillez demander une nouvelle réinitialisation de mot de passe.',
      },

      // ==========================================
      // ACCESSIBILITY
      // ==========================================
      accessibility: {
        toggleMenu: 'Basculer le menu',
        logout: 'Déconnexion',
        back: 'Retour',
        changeLanguage: 'Changer de langue',
        logo: 'Logo',
        heroBackground: 'Arrière-plan héro',
        ourMission: 'Notre Mission',
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
    }
  },
  en: {
    translation: {
      home: {
        heroTitle: "Explore holistic events near you",
        heroSubtitle: "Discover, create and book wellness experiences, retreats and workshops that nourish body, mind and soul.",
        searchPlaceholder: "Search by name...",
        allCities: "All cities",
        viewAllWithCount: "View all {{count}} events...",
        viewAll: "View all events...",
        upcomingEvents: "Upcoming Events",
        cards: {
          title: "Shine your workshops",
          description: "Join, share your holistic events easily."
        },
        newsletter: {
          title: "Join over 2,000 subscribers",
          subtitle: "Stay informed about everything you need to know.",
          placeholder: "Enter your email",
          button: "Subscribe",
          privacy: "We care for your data in our privacy policy"
        }
      },

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
        register: 'Register',
        profile: 'Profile',
        connection: 'Connection',
        inscription: 'Registration'
      },

      experiences: {
        meditation: 'Meditation',
        yoga: 'Yoga & Movement',
        sonotherapy: 'Sound Therapy',
        circles: 'Sharing Circles'
      },

      footer: {
        navigation: 'Navigation',
        followUs: 'Follow Us',
        copyright: 'All rights reserved',
        description: 'The best holistic sanctuary for meditation, yoga and wellness.',
        emailAutomatic: 'This email was sent automatically, please do not reply directly.',
        questions: 'Questions?',
        contactUs: 'Contact Us',
        unsubscribe: 'Unsubscribe'
      },

      auth: {
        loginTitle: 'Welcome Back',
        loginSubtitle: 'Sign in to your Je m\'inspire account',
        email: 'Email',
        emailPlaceholder: 'Enter your email',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        loginButton: 'Sign In',
        noAccount: "Don't have an account?",
        createAccount: 'Create Account',
        forgotPassword: 'Forgot password?',
        middleText: 'Or with your email',
        googleButton: 'Continue with Google',
        googleLoading: 'Signing in...',
        resetPassword: "Reset Password",
        resetPasswordDescription: "Enter your new password below",
        newPassword: "New Password",
        enterNewPassword: "Enter your new password",
        confirmPassword: "Confirm Password",
        confirmNewPassword: "Confirm your new password",
        resetting: "Resetting...",
        invalidResetLink: "Invalid reset link. Please request a new password reset.",
        requestNewReset: "Request new password reset",
        registerUserTitle: 'Create Your Account',
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
        registerButton: "Sign Up",
        alreadyAccount: 'Already have an account?',
        registerPro: 'Join us as a professional',
        
        // Forgot Password
        forgotPasswordDescription: "Enter your email and we'll send you a password reset link",
        sendResetLink: "Send Reset Link",
        sending: "Sending...",
        backToLogin: "Back to Login",
        emailRequired: "Email is required",
        resetLinkSent: "Password reset link sent to your email",
        resetLinkError: "An error occurred. Please try again.",
        
        // Register Professional
        registerProSubtitle: 'Submit your application to become a verified professional',
        businessName: 'Business Name',
        businessNamePlaceholder: 'Enter your business name',
        motivationLetter: 'Motivation Letter',
        descriptionPlaceholder: 'Describe your activity',
        loginSuccess: 'Login successful!',
        loginError: 'Incorrect email or password',
        registerSuccess: 'Registration successful!',
        registerError: "Registration error",
        logoutSuccess: 'Logout successful',
        emailTaken: 'This email is already in use',
        invalidEmail: 'Invalid email',
        passwordTooShort: 'Password must be at least 8 characters',
        passwordMismatch: 'Passwords do not match',
        requiredField: 'This field is required',
        invalidDate: 'Invalid date',
        sessionExpired: 'Your session has expired, please log in again'
      },

      // =========================================
      // VALIDATION MESSAGES
      // =========================================
      validation: {
        email: 'Please enter a valid email address',
        minLength: 'Must contain at least {{count}} characters',
        maxLength: 'Must contain no more than {{count}} characters',
        required: 'This field is required',
        passwordMismatch: 'Passwords do not match',
        invalidDate: 'Invalid date',
      },

      dashboard: {
        nextEvent: "Next Event",
        title: 'Dashboard',
        welcome: 'Welcome',
        titleSideNav: 'Navigation',
        titleSmallSideNav: 'Nav',
        back: 'Back',
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
        quickAccess: "Quick Access",
        manageYourEvents: "Manage your events",
        viewReservations: "View your reservations",
        trackEarnings: "Track your earnings",
        manageUsers: "Manage users"
      },

      approval: {
        title: 'Professional Approval',
        loading: 'Loading...',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        all: 'All',
        refresh: 'Refresh',
        back: 'Back',
        approve: 'Approve',
        reject: 'Reject',
        revoke: 'Revoke',
        reApprove: 'Re-approve',
        name: 'Name',
        email: 'Email',
        city: 'City',
        registration: 'Registration',
        message: 'Message',
        actions: 'Actions',
        noRequestsFound: 'No requests found',
        noMatchingProfessional: 'No professional matching this filter',
        viewMessage: 'View message',
        professionalMessage: 'Professional message',
        confirmApprove: 'Are you sure you want to approve {{name}}?',
        confirmReject: 'Are you sure you want to reject {{name}}?',
        confirmRevoke: 'Are you sure you want to revoke {{name}}?',
        approveSuccess: 'Professional approved successfully',
        rejectSuccess: 'Professional rejected successfully',
        revokeSuccess: 'Professional revoked successfully',
        actionError: "Operation error",
        close: 'Close',
      },

      following: {
        title: 'My Following',
        noFollowing: 'You are not following any professionals yet',
        discover: 'Discover professionals',
        loading: 'Loading your following...',
        error: 'Loading error',
        retry: 'Retry',
        follow: 'Follow',
        unfollow: 'Unfollow',
        followers: 'followers',
        viewProfile: 'View profile',
        notifications: 'Notifications',
        notificationsEnabled: 'Notifications enabled',
        notificationsDisabled: 'Notifications disabled',
        toggleNotifications: 'Toggle notifications',
        unfollowSuccess: 'You are no longer following {{name}}',
        followSuccess: 'You are now following {{name}}',
        notificationToggleSuccess: 'Notification preferences updated',
        searchPlaceholder: 'Search professionals...',
        browseEvents: 'Browse events',
        discoverPros: 'Discover professionals',
        noFollowingDesc: 'Follow professionals to stay updated on their latest events and activities.',

      },

      calendar: {
        title: 'Events Calendar',
        prev: 'Previous month',
        next: 'Next month',
        eventsFor: 'Events for',
        close: 'Close',
        noEventsThisMonth: 'No events this month',
        clickDate: 'Click on a date to see events',
      },

      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        confirm: 'Confirm',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        today: "Today",
        yesterday: 'Yesterday',
        tomorrow: 'Tomorrow',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        thisYear: 'This Year',
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        completed: 'Completed',
        cancelled: 'Cancelled',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        noResults: 'No results',
        viewAll: 'View All',
        showMore: 'Show More',
        showLess: 'Show Less',
        freeAccount: 'Free Account',
        upgradeAccount: 'Upgrade',
        required: 'Required',
        optional: 'Optional',
        yes: 'Yes',
        no: 'No',
      },

      events: {
        title: 'Events',
        upcoming: 'Upcoming Events',
        past: 'Past Events',
        all: 'All Events',
        myEvents: 'My Events',
        noEvents: 'No events found',
        createEvent: 'Create Event',
        viewDetails: 'View Details',
        edit: 'Edit',
        delete: 'Delete',
        share: 'Share',
        filterByCity: 'Filter by city',
        filterByDate: 'Filter by date',
        filterByCategory: 'Filter by category',
        searchPlaceholder: 'Search an event...',
        description: 'Description',
        location: 'Location',
        date: 'Date',
        startDate: 'Start Date',
        endDate: 'End Date',
        price: 'Price',
        capacity: 'Capacity',
        spotsLeft: 'Spots Left',
        organizer: 'Organizer',
        category: 'Category',
        published: 'Published',
        draft: 'Draft',
        archived: 'Archived',
        soldOut: 'Sold Out',
        reserve: 'Reserve',
        register: 'Register',
        cancel: 'Cancel',
        createSuccess: 'Event created successfully',
        updateSuccess: 'Event updated',
        deleteSuccess: 'Event deleted',
        deleteConfirm: 'Are you sure you want to delete this event?',
        reservationSuccess: 'Reservation successful',
        reservationError: 'Reservation error',
        eventName: 'Event Name',
        eventDescription: 'Description',
        eventLocation: 'Location',
        eventAddress: 'Address',
        eventCity: 'City',
        eventStartDate: 'Start Date',
        eventEndDate: 'End Date',
        eventPrice: 'Price',
        eventCapacity: 'Capacity',
        eventCategory: 'Category',
        eventImage: 'Image',
        enterEventName: 'Enter event name',
        enterDescription: 'Describe your event',
        selectCategory: 'Select a category',
        enterPrice: 'Enter price',
        enterCapacity: 'Number of spots',
        searchAddress: 'Search an address',
      },

      reservations: {
        title: 'My Reservations',
        upcoming: 'Upcoming',
        past: 'Past',
        cancelled: 'Cancelled',
        noReservations: 'You have no reservations',
        viewEvent: 'View event',
        cancelReservation: 'Cancel reservation',
        confirmCancel: 'Are you sure you want to cancel this reservation?',
        cancelSuccess: 'Reservation cancelled',
        reservationNumber: 'Reservation number',
        reservationDate: 'Reservation date',
        totalAmount: 'Total amount',
        status: 'Status',
        refundAmount: 'Refund amount',
        refundStatus: 'Refund status',
      },

      payment: {
        title: 'Payment',
        selectMethod: 'Select a payment method',
        creditCard: 'Credit Card',
        paypal: 'PayPal',
        orderSummary: 'Order Summary',
        subtotal: 'Subtotal',
        fees: 'Fees',
        total: 'Total',
        proceedToPayment: 'Proceed to Payment',
        processing: 'Processing...',
        success: 'Payment successful!',
        error: 'Payment error',
        cancelled: 'Payment cancelled',
        retry: 'Retry',
        backToEvents: 'Back to Events',
        viewReservation: 'View my reservation',
        paymentMethod: 'Payment method',
        securePayment: 'Secure payment',
        confirmPayment: 'Confirm payment',
      },

      profile: {
        title: 'My Profile',
        editProfile: 'Edit Profile',
        personalInfo: 'Personal Information',
        accountSettings: 'Account Settings',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        bio: 'Biography',
        profilePicture: 'Profile Picture',
        changePassword: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        updateSuccess: 'Profile updated',
        passwordUpdateSuccess: 'Password updated',
        uploadPhoto: 'Upload Photo',
        deleteAccount: 'Delete Account',
        deleteAccountConfirm: 'Are you sure? This action is irreversible.',
        businessInfo: 'Business Information',
        businessName: 'Business Name',
        businessDescription: 'Description',
        website: 'Website',
        socialMedia: 'Social Media',
        subscription: 'Subscription',
        currentPlan: 'Current Plan',
        upgradePlan: 'Upgrade Plan',
        cancelSubscription: 'Cancel Subscription',
        renewalDate: 'Renewal Date',
        paymentMethods: 'Payment Methods',
        addPaymentMethod: 'Add Payment Method',
        defaultPaymentMethod: 'Default Payment Method',
        linkedAccounts: 'Linked Accounts',
        linkStripe: 'Link Stripe',
        linkPayPal: 'Link PayPal',
        unlinkAccount: 'Unlink Account',
        accountLinked: 'Account Linked',
        accountNotLinked: 'Account Not Linked',
      },

      subscription: {
        title: 'Subscription',
        choosePlan: 'Choose your plan',
        currentPlan: 'Current Plan',
        upgrade: 'Upgrade',
        downgrade: 'Downgrade',
        cancel: 'Cancel',
        free: 'Free',
        pro: 'Pro',
        proPlus: 'Pro Plus',
        features: 'Features',
        eventsPerMonth: 'events per month',
        commission: 'commission',
        support: 'Support',
        analytics: 'Analytics',
        prioritySupport: 'Priority Support',
        customBranding: 'Custom Branding',
        monthly: 'Monthly',
        yearly: 'Yearly',
        savePercent: 'Save {{percent}}%',
        billingCycle: 'Billing Cycle',
        nextBilling: 'Next Billing',
        upgradeSuccess: 'Subscription updated',
        cancelSuccess: 'Subscription cancelled',
        cancelConfirm: 'Are you sure you want to cancel your subscription?',
      },

      notifications: {
        title: 'Notifications',
        markAllRead: 'Mark all as read',
        noNotifications: 'No notifications',
        newEvent: 'New Event',
        newReservation: 'New Reservation',
        eventUpdate: 'Event Update',
        eventCancelled: 'Event Cancelled',
        paymentReceived: 'Payment Received',
        refundProcessed: 'Refund Processed',
        notificationSettings: 'Notification Settings',
        emailNotifications: 'Email Notifications',
        pushNotifications: 'Push Notifications',
        eventReminders: 'Event Reminders',
        reservationUpdates: 'Reservation Updates',
        paymentAlerts: 'Payment Alerts',
        marketingEmails: 'Marketing Emails',
      },

      analytics: {
        title: 'Analytics',
        overview: 'Overview',
        revenue: 'Revenue',
        events: 'Events',
        reservations: 'Reservations',
        visitors: 'Visitors',
        totalRevenue: 'Total Revenue',
        totalEvents: 'Total Events',
        totalReservations: 'Total Reservations',
        averageTicketPrice: 'Average Ticket Price',
        conversionRate: 'Conversion Rate',
        last7Days: 'Last 7 Days',
        last30Days: 'Last 30 Days',
        last90Days: 'Last 90 Days',
        thisYear: 'This Year',
        custom: 'Custom',
        revenueChart: 'Revenue Chart',
        reservationsChart: 'Reservations Chart',
        popularEvents: 'Popular Events',
        exportData: 'Export Data',
        exportCSV: 'Export CSV',
        exportPDF: 'Export PDF',
      },

      google: {
        connectionInProgress: 'Google connection in progress...',
        connectionCancelled: 'Google connection cancelled or refused',
        connectionError: 'Error during Google connection',
        authorizationCodeMissing: 'Authorization code missing',
        redirectingToLogin: 'Redirecting to login page...',
      },

      linkedAccount: {
        finalizingInProgress: 'Finalizing...',
        linkingAccount: 'Linking your {{provider}} account',
        linkingError: 'Linking Error',
        backToProfile: 'Back to Profile',
        accountLinkedSuccess: '{{provider}} Account Successfully Linked!',
        canReceivePayments: 'You can now receive payments via {{provider}}',
        automaticRedirection: 'Automatic redirection...',
        goToProfileNow: 'Go to Profile Now',
      },

      subscriptionSuccess: {
        title: 'Subscription Successfully Activated!',
        message: 'Thank you for your trust. You can now enjoy all professional features.',
        continue: 'Continue',
      },

      paymentSuccess: {
        verificationInProgress: 'Verification in progress...',
        verifyingPaymentStatus: 'Verifying your payment status',
        paymentFailed: 'Payment Failed',
        paymentError: 'An error occurred during payment',
        backToEvents: 'Back to Events',
        retry: 'Retry',
        paymentPending: 'Payment Pending',
        paymentPendingMessage: 'Your payment is being processed. You will receive a confirmation email once the payment is validated.',
        viewMyReservations: 'View My Reservations',
        reservationConfirmed: 'Reservation Confirmed!',
        emailConfirmation: 'You will receive a confirmation email with all the details',
        paymentDetails: 'Payment Details',
        totalAmount: 'Total Amount',
        status: 'Status',
        paid: 'Paid',
        reservationNumber: 'Reservation Number',
      },

      abonnement: {
        subscriptionDataUnavailable: 'Subscription data unavailable',
        cannotLoadInfo: 'Unable to load subscription information',
        
        initializingSubscription: 'Initializing subscription...',
        preparingFeatures: 'Preparing features...',
        configuringAccount: 'Configuring your account...',
        almostDone: 'Almost done...',
        redirectingToPayment: 'Redirecting to payment...',
        preparingYourSubscription: 'Preparing your subscription',
        
        paymentLinkNotFound: 'Payment link not found',
        subscriptionCreationError: 'Error creating subscription',
        cancelConfirmation: 'Are you sure you want to cancel your Pro Plus subscription?',
        subscriptionWillCancel: 'Your subscription will be cancelled at the end of the current period',
        cancellationError: 'Cancellation error',
        
        myProPlusSubscription: 'My Pro Plus Subscription',
        activeSubscription: 'Active Subscription',
        unlimitedAccess: 'Unlimited access to all professional features',
        subscriptionType: 'Subscription Type',
        renewalDate: 'Renewal Date',
        cancelSubscription: 'Cancel Subscription',
        yourCurrentBenefits: 'Your Current Benefits',
        directPayments: 'Direct Payments',
        directPaymentsDesc: 'Receive payments instantly without delay',
        reducedCommission: 'Reduced Commission',
        reducedCommissionDesc: 'Only 5% instead of 15%',
        
        proOfferBadge: 'PRO+ OFFER',
        maximizeYourEarnings: 'Maximize Your Earnings with Pro Plus',
        unlockProPlus: 'Unlock Pro Plus and receive your payments instantly with only 5% commission',
        
        freeAccount: 'Free Account',
        currentPlan: 'Your current plan',
        indirectPayments: 'Indirect Payments',
        indirectPaymentsDesc: '7-14 days delay to receive your payments',
        standardCommission: 'Standard Commission',
        standardCommissionDesc: '15% commission on each sale',
        limitedFeatures: 'Limited Features',
        restrictedAccess: 'Restricted access to advanced tools',
        
        recommended: 'RECOMMENDED',
        forSeriousProfessionals: 'For serious professionals',
        instantPayments: 'Instant Payments',
        instantPaymentsDesc: 'Receive your payments immediately after each sale',
        reducedCommissionProDesc: 'Only 5% commission instead of 15%',
        advancedTools: 'Advanced Tools',
        advancedToolsDesc: 'Detailed statistics and complete management',
        month: 'month',
        cancelAnytime: 'Cancel anytime',
        subscribeWithStripe: 'Subscribe with Stripe',
        subscribeWithPayPal: 'Subscribe with PayPal',
        
        whyChooseProPlus: 'Why Choose Pro Plus?',
        instantAccess: 'Instant Access',
        instantAccessDesc: 'Receive your payments immediately without waiting',
        moreEarnings: 'More Earnings',
        moreEarningsDesc: 'Save 10% on each transaction with our reduced commission',
        growYourBusiness: 'Grow Your Business',
        growYourBusinessDesc: 'Access professional tools to optimize your performance',
      },

      linkedAccounts: {
        loadingInfo: 'Loading information...',
        loadingLinkedAccounts: 'Loading linked accounts...',
        
        featureReserved: 'Reserved Feature',
        featureReservedDesc: 'Linking to Stripe and PayPal is reserved for users with Pro Plus subscription.',
        upgradeToProPlus: 'Upgrade to Pro Plus',
        
        accountLinked: 'Account linked',
        noAccountLinked: 'No account linked',
        
        linkStripe: 'Link Stripe',
        linkPayPal: 'Link PayPal',
        unlink: 'Unlink',
        linkingError: 'Error linking account.',
        unlinkingError: 'Error unlinking account.',
        accountUnlinkedSuccess: '{{provider}} account successfully unlinked.',
        
        cancelConfirmation: 'Are you sure you want to cancel your Pro Plus subscription?\n\nYou will lose access to the following features:\n• Stripe and PayPal account linking\n• Direct payment reception\nYour linked accounts will be automatically disconnected.',
        subscriptionCancelledSuccess: 'Subscription cancelled successfully.',
        cancellationError: 'Error cancelling subscription.',
        
        scheduledCancellation: 'Scheduled Cancellation',
        scheduledCancellationDesc: 'Your Pro Plus subscription will be cancelled at the end of the current period.',
        endDate: 'End date',
        activeProPlusSubscription: 'Active Pro Plus Subscription',
        canCancelAnytime: 'You can cancel your subscription at any time. Linked accounts will be automatically disconnected.',
        cancelSubscription: 'Cancel Subscription',
        cancel: 'Cancel',
        cancelling: 'Cancelling...',
        processing: 'Processing...',
      },

      commissions: {
        title: 'Commission Management',
        subtitle: 'Manage payments to transfer and commission rates',
        loading: 'Loading...',
        refresh: 'Refresh',
        back: 'Back',
        paymentsToTransfer: 'Payments to Transfer',
        paymentsShort: 'Payments',
        commissionRates: 'Commission Rates',
        commissionRatesShort: 'Rates',
        totalToTransfer: 'Total to transfer',
        numberOfPayments: 'Number of payments',
        commissionsCollected: 'Commissions collected',
        noPaymentsToTransfer: 'No payments to transfer',
        proPlusDirectPayments: 'All professionals with Pro Plus and linked accounts already receive payments directly.',
        noProfessionalsFound: 'No professionals found',
        noProfessionalsRegistered: 'There are currently no registered professionals.',
        date: 'Date',
        event: 'Event',
        customer: 'Customer',
        vendor: 'Vendor',
        email: 'Email',
        totalAmount: 'Total amount',
        commission: 'Commission',
        toTransfer: 'To transfer',
        actions: 'Actions',
        name: 'Name',
        currentRate: 'Current rate',
        status: 'Status',
        accounts: 'Accounts',
        copied: 'Copied!',
        clickToCopy: 'Click to copy',
        markAsPaid: 'Mark as paid',
        processing: 'Processing...',
        edit: 'Edit',
        editRate: 'Edit rate',
        save: 'Save',
        newCommissionRate: 'New commission rate',
        proPlus: 'Pro Plus',
        notApproved: 'Not approved',
        none: 'None',
        noLinkedAccount: 'No linked account',
        confirmTransfer: 'Confirm that you have transferred this payment to the vendor?',
        markedAsPaidSuccess: 'Commission marked as paid successfully',
        markingError: 'Error marking commission',
        rateUpdatedSuccess: 'Commission rate updated successfully',
        rateUpdateError: 'Error updating rate',
        loadingError: 'Error loading commissions',
        professionalsLoadingError: 'Error loading professionals',
        copyError: 'Error copying email',
      },

      professionals: {
        title: 'Our Professionals',
        subtitle: 'Discover the qualified professionals on our platform',
        loadingProfessionals: 'Loading professionals...',
        noProfessionalsFound: 'No professionals found',
        searchPlaceholder: 'Search by name or city...',
        retry: 'Retry',
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

      about: {
        title: 'About Je m\'inspire',
        subtitle: 'The platform that connects enthusiasts to events that inspire them',
        
        // Stats
        eventsCreated: 'Events created',
        activeUsers: 'Active users',
        customerSatisfaction: 'Customer satisfaction',
        supportAvailable: 'Support available',
        
        // Values
        valuesTitle: 'Our Values',
        passionTitle: 'Passion',
        passionDescription: 'We believe that each event is an opportunity to create unforgettable memories.',
        communityTitle: 'Community',
        communityDescription: 'Connecting organizers with their audience is at the heart of our mission.',
        trustTitle: 'Trust',
        trustDescription: 'Payment security and data protection are our absolute priorities.',
        innovationTitle: 'Innovation',
        innovationDescription: 'We constantly improve our platform to offer you the best experience.',
        
        // Mission
        ourMission: 'Our mission',
        missionTitle: 'Our Mission',
        missionText1: 'Je m\'inspire was born from a simple vision: to make the discovery and organization of events accessible to all. Whether you are a passionate organizer looking to share your expertise, or a participant seeking new experiences, our platform supports you every step of the way.',
        missionText2: 'We believe that events have the power to transform lives, create authentic connections and inspire change. That\'s why we strive to offer a smooth, secure and enriching experience.',
        
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
        
        // Contact
        contactTitle: 'Have a question? Contact us',
        contactDescription: 'Our team is available to answer all your questions and support you in using the platform.',
        discoverEvents: 'Discover events',
        back: 'Back',
      },

      vendorDashboard: {
        export: 'Export',
        date: 'Date',
        commission: 'Commission',
        net: 'Net',
        loadingError: 'Error loading data',
        exportError: 'Export error',
      },

      // ==========================================
      // EVENT FORM
      // ==========================================
      eventForm: {
        // Buttons
        createEvent: 'Create Event',
        editEvent: 'Edit Event',
        
        // Sections
        generalInfo: 'General Information',
        location: 'Location',
        datesCapacity: 'Dates & Capacity',
        eventSettings: 'Event Settings',
        eventImages: 'Event Images',
        
        // General Info
        eventName: 'Event Name *',
        eventNamePlaceholder: 'E.g.: Mountain Meditation Retreat',
        description: 'Description *',
        descriptionPlaceholder: 'Describe your event in detail...',
        
        // Location
        eventAddress: 'Event Address *',
        
        // Dates & Capacity
        startDate: 'Start Date *',
        endDate: 'End Date *',
        price: 'Price (CAD) *',
        totalCapacity: 'Total Capacity *',
        availablePlaces: 'Available Places *',
        
        // Settings
        requiredLevel: 'Required Level *',
        selectLevel: 'Select level',
        category: 'Category *',
        selectCategory: 'Select a category',
        
        // Levels
        levelBeginner: 'Beginner',
        levelIntermediate: 'Intermediate',
        levelAdvanced: 'Advanced',
        levelExpert: 'Expert',
        
        // Categories
        categoryMeditation: 'Meditation',
        categoryYoga: 'Yoga',
        categoryMentalHealth: 'Mental Health',
        categoryRetreat: 'Retreat',
        
        // Images
        thumbnailLabel: 'Main Image (Thumbnail) *',
        clickToAddImage: 'Click to add an image',
        imageFormat: 'PNG, JPG up to 10MB',
        bannerLabel: 'Event Banner *',
        clickToAddBanner: 'Click to add a banner',
        bannerFormat: '16:9 format recommended',
        galleryLabel: 'Image Gallery (max 5)',
        galleryLimitReached: '5 images limit reached',
        addImagesToGallery: 'Add images to gallery',
        imagesCount: '{{count}}/5 images',
        deleteImage: 'Delete',
        
        // Status messages
        loadingExistingImages: 'Loading existing images...',
        existingImagesLoaded: 'Existing images loaded!',
        loadingError: 'Error loading images',
        compressing: 'Compressing...',
        compressionError: 'Error during compression',
        compressingProgress: 'Compressing {{current}}/{{total}}...',
      },

      // ==========================================
      // PROFESSIONAL EVENT CARD
      // ==========================================
      professionalEventCard: {
        // Image
        noImage: 'No image',
        
        // Event info
        level: 'Level',
        dateRange: 'From {{start}} to {{end}}',
        free: 'Free',
        
        // Status
        eventCancelled: 'Event cancelled',
        
        // Buttons
        viewDetails: 'View details',
        edit: 'Edit',
        editShort: 'Edit',
        manage: 'Manage',
        
        // Manage popup
        manageEvent: 'Manage Event',
        downloadList: 'Download list',
        participantsPdf: 'Participants PDF',
        printList: 'Print list',
        directPrint: 'Direct print',
        cancelEvent: 'Cancel event',
        hideAndRefund: 'Hide and refund participants',
        
        // Messages
        downloadSuccess: 'Participants list downloaded successfully!',
        downloadError: 'Error downloading the list',
        printError: 'Error printing the list',
        
        // Cancel confirmation
        cancelConfirmation: '⚠️ WARNING: This action will:\n\n1. Hide the event from new users\n2. Create refund requests for all participants\n3. You will need to manually refund each participant\n\nAre you sure you want to cancel this event?',
        cancelSuccess: '✅ Event cancelled successfully!\n\n{{count}} refund request(s) created.\nYou will receive an email with the list of participants to refund.',
        cancelError: 'Error cancelling the event',
        
        // Loading
        cancelling: 'Cancelling...',
        processing: 'Processing...',
      },

      // ==========================================
      // EVENT DETAIL
      // ==========================================
      eventDetail: {
        // Hero section
        backToEvents: 'Back to events',
        addressToCome: 'Address to come',
        
        // Organizer
        organizer: 'Organizer',
        photoOf: 'Photo of {{name}}',
        organizedBy: 'Organized by',
        anonymousOrganizer: 'Anonymous organizer',
        
        // Reservation
        reserveYourSpot: 'Reserve your spot',
        reserveNow: 'Reserve now',
        total: 'Total',
        paymentMethod: 'Payment method',
        proceedToPayment: 'Proceed to payment',
        mustBeLoggedIn: 'You must be logged in to reserve an event.',
        mustBeLoggedInToReserve: 'You must be logged in to reserve this event.',
        
        // Event info
        aboutEvent: 'About the event',
        noDescriptionAvailable: 'No description available.',
        category: 'Category',
        noImagesAvailable: 'No images available',
        
        // Location
        location: 'Location',
        eventLocation: 'Event location',
        addressNotAvailable: 'Address not available',
        
        // Loading & Errors
        loadingEvent: 'Loading event...',
        eventNotFound: 'Event not found',
        backToList: 'Back to list',
        paymentError: 'An error occurred during payment. Please try again.',
      },

      // ==========================================
      // PUBLIC EVENTS
      // ==========================================
      publicEvents: {
        // Search & Filters
        searchPlaceholder: 'Search for an event...',
        filters: 'Filters',
        category: 'Category',
        allCategories: 'All categories',
        city: 'City',
        allCities: 'All cities',
        sortByPrice: 'Sort by price',
        defaultSort: 'Default',
        priceAscending: 'Price ascending',
        priceDescending: 'Price descending',
        date: 'Date',
        dateAll: 'All',
        dateToday: 'Today',
        dateWeek: 'This week',
        dateMonth: 'This month',
        maxPrice: 'Max price: {{price}} $',
        resetFilters: 'Reset filters',
        
        // Results
        loading: 'Loading...',
        eventsFound: '{{count}} event found',
        eventsFound_other: '{{count}} events found',
        loadingEvents: 'Loading events...',
        noEventsFound: 'No events found',
        tryModifyingFilters: 'Try modifying your search filters',
        
        // Event card
        availablePlaces: '{{count}} place',
        availablePlaces_other: '{{count}} places',
        full: 'Full',
        free: 'Free',
        level: 'Level',
        
        // Map
        dragToResize: '← Drag to resize →',
        eventsMap: 'Events map',
        eventsOnMap: '{{count}} event on the map',
        eventsOnMap_other: '{{count}} events on the map',
        noEventsToDisplay: 'No events to display',
        eventsWillAppearHere: 'Events will appear here',
      },

      // ==========================================
      // PRO PROFILE
      // ==========================================
      proProfile: {
        // Loading & Errors
        loadingProfile: 'Loading profile...',
        failedToLoadProfile: 'Unable to load profile',
        profileNotFound: 'Profile not found',
        backToHome: 'Back to home',
        
        // Profile info
        professional: 'Professional',
        memberSince: 'Member since',
        events: 'Events',
        profileOf: 'Profile of {{name}}',
        
        // Sections
        about: 'About',
        organizedEvents: 'Organized events ({{count}})',
        seeAllEvents: 'See all events →',
        noEventsYet: 'No organized events yet',
        
        // Sidebar
        contact: 'Contact',
        information: 'Information',
        memberSinceLabel: 'Member since',
        status: 'Status',
        user: 'User',
        followYou: 'follow you',
        followYou_singular: 'follows you',
      },

      // ==========================================
      // PROFESSIONALS PAGE
      // ==========================================
      professionalsPage: {
        // Loading & Error
        loadingProfessionals: 'Loading professionals...',
        loadError: 'Unable to load professionals',
        retry: 'Retry',
        
        // Header
        title: 'Our Professionals',
        subtitle: 'Discover the qualified professionals on our platform',
        
        // Search
        searchPlaceholder: 'Search by name or city...',
        
        // Stats
        professionalsAvailable: 'professional available',
        professionalsAvailable_other: 'professionals available',
        resultsOutOf: 'result out of {{total}}',
        resultsOutOf_other: 'results out of {{total}}',
        
        // Empty state
        noProfessionalsFound: 'No professionals found',
        tryOtherKeywords: 'Try with other keywords',
        noProfessionalsAvailable: 'No professionals are available at the moment',
      },

      // ==========================================
      // LANGUAGE SWITCHER
      // ==========================================
      language: {
        switchToEnglish: 'Switch to English',
        switchToFrench: 'Passer en français',
        changeLanguage: 'Change Language',
        currentFrench: 'French',
        currentEnglish: 'English',
      },

      autocomplete: {
        searchAddress: 'Search an address...',
        clear: 'Clear',
      },

      carousel: {
        errorMessage: 'useCarousel must be used within a <Carousel />',
      },

      formField: {
        forgotPassword: 'Forgot your password?',
      },

      // ==========================================
      // FORGOT PASSWORD PAGE
      // ==========================================
      forgotPassword: {
        resetLinkSent: 'Password reset link sent to your email',
        resetLinkError: 'An error occurred. Please try again.',
      },

      errorFallback: {
        title: 'An error occurred',
        description: 'The technical team has been notified.',
        reloadPage: 'Reload Page',
      },

      errors: {
        somethingWentWrong: 'Something Went Wrong',
        technicalTeamNotified: 'The technical team has been notified.',
        reloadPage: 'Reload Page',
        tryAgain: 'Try Again',
        errorOccurred: 'An error occurred',
        invalidResetLink: 'Invalid reset link. Please request a new password reset.',
      },

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

      socialMedia: {
        facebook: 'Facebook',
        instagram: 'Instagram',
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
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