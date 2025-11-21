<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Operation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'type_operation_id',
        'paiement_id',
        'abonnement_id',
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec l'événement
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Relation avec le type d'opération
     */
    public function typeOperation()
    {
        return $this->belongsTo(TypeOperation::class);
    }

    /**
     * Relation avec le paiement (nullable)
     */
    public function paiement()
    {
        return $this->belongsTo(Paiement::class, 'paiement_id', 'paiement_id');
    }

    /**
     * Relation avec l'abonnement (nullable)
     */
    public function abonnement()
    {
        return $this->belongsTo(Abonnement::class, 'abonnement_id', 'abonnement_id');
    }

    /**
     * Relation avec le remboursement (nullable)
     */
    public function remboursement()
    {
        return $this->hasOne(Remboursement::class, 'operation_id');
    }
}