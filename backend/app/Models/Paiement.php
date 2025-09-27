<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Paiement extends Model
{
    use HasFactory;

    protected $table = 'paiements';
    protected $primaryKey = 'paiement_id';

    protected $fillable = [
        'total',
        'status',
        'type_paiement_id',
        'taux_commission',
        'facture_id',
        'vendor_id',
        'session_id',
        'stripe_id',
        'paypal_id',
        'stripe_subscription_id',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relation avec Operation
    public function operation()
    {
        return $this->hasOne(Operation::class, 'paiement_id', 'paiement_id');
    }

    // Relation avec TypePaiement
    public function typePaiement()
    {
        return $this->belongsTo(TypePaiement::class, 'type_paiement_id', 'type_paiement_id');
    }

    // Relation avec Abonnement (si applicable)
    public function abonnement()
    {
        return $this->belongsTo(Abonnement::class, 'abonnement_id', 'abonnement_id');
    }
}
