<?php

use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\RemboursementController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AbonnementController;
use App\Http\Controllers\AdminApprovalController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\VendorEarningsController;

use App\Models\User;
use App\Models\Remboursement;
use App\Models\Operation;
use App\Models\Paiement;
use App\Notifications\RemboursementReceivedNotification;
use App\Notifications\ProfessionalApplicationReceivedNotification;
use App\Notifications\ProfessionalApprovedNotification;
use App\Notifications\ProfessionalRejectedNotification;
use App\Notifications\AccountReactivationRequestReceivedNotification;
use App\Notifications\AccountReactivatedNotification;
use App\Notifications\ReservationConfirmedNotification;
use Illuminate\Support\Facades\Mail;

//route auth maher
Route::get('/test-mail', function() {
    try {
        Mail::raw('Hello from Laravel', function($message) {
            $message->to('test@example.com')
                    ->subject('Test Mail');
        });

        return response()->json(['message' => 'Test email sent successfully!']);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to send test email',
            'error' => $e->getMessage(),
        ], 500);
    }
});

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return response()->json([
        'message' => 'Email vérifié avec succès!'
    ]);
})->middleware(['auth:api', 'signed'])->name('verification.verify');

Route::post('/email/resend', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return response()->json([
        'message' => 'Lien de vérification envoyé!'
    ]);
})->middleware(['auth:api', 'throttle:6,1'])->name('verification.resend');

Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink($request->only('email'));

    return $status === Password::RESET_LINK_SENT
        ? response()->json(['message' => ($status)], 200)
        : response()->json(['message' => ($status)], 400);
});

Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password),
            ])->save();
        }
    );

    return $status === Password::PASSWORD_RESET
        ? response()->json(['message' => ($status)], 200)
        : response()->json(['message' => ($status)], 400);
})->name('password.reset');

// ==========================================
// ROUTES PUBLIQUES
// ==========================================
Route::post('/register/user', [AuthController::class, 'registerUser']);
Route::post('/register/professional', [AuthController::class, 'registerProfessional']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/refresh', [AuthController::class, 'refresh']);

// Événements publics
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Rôles
Route::get('/roles', [RoleController::class, 'index']);

// Statut de paiement
Route::get('/payment/status', [PaiementController::class, 'getPaymentStatus']);

// Demande de réactivation de compte
Route::post('/account/request-reactivation', [ProfileController::class, 'requestReactivation']);

// ==========================================
// WEBHOOKS
// ==========================================
Route::post('/stripe/webhook', [PaiementController::class, 'stripeWebhook']);
Route::post('/paypal/webhook', [PaiementController::class, 'paypalWebhook']);
Route::post('/abonnementPaypal/webhook', [AbonnementController::class, 'abonnementPaypalWebhook']);

// ==========================================
// ROUTES PROTÉGÉES
// ==========================================
Route::middleware(['auth.jwt'])->group(function () {

    // AUTHENTIFICATION & PROFIL
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);
    Route::post('/profile/update-img', [AuthController::class, 'updateProfileImg']);
    Route::put('/profile/update-password', [AuthController::class, 'updatePassword']);

    // ÉVÉNEMENTS
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::get('/my-events', [EventController::class, 'myEvents']);

    // RÉSERVATIONS
    Route::post('/events/{id}/reserve', [EventController::class, 'reserve']);
    Route::delete('/events/{id}/reservation', [EventController::class, 'cancelReservation']);
    Route::get('/mes-reservations', [OperationController::class, 'mesReservations']);
    Route::delete('/reservations/{id}', [OperationController::class, 'destroy']);

    // PAIEMENTS
    Route::post('/stripe/checkout', [PaiementController::class, 'stripeCheckout']);
    Route::post('/paypal/checkout', [PaiementController::class, 'paypalCheckout']);

    // REMBOURSEMENTS
    Route::post('/remboursements', [RemboursementController::class, 'store']);
    Route::get('/mes-remboursements', [RemboursementController::class, 'mesDemandes']);
    Route::get('/remboursements', [RemboursementController::class, 'index']);
    Route::put('/remboursements/{id}/traiter', [RemboursementController::class, 'traiter']);

    // GESTION UTILISATEURS
    Route::get('/professionnels', [AuthController::class, 'getProfessionnels']);
    Route::get('/utilisateurs', [AuthController::class, 'getUtilisateurs']);
    Route::put('/users/{id}/toggle-status', [AuthController::class, 'toggleUserStatus']);

    // COMPTES LIÉS
    Route::get('/profile/linked-accounts', [ProfileController::class, 'getLinkedAccounts']);
    Route::get('/profile/stripe/link', [ProfileController::class, 'linkStripeAccount']);
    Route::get('/profile/stripe/success', [ProfileController::class, 'linkStripeSuccess']);
    Route::get('/profile/stripe/callback', [ProfileController::class, 'linkStripeSuccess']);
    Route::delete('/profile/stripe/unlink', [ProfileController::class, 'unlinkStripeAccount']);
    Route::get('/profile/paypal/link', [ProfileController::class, 'linkPaypalAccount']);
    Route::get('/profile/paypal/success', [ProfileController::class, 'linkPaypalSuccess']);
    Route::get('/profile/paypal/callback', [ProfileController::class, 'linkPaypalSuccess']);
    Route::delete('/profile/paypal/unlink', [ProfileController::class, 'unlinkPaypalAccount']);

    // SUPPRESSION DE COMPTE
    Route::delete('/profile/deleteAccount', [ProfileController::class, 'deleteAccount']);

    // ABONNEMENTS
    Route::prefix('abonnement')->group(function () {
        Route::post('/stripe', [AbonnementController::class, 'abonnementStripe']);
        Route::post('/paypal', [AbonnementController::class, 'abonnementPaypal']);
        Route::post('/cancel', [AbonnementController::class, 'cancelAbonnement']);
        Route::get('/info', [AbonnementController::class, 'getAbonnementInfo']);
        Route::get('/status', [AbonnementController::class, 'checkSubscriptionStatus']);
    });

    // ✅ ADMIN - TOUTES LES ROUTES ADMIN REGROUPÉES ICI
    Route::prefix('admin')->group(function () {
        // Commissions
        Route::get('/commissions', [CommissionController::class, 'index']);
        Route::get('/commissions/statistics', [CommissionController::class, 'statistics']);
        Route::put('/commissions/{id}', [CommissionController::class, 'update']);
        Route::post('/commissions/bulk-update', [CommissionController::class, 'bulkUpdate']);
            //IMPORTANT:api v1
        // // ✅ PROFESSIONNELS - Gestion des approbations/rejets
        // Route::get('/pending-professionals', [AuthController::class, 'getPendingProfessionals']);
        // Route::get('/approved-professionals', [AuthController::class, 'getApprovedProfessionals']);
        // Route::get('/rejected-professionals', [AuthController::class, 'getRejectedProfessionals']);

        // // ✅ IMPORTANT: Les deux routes en POST car on envoie des données
        // Route::post('/approve-professional/{id}', [AuthController::class, 'approveProfessional']);
        // Route::post('/reject-professional/{id}', [AuthController::class, 'rejectProfessional']);
         //IMPORTANT:api v1
        // Approbations - Nouveau système (AdminApprovalController)
        Route::get('/approvals', [AdminApprovalController::class, 'index']);
        Route::post('/approvals/{id}/approve', [AdminApprovalController::class, 'approve']);
        Route::post('/approvals/{id}/reject', [AdminApprovalController::class, 'reject']);
        // Route::post('/approvals/{id}/revoke', [AdminApprovalController::class, 'revoke']);
    });

    // VENDEUR - REVENUS
    Route::prefix('vendor')->group(function () {
        Route::get('/earnings', [VendorEarningsController::class, 'index']);
        Route::get('/earnings/statistics', [VendorEarningsController::class, 'statistics']);
        Route::get('/earnings/export', [VendorEarningsController::class, 'export']);
    });


});

// ==========================================
// ROUTES DE TEST D'EMAILS
// ==========================================
Route::prefix('test-emails')->group(function () {

    //TEST EMAIL DEMANDE DE REMBOURSEMENT
    Route::get('/remboursement', function () {
        $user = User::where('email', 'user@example.com')->first();

        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Chercher un remboursement existant
        $remboursement = Remboursement::with(['operation.event', 'user'])
            ->where('user_id', $user->id)
            ->first();

        // ✅ SI AUCUN REMBOURSEMENT, EN CRÉER UN
        if (!$remboursement) {
            // Chercher ou créer une opération
            $operation = Operation::where('user_id', $user->id)
                ->where('type_operation_id', 2)
                ->first();

            if (!$operation) {
                $event = \App\Models\Event::first();
                if (!$event) {
                    return response()->json(['error' => 'Aucun événement trouvé'], 404);
                }

                $paiement = Paiement::create([
                    'total' => $event->base_price,
                    'status' => 'paid',
                    'type_paiement_id' => 1,
                    'taux_commission' => 10,
                    'session_id' => 'test_' . uniqid(),
                ]);

                $operation = Operation::create([
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'type_operation_id' => 2,
                    'paiement_id' => $paiement->paiement_id,
                ]);
            }

            // Créer le remboursement
            $remboursement = Remboursement::create([
                'user_id' => $user->id,
                'operation_id' => $operation->id,
                'montant' => 50.00,
                'motif' => 'Test de notification email - demande créée automatiquement',
                'statut' => 'en_attente',
            ]);

            $remboursement->load(['operation.event', 'user']);
            $created = true;
        } else {
            $created = false;
        }

        $remboursement->user->notify(new RemboursementReceivedNotification($remboursement));

        return response()->json([
            '✅ Email envoyé !' => 'Vérifie Mailhog sur http://localhost:8025',
            'destinataire' => $user->email,
            'type' => 'Demande de remboursement',
            'remboursement_id' => $remboursement->id,
            'remboursement_cree' => $created ? 'Oui' : 'Non (existant)',
        ]);
    });

    //TEST EMAIL CANDIDATURE PROFESSIONNELLE
    Route::get('/professional-application', function () {
        // Chercher un professionnel existant
        $user = User::where('email', 'pro@example.com')->first();

        // ✅ SI AUCUN PRO, EN CRÉER UN
        if (!$user) {
            $user = User::create([
                'name' => 'Pro',
                'last_name' => 'Test',
                'email' => 'pro@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'date_of_birth' => now()->subYears(30),
                'city' => 'Paris',
                'motivation_letter' => 'Lettre de motivation de test pour un professionnel',
                'is_approved' => false,
                'email_verified_at' => null,
            ]);

            // Attacher le rôle professionnel
            $proRole = \App\Models\Role::where('role', 'professionnel')->first();
            if ($proRole) {
                $user->roles()->attach($proRole->id);
            }

            $created = true;
        } else {
            $created = false;
        }

        $user->notify(new ProfessionalApplicationReceivedNotification());

        return response()->json([
            '✅ Email envoyé !' => 'Vérifie Mailhog sur http://localhost:8025',
            'destinataire' => $user->email,
            'type' => 'Demande inscription professionnel',
            'professionnel_cree' => $created ? 'Oui' : 'Non (existant)',
        ]);
    });

    //TEST EMAIL PROFESSIONNEL APPROUVÉ
    Route::get('/professional-approved', function () {
        $user = User::where('email', 'pro@example.com')->first();

        // ✅ SI AUCUN PRO, EN CRÉER UN
        if (!$user) {
            $user = User::create([
                'name' => 'Pro',
                'last_name' => 'Test',
                'email' => 'pro@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'date_of_birth' => now()->subYears(30),
                'city' => 'Paris',
                'motivation_letter' => 'Lettre de motivation de test',
                'is_approved' => true,
                'approved_at' => now(),
                'email_verified_at' => now(),
            ]);

            $proRole = \App\Models\Role::where('role', 'professionnel')->first();
            if ($proRole) {
                $user->roles()->attach($proRole->id);
            }

            $created = true;
        } else {
            $created = false;
        }

        $user->notify(new ProfessionalApprovedNotification());

        return response()->json([
            '✅ Email envoyé !' => 'Vérifie Mailhog sur http://localhost:8025',
            'destinataire' => $user->email,
            'type' => 'Approbation professionnel',
            'professionnel_cree' => $created ? 'Oui' : 'Non (existant)',
        ]);
    });

    //TEST EMAIL PROFESSIONNEL REJETÉ
    Route::get('/professional-rejected', function () {
        // Utiliser un email différent pour éviter les conflits
        $user = User::where('email', 'pro-rejected@example.com')->first();

        // ✅ SI AUCUN PRO, EN CRÉER UN
        if (!$user) {
            $user = User::create([
                'name' => 'Pro',
                'last_name' => 'Rejected',
                'email' => 'pro-rejected@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'date_of_birth' => now()->subYears(30),
                'city' => 'Lyon',
                'motivation_letter' => 'Lettre de motivation insuffisante pour test de rejet',
                'is_approved' => false,
                'email_verified_at' => null,
            ]);

            $proRole = \App\Models\Role::where('role', 'professionnel')->first();
            if ($proRole) {
                $user->roles()->attach($proRole->id);
            }

            $created = true;
        } else {
            $created = false;
        }

        $reason = 'Votre lettre de motivation ne correspond pas aux critères requis. Veuillez fournir plus de détails sur votre expérience professionnelle dans le domaine du bien-être.';

        $user->notify(new ProfessionalRejectedNotification($reason));

        return response()->json([
            '✅ Email envoyé !' => 'Vérifie Mailhog sur http://localhost:8025',
            'destinataire' => $user->email,
            'type' => 'Rejet professionnel',
            'raison' => $reason,
            'professionnel_cree' => $created ? 'Oui' : 'Non (existant)',
        ]);
    });

    //TEST EMAIL DEMANDE DE RÉACTIVATION DE COMPTE
    Route::get('/reactivation-request', function () {
        $user = User::where('email', 'user@example.com')->first();

        // ✅ SI AUCUN USER, EN CRÉER UN
        if (!$user) {
            $user = User::create([
                'name' => 'User',
                'last_name' => 'Test',
                'email' => 'user@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'date_of_birth' => now()->subYears(25),
                'is_active' => false, // Compte désactivé
                'last_login_at' => now()->subDays(90), // Inactif depuis 90 jours
                'email_verified_at' => now(),
            ]);

            $userRole = \App\Models\Role::where('role', 'utilisateur')->first();
            if ($userRole) {
                $user->roles()->attach($userRole->id);
            }

            $created = true;
        } else {
            $created = false;
        }

        $daysInactive = $user->last_login_at
            ? now()->diffInDays($user->last_login_at)
            : 90;

        $user->notify(new AccountReactivationRequestReceivedNotification($daysInactive));

        return response()->json([
            '✅ Email envoyé !' => 'Vérifie Mailhog sur http://localhost:8025',
            'destinataire' => $user->email,
            'type' => 'Demande de réactivation',
            'jours_inactivite' => $daysInactive,
            'utilisateur_cree' => $created ? 'Oui' : 'Non (existant)',
        ]);
    });

    //TEST EMAIL COMPTE RÉACTIVÉ
    Route::get('/account-reactivated', function () {
        $user = User::where('email', 'user@example.com')->first();

        // ✅ SI AUCUN USER, EN CRÉER UN
        if (!$user) {
            $user = User::create([
                'name' => 'User',
                'last_name' => 'Test',
                'email' => 'user@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'date_of_birth' => now()->subYears(25),
                'is_active' => true, // Compte réactivé
                'email_verified_at' => now(),
            ]);

            $userRole = \App\Models\Role::where('role', 'utilisateur')->first();
            if ($userRole) {
                $user->roles()->attach($userRole->id);
            }

            $created = true;
        } else {
            $created = false;
        }

        $user->notify(new AccountReactivatedNotification());

        return response()->json([
            '✅ Email envoyé !' => 'Vérifie Mailhog sur http://localhost:8025',
            'destinataire' => $user->email,
            'type' => 'Compte réactivé',
            'utilisateur_cree' => $created ? 'Oui' : 'Non (existant)',
        ]);
    });

    //TEST EMAIL RÉSERVATION CONFIRMÉE
    Route::get('/reservation', function () {
        $user = User::where('email', 'user@example.com')->first();

        // ✅ SI AUCUN USER, EN CRÉER UN
        if (!$user) {
            $user = User::create([
                'name' => 'User',
                'last_name' => 'Test',
                'email' => 'user@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'date_of_birth' => now()->subYears(25),
                'email_verified_at' => now(),
            ]);

            $userRole = \App\Models\Role::where('role', 'utilisateur')->first();
            if ($userRole) {
                $user->roles()->attach($userRole->id);
            }
        }

        $operation = Operation::with(['event.localisation', 'paiement'])
            ->where('type_operation_id', 2)
            ->where('user_id', $user->id)
            ->first();

        // ✅ SI AUCUNE OPÉRATION, EN CRÉER UNE
        if (!$operation) {
            $event = \App\Models\Event::with('localisation')->first();

            if (!$event) {
                return response()->json(['error' => 'Aucun événement trouvé. Exécute: php artisan db:seed'], 404);
            }

            $paiement = Paiement::create([
                'total' => $event->base_price,
                'status' => 'paid',
                'type_paiement_id' => 1,
                'taux_commission' => 10,
                'session_id' => 'test_' . uniqid(),
            ]);

            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2,
                'paiement_id' => $paiement->paiement_id,
            ]);

            $operation->load(['event.localisation', 'paiement']);
            $created = true;
        } else {
            $created = false;
        }

        $user->notify(new ReservationConfirmedNotification($operation));

        return response()->json([
            '✅ Email envoyé !' => 'Vérifie Mailhog sur http://localhost:8025',
            'destinataire' => $user->email,
            'type' => 'Confirmation de réservation',
            'operation_id' => $operation->id,
            'operation_creee' => $created ? 'Oui' : 'Non (existante)',
        ]);
    });

});


/*
//TEST EMAIL RÉSERVATION CONFIRMÉE
Route::get('/test-reservation-email', function () {
    try {
        // 1. Récupérer l'utilisateur
        $user = \App\Models\User::where('email', 'user@example.com')->first();

        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // 2. Chercher une opération existante
        $operation = \App\Models\Operation::with(['event.localisation', 'paiement'])
            ->where('type_operation_id', 2)
            ->where('user_id', $user->id)
            ->first();

        // 3. ✅ SI AUCUNE OPÉRATION, EN CRÉER UNE
        if (!$operation) {
            $event = \App\Models\Event::with('localisation')->first();

            if (!$event) {
                return response()->json(['error' => 'Aucun événement trouvé'], 404);
            }

            // Créer le paiement
            $paiement = \App\Models\Paiement::create([
                'total' => $event->base_price,
                'status' => 'paid',
                'type_paiement_id' => 1,
                'taux_commission' => 10,
                'session_id' => 'test_' . uniqid(),
            ]);

            // Créer l'opération
            $operation = \App\Models\Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2,
                'paiement_id' => $paiement->paiement_id,
            ]);

            $operation->load(['event.localisation', 'paiement']);
            $created = true;
        } else {
            $created = false;
        }

        // 4. Envoyer l'email
        $user->notify(new \App\Notifications\ReservationConfirmedNotification($operation));

        return response()->json([
            '✅ Email envoyé !' => 'Vérifie Mailhog sur http://localhost:8025',
            'destinataire' => $user->email,
            'operation_id' => $operation->id,
            'operation_creee' => $created ? 'Oui' : 'Non (existante)',
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

//TEST EMAIL CANDIDATURE PROFESSIONNELLE
Route::get('/test-professional-application-email', function () {
    // Créer ou récupérer un professionnel en attente
    $user = \App\Models\User::where('email', 'pro@example.com')->first();

    if (!$user) {
        return response()->json(['error' => 'Utilisateur professionnel non trouvé'], 404);
    }

    // Envoyer l'email
    $user->notify(new \App\Notifications\ProfessionalApplicationReceivedNotification());

    return response()->json([
        'message' => 'Email envoyé ! Vérifie Mailhog sur http://localhost:8025',
        'user_email' => $user->email,
    ]);
});

//TEST EMAIL DEMANDE DE REMBOURSEMENT
Route::get('/test-remboursement-email', function () {
    $user = \App\Models\User::where('email', 'user@example.com')->first();

    if (!$user) {
        return response()->json(['error' => 'Utilisateur non trouvé'], 404);
    }

    $remboursement = \App\Models\Remboursement::with(['operation.event', 'user'])
        ->where('user_id', $user->id)
        ->first();

    if (!$remboursement) {
        $operation = \App\Models\Operation::where('user_id', $user->id)
            ->where('type_operation_id', 2)
            ->first();

        if (!$operation) {
            return response()->json(['error' => 'Aucune réservation trouvée'], 404);
        }

        $remboursement = \App\Models\Remboursement::create([
            'user_id' => $user->id,
            'operation_id' => $operation->id,
            'montant' => 50.00,
            'motif' => 'Test de notification email',
            'statut' => 'en_attente',
        ]);

        $remboursement->load(['operation.event', 'user']);
    }

    // ✅ Utiliser la relation user
    $remboursement->user->notify(new \App\Notifications\RemboursementReceivedNotification($remboursement));

    return response()->json([
        'message' => 'Email envoyé ! Vérifie Mailhog sur http://localhost:8025',
        'remboursement_id' => $remboursement->id,
    ]);
});

//TEST EMAIL PROFESSIONNEL APPROUVÉ
Route::get('/test-professional-approved-email', function () {
    $user = \App\Models\User::where('email', 'pro@example.com')->first();

    if (!$user) {
        return response()->json(['error' => 'Professionnel non trouvé'], 404);
    }

    $user->notify(new \App\Notifications\ProfessionalApprovedNotification());

    return response()->json([
        'message' => 'Email d\'approbation envoyé ! Vérifie Mailhog sur http://localhost:8025',
        'user_email' => $user->email,
    ]);
});

//TEST EMAIL PROFESSIONNEL REJETÉ
Route::get('/test-professional-rejected-email', function () {
    $user = \App\Models\User::where('email', 'pro@example.com')->first();

    if (!$user) {
        return response()->json(['error' => 'Professionnel non trouvé'], 404);
    }

    $reason = 'Votre lettre de motivation ne correspond pas aux critères requis. Veuillez fournir plus de détails sur votre expérience professionnelle.';

    $user->notify(new \App\Notifications\ProfessionalRejectedNotification($reason));

    return response()->json([
        'message' => 'Email de rejet envoyé ! Vérifie Mailhog sur http://localhost:8025',
        'user_email' => $user->email,
    ]);
});
*/
// REDIRECTIONS
Route::get('/abonnement/success', fn() => redirect(env('FRONTEND_URL') . '/abonnement/success'));
Route::get('/abonnement/cancel', fn() => redirect(env('FRONTEND_URL') . '/abonnement/cancel'));
Route::get('/abonnement/paypal/success', fn() => redirect(env('FRONTEND_URL') . '/abonnement/success?provider=paypal'));
