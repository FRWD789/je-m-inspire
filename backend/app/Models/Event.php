<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

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
        'user_id',
        'thumbnail_path',
        'banner_path',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'base_price' => 'decimal:2',
    ];

    /**
     * Relation avec les images de l'événement
     */
    public function images()
    {
        return $this->hasMany(EventImage::class)->orderBy('display_order');
    }

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

    public function creator()
    {
        return $this->hasOneThrough(
            User::class,
            Operation::class,
            'event_id',
            'id',
            'id',
            'user_id'
        )->where('operations.type_operation_id', 1);
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
                    ->withPivot(['created_at']);
    }
}
