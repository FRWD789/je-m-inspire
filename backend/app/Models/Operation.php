<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Operation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'type_operation_id',
        'quantity', // Remplace adults + children
        'paiement_id',
        'abonnement_id'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function type()
    {
        return $this->belongsTo(TypeOperation::class, 'type_operation_id');
    }

    public function paiement()
    {
        return $this->belongsTo(Paiement::class, 'paiement_id', 'paiement_id');
    }

    public function abonnement()
    {
        return $this->belongsTo(Abonnement::class, 'abonnement_id', 'abonnement_id');
    }

    // Accesseur pour le montant total
    public function getTotalAmountAttribute()
    {
        if (!$this->event) return 0;
        return $this->quantity * $this->event->base_price;
    }
}
?>
