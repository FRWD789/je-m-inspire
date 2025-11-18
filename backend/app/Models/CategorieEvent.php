<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategorieEvent extends Model
{
    use HasFactory;

    protected $table = 'categorie_events';

    protected $fillable = [
        'name',
        'description',
    ];

    // Relation avec les events (1 catégorie peut avoir plusieurs events)
    public function events()
    {
        return $this->hasMany(Event::class);
    }
}
