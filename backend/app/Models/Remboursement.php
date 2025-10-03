<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Remboursement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'operation_id',
        'montant',
        'motif',
        'statut',
        'commentaire_admin',
        'date_traitement'
    ];

    protected $casts = [
        'date_traitement' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function operation()
    {
        return $this->belongsTo(Operation::class);
    }
}
