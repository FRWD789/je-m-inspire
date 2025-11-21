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
        profileSettings: 'Paramètres du profil'
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
        noPlaces: 'Plus de places disponibles'
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
        cancelConfirm: 'Êtes-vous sûr de vouloir annuler cette réservation ?'
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
        planPrice: '14,99 $ CAD / mois',
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
        
        // Messages
        subscribeSuccess: 'Abonnement activé avec succès !',
        subscribeError: "Erreur lors de l'activation",
        unsubscribeSuccess: 'Abonnement annulé',
        unsubscribeError: "Erreur lors de l'annulation",
        unsubscribeConfirm: 'Êtes-vous sûr de vouloir annuler votre abonnement ?'
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
      // REMBOURSEMENTS (UTILISATEUR)
      // ==========================================
      refunds: {
        title: 'Mes demandes de remboursement',
        newRequest: 'Nouvelle demande',
        myRequests: 'Mes demandes',
        selectReservation: 'Sélectionner une réservation',
        reason: 'Raison du remboursement',
        reasonPlaceholder: 'Expliquez pourquoi vous demandez un remboursement',
        submit: 'Soumettre',
        submitting: 'Envoi en cours...',
        
        // Status
        pending: 'En attente',
        approved: 'Approuvé',
        rejected: 'Refusé',
        
        // Messages
        submitSuccess: 'Demande de remboursement envoyée',
        submitError: "Erreur lors de l'envoi",
        noReservations: 'Aucune réservation éligible au remboursement'
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
        profileOf: 'Profil de',
        linkCopied: 'Lien du profil copié !',
        contactFeatureComingSoon: 'Fonction de contact à implémenter',
        
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
        
        // Confirmations
        confirmAction: 'Êtes-vous sûr ?',
        cannotUndo: 'Cette action ne peut pas être annulée',
        yes: 'Oui',
        no: 'Non',
        
        // Erreurs
        somethingWentWrong: "Une erreur s'est produite",
        tryAgain: 'Réessayer',
        contactSupport: 'Contactez le support',
        
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
        results: 'résultats'
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
        invalidFileType: 'Type de fichier invalide'
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
        followError: 'Erreur lors du suivi'
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
        profileSettings: 'Profile Settings'
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
        noPlaces: 'No places available'
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
        cancelConfirm: 'Are you sure you want to cancel this reservation?'
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
        planPrice: '$14.99 CAD / month',
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
        
        // Messages
        subscribeSuccess: 'Subscription activated successfully!',
        subscribeError: 'Activation error',
        unsubscribeSuccess: 'Subscription cancelled',
        unsubscribeError: 'Cancellation error',
        unsubscribeConfirm: 'Are you sure you want to cancel your subscription?'
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
      // REFUNDS (USER)
      // ==========================================
      refunds: {
        title: 'My Refund Requests',
        newRequest: 'New Request',
        myRequests: 'My Requests',
        selectReservation: 'Select a Reservation',
        reason: 'Refund Reason',
        reasonPlaceholder: 'Explain why you are requesting a refund',
        submit: 'Submit',
        submitting: 'Submitting...',
        
        // Status
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        
        // Messages
        submitSuccess: 'Refund request submitted',
        submitError: 'Submission error',
        noReservations: 'No reservations eligible for refund'
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
        profileOf: 'Profile of',
        linkCopied: 'Profile link copied!',
        contactFeatureComingSoon: 'Contact feature to be implemented',

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
        
        // Confirmations
        confirmAction: 'Are you sure?',
        cannotUndo: 'This action cannot be undone',
        yes: 'Yes',
        no: 'No',
        
        // Errors
        somethingWentWrong: 'Something went wrong',
        tryAgain: 'Try Again',
        contactSupport: 'Contact Support',
        
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
        results: 'results'
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
        invalidFileType: 'Invalid file type'
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
        followError: 'Error while following'
      },
    }
  }
};

// Récupérer la langue sauvegardée ou utiliser 'fr' par défaut
const savedLanguage = localStorage.getItem('language') || 'fr';

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
  localStorage.setItem('language', lng);
});

export default i18n;
