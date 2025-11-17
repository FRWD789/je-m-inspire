<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\CustomVerifyEmail;

class User extends Authenticatable implements JWTSubject, MustVerifyEmail// AJOUT IMPORTANT
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'last_name',
        'email',
        'date_of_birth',
        'city',
        'profile_picture',
        'password',
        'stripeAccount_id',
        'paypalAccount_id',
        'paypalEmail',
        'commission_rate',
        'motivation_letter',
        'is_approved',
        'approved_at',
        'rejection_reason',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

   protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'approved_at' => 'datetime', // ✅ AJOUT
            'is_approved' => 'boolean', // ✅ AJOUT
            'last_login_at' => 'datetime', // ✅ AJOUT
        ];
    }

    // ========================================
    // MÉTHODES JWT OBLIGATOIRES - AJOUT
    // ========================================

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    // ========================================
    // RELATIONS EXISTANTES
    // ========================================

    /**
     * Relation avec les rôles (many-to-many)
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
    }

    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     */
    public function hasRole($role)
    {
        return $this->roles()->where('role', $role)->exists();
    }

    /**
     * Vérifier si l'utilisateur a l'un des rôles donnés
     */
    public function hasAnyRole($roles)
    {
        if (is_string($roles)) {
            return $this->hasRole($roles);
        }

        return $this->roles()->whereIn('role', $roles)->exists();
    }

    /**
     * Relation avec les opérations
     */
    public function operations()
    {
        return $this->hasMany(Operation::class, 'user_id');
    }

    /**
     * Relation avec les abonnements via operations
     */
    public function abonnements()
    {
        return $this->belongsToMany(
            Abonnement::class,
            'operations',
            'user_id',
            'abonnement_id'
        )->wherePivot('type_operation_id', 3)
        ->withTimestamps();
    }

    /**
     * Obtenir l'abonnement actif de l'utilisateur
     */
    public function abonnementActif()
    {
        return $this->abonnements()
            ->where(function($query) {
                $query->whereNull('date_fin')
                      ->orWhere('date_fin', '>', now());
            })
            ->where('date_debut', '<=', now())
            ->latest('date_debut')
            ->limit(1);
    }

    /**
     * Vérifier si l'utilisateur a un abonnement Pro Plus actif
     *
     * @return bool
     */
    public function hasProPlus()
    {
        $abonnement = $this->abonnementActif()->first();

        if (!$abonnement) {
            return false;
        }

        // Vérifier si c'est un abonnement Pro Plus
        return $abonnement->nom === 'Pro Plus' ||
               $abonnement->description === 'Pro Plus';
    }

    /**
     * Obtenir le type d'abonnement de l'utilisateur
     *
     * @return string 'pro-plus' | 'pro' | null
     */
    public function getAbonnementType()
    {
        if ($this->hasProPlus()) {
            return 'pro-plus';
        }

        $abonnement = $this->abonnementActif()->first();

        if ($abonnement) {
            return 'pro';
        }

        return null;
    }

    /**
     * Vérifier si l'abonnement est actif (Pro ou Pro Plus)
     *
     * @return bool
     */
    public function hasActiveSubscription()
    {
        return $this->abonnementActif()->exists();
    }

    /**
     * Obtenir la date d'expiration de l'abonnement
     *
     * @return \Carbon\Carbon|null
     */
    public function getSubscriptionEndDate()
    {
        $abonnement = $this->abonnementActif()->first();

        return $abonnement ? $abonnement->date_fin : null;
    }

    /**
     * Vérifier si l'abonnement expire bientôt (dans les 7 prochains jours)
     *
     * @return bool
     */
    public function subscriptionExpiringSoon()
    {
        $endDate = $this->getSubscriptionEndDate();

        if (!$endDate) {
            return false;
        }

        return $endDate->diffInDays(now()) <= 7 && $endDate->isFuture();
    }

    public function hasStripeLinked()
    {
        return $this->stripeAccount_id != null;
    }
    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail());
    }
    // ========================================
    // RELATIONS FOLLOW
    // ========================================

    /**
     * Professionnels que cet utilisateur suit
     */
    public function following()
    {
        return $this->belongsToMany(User::class, 'follow_pro', 'follower_id', 'pro_id')
            ->withTimestamps();
    }

    /**
     * Utilisateurs qui suivent ce professionnel
     */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follow_pro', 'pro_id', 'follower_id')
            ->withTimestamps();
    }

    /**
     * Vérifier si cet utilisateur suit un professionnel
     */
    public function isFollowing($proId)
    {
        return $this->following()->where('pro_id', $proId)->exists();
    }

    /**
     * Suivre un professionnel
     */
    public function follow($proId)
    {
        if (!$this->isFollowing($proId)) {
            $this->following()->attach($proId);
            return true;
        }
        return false;
    }

    /**
     * Ne plus suivre un professionnel
     */
    public function unfollow($proId)
    {
        if ($this->isFollowing($proId)) {
            $this->following()->detach($proId);
            return true;
        }
        return false;
    }
}
