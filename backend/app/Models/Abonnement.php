<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Abonnement extends Model
{

    protected $table = 'abonnements';

    // Si la clé primaire n'est pas 'id', indique-la ici
    protected $primaryKey = 'abonnement_id';
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
        'date_debut',
        'date_fin',
        'stripe_subscription_id',
        'paypal_subscription_id',
        'user_id',
        'created_at',
        'updated_at'
    ];
}
