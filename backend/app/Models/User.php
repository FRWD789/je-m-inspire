<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
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
        ];
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
        return $this->hasManyThrough(
            Abonnement::class,
            Operation::class,
            'user_id',        // Clé étrangère sur operations
            'abonnement_id',  // Clé étrangère sur abonnements
            'id',             // Clé locale sur users
            'abonnement_id'   // Clé locale sur operations
        )->where('type_operation_id', 3);
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
}
