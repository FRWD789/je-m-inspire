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
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
    ];

    /**
     * Relation avec les opérations
     */
    public function operations()
    {
        return $this->hasMany(Operation::class, 'abonnement_id', 'abonnement_id');
    }

    /**
     * Obtenir les utilisateurs ayant cet abonnement via operations
     */
    public function users()
    {
        return $this->hasManyThrough(
            User::class,
            Operation::class,
            'abonnement_id',  // Clé étrangère sur operations
            'id',             // Clé étrangère sur users
            'abonnement_id',  // Clé locale sur abonnements
            'user_id'         // Clé locale sur operations
        );
    }

    /**
     * Vérifier si l'abonnement est actif
     */
    public function isActive()
    {
        $now = now();

        // Actif si date_debut <= maintenant ET (pas de date_fin OU date_fin > maintenant)
        return $this->date_debut <= $now &&
               (is_null($this->date_fin) || $this->date_fin > $now);
    }

    /**
     * Vérifier si c'est un abonnement Pro Plus
     */
    public function isProPlus()
    {
        return $this->nom === 'Pro Plus';
    }
}
