<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Commission extends Model
{
    use HasFactory;

    protected $fillable = [
        'paiement_id',
        'vendor_id',
        'montant_total',
        'taux_commission',
        'montant_commission',
        'montant_net',
        'type',
        'status',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'montant_total' => 'decimal:2',
        'taux_commission' => 'decimal:2',
        'montant_commission' => 'decimal:2',
        'montant_net' => 'decimal:2',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relation avec le paiement
     */
    public function paiement()
    {
        return $this->belongsTo(Paiement::class, 'paiement_id', 'paiement_id');
    }

    /**
     * Relation avec le vendor (professionnel)
     */
    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    /**
     * Scope pour les commissions indirectes
     */
    public function scopeIndirect($query)
    {
        return $query->where('type', 'indirect');
    }

    /**
     * Scope pour les commissions directes
     */
    public function scopeDirect($query)
    {
        return $query->where('type', 'direct');
    }

    /**
     * Scope pour les commissions en attente
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope pour les commissions payées
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope pour un vendor spécifique
     */
    public function scopeForVendor($query, $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }

    /**
     * Marquer la commission comme payée
     */
    public function markAsPaid($notes = null)
    {
        $this->status = 'paid';
        $this->paid_at = now();
        if ($notes) {
            $this->notes = $notes;
        }
        $this->save();
    }

    /**
     * Vérifier si la commission est indirecte et en attente
     */
    public function needsManualTransfer()
    {
        return $this->type === 'indirect' && $this->status === 'pending';
    }
}
