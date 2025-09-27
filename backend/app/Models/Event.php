<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'base_price',
        'capacity',
        'available_places',
        'max_places',
        'level',
        'priority',
        'localisation_id',
        'categorie_event_id',
        'user_id' // Si vous avez ajouté cette colonne
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'base_price' => 'decimal:2',
    ];

    /**
     * Relation avec la localisation
     */
    public function localisation()
    {
        return $this->belongsTo(Localisation::class);
    }

    /**
     * Relation avec la catégorie d'événement
     */
    public function categorie()
    {
        return $this->belongsTo(CategorieEvent::class, 'categorie_event_id');
    }

    /**
     * Relation avec les opérations (réservations, créations, etc.)
     */
    public function operations()
    {
        return $this->hasMany(Operation::class);
    }

    /**
     * Relation avec l'utilisateur créateur (optionnel si vous avez user_id)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relation pour les réservations uniquement
     */
    public function reservations()
    {
        return $this->hasMany(Operation::class)->where('type_operation_id', 2);
    }

    /**
     * Relation pour obtenir les utilisateurs qui ont réservé
     */
    public function participants()
    {
        return $this->belongsToMany(User::class, 'operations')
                    ->wherePivot('type_operation_id', 2)
                    ->withPivot(['quantity', 'created_at']);
    }
}
