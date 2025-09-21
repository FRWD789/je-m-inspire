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
        'max_places',
        'available_places',
        'level',
        'priority',
        'localisation_id',
        'categorie_event_id',
    ];

    public function localisation()
    {
        return $this->belongsTo(Localisation::class);
    }

    public function categorie()
    {
        return $this->belongsTo(CategorieEvent::class, 'categorie_event_id');
    }

    // relation 1–1 avec Operation
    public function operation()
    {
        return $this->hasOne(Operation::class);
    }
}

