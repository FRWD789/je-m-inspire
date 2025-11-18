<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PlanAbonnement extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'external_id_stripe',
        'external_id_paypal',
        'nom',
        'description',
        'prix',
        'devise',
        'intervalle',
        'intervalle_count',
        'features',
        'actif',
        'populaire',
        'last_synced_at',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'actif' => 'boolean',
        'populaire' => 'boolean',
        'features' => 'array',
        'last_synced_at' => 'datetime',
    ];

    /**
     * Relation avec les abonnements
     */
    public function abonnements()
    {
        return $this->hasMany(Abonnement::class, 'plan_abonnement_id');
    }

    /**
     * Obtenir le libellé de l'intervalle
     */
    public function getIntervalleLabel()
    {
        $labels = [
            'month' => 'mois',
            'year' => 'an',
        ];

        $label = $labels[$this->intervalle] ?? $this->intervalle;

        return $this->intervalle_count > 1
            ? "{$this->intervalle_count} {$label}"
            : $label;
    }

    /**
     * Obtenir le prix formaté
     */
    public function getPrixFormatte()
    {
        return number_format($this->prix, 2, ',', ' ') . ' ' . $this->devise;
    }

    /**
     * Obtenir le prix complet avec intervalle
     */
    public function getPrixComplet()
    {
        return $this->getPrixFormatte() . ' / ' . $this->getIntervalleLabel();
    }

    /**
     * Vérifier si doit être synchronisé (> 24h)
     */
    public function needsSync()
    {
        if (is_null($this->last_synced_at)) {
            return true;
        }

        return $this->last_synced_at->addDay()->isPast();
    }

    /**
     * Vérifier si supporte Stripe
     */
    public function hasStripe()
    {
        return !empty($this->external_id_stripe);
    }

    /**
     * Vérifier si supporte PayPal
     */
    public function hasPaypal()
    {
        return !empty($this->external_id_paypal);
    }

    /**
     * Scope pour les plans actifs
     */
    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }

    /**
     * Scope pour les plans populaires
     */
    public function scopePopulaire($query)
    {
        return $query->where('populaire', true);
    }
}
