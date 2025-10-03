<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Localisation extends Model
{
    use HasFactory;

    protected $table = 'localisations';

    protected $fillable = [
        'name',
        'address',
        'latitude',
        'longitude',
    ];

    // Relation avec les events (1 localisation peut avoir plusieurs events)
    public function events()
    {
        return $this->hasMany(Event::class);
    }
}
