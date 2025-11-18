<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeOperation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Relation avec les opérations.
     * Un type d'opération peut être utilisé par plusieurs opérations.
     */
    public function operations()
    {
        return $this->hasMany(Operation::class);
    }
}
