<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Abonnement extends Model
{
    use HasFactory;

    protected $table = 'abonnements';
    protected $primaryKey = 'abonnement_id';

    protected $fillable = [
        'nom',
        'description',
        'date_debut',
        'date_fin',
        'stripe_subscription_id',
        'paypal_subscription_id',
        'plan_abonnement_id',
        'status',
        'next_billing_date',
        'cancel_at_period_end',
        'status_updated_at',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'next_billing_date' => 'datetime',
        'cancel_at_period_end' => 'boolean',
        'status_updated_at' => 'datetime',
    ];

    /**
     * Relation avec le plan
     */
    public function plan()
    {
        return $this->belongsTo(PlanAbonnement::class, 'plan_abonnement_id');
    }

    /**
     * Relation avec les opérations
     */
    public function operations()
    {
        return $this->hasMany(Operation::class, 'abonnement_id', 'abonnement_id');
    }

    /**
     * Obtenir les utilisateurs
     */
    public function users()
    {
        return $this->hasManyThrough(
            User::class,
            Operation::class,
            'abonnement_id',
            'id',
            'abonnement_id',
            'user_id'
        );
    }

    /**
     * Vérifier si l'abonnement est actif
     */
    public function isActive()
    {
        if (!in_array($this->status, ['active', 'trialing'])) {
            return false;
        }

        $now = now();
        return $this->date_debut <= $now &&
               (is_null($this->date_fin) || $this->date_fin > $now);
    }

    /**
     * Vérifier si c'est Pro Plus
     */
    public function isProPlus()
    {
        return $this->nom === 'Pro Plus' ||
               ($this->plan && str_contains(strtolower($this->plan->nom), 'pro plus'));
    }

    /**
     * Obtenir le provider
     */
    public function getProvider()
    {
        if ($this->stripe_subscription_id) {
            return 'stripe';
        }

        if ($this->paypal_subscription_id) {
            return 'paypal';
        }

        return null;
    }

    /**
     * Vérifier si expire bientôt (7 jours)
     */
    public function isExpiringSoon()
    {
        if (!$this->cancel_at_period_end || !$this->next_billing_date) {
            return false;
        }

        return $this->next_billing_date->diffInDays(now()) <= 7
               && $this->next_billing_date->isFuture();
    }

    /**
     * Obtenir les jours restants avant renouvellement
     */
    public function getDaysUntilRenewal()
    {
        if (!$this->next_billing_date) {
            return null;
        }

        return now()->diffInDays($this->next_billing_date, false);
    }
}
