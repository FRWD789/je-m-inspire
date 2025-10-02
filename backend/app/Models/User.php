<?php

namespace App\Models;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use App\Models\Role; // Ajoute cette ligne
use App\Models\Operation; // Ajoute aussi Operation
use App\Models\Event; // Et Event
class User extends Authenticatable implements JWTSubject,MustVerifyEmail
{
    use HasFactory, Notifiable;
    protected $fillable = [
        'name',
        'last_name',
        'email',
        'date_of_birth',
        'city',
        'profile_picture',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'password' => 'hashed',
        ];
    }

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relations avec les rôles (many-to-many)
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
    }

    // Méthodes utilitaires pour les rôles
    public function hasRole($role)
    {
        return $this->roles()->where('role', $role)->exists();
    }

    public function hasAnyRole($roles)
    {
        return $this->roles()->whereIn('role', $roles)->exists();
    }

    // Si tu veux aussi supporter role_id (one-to-many), ajoute:
    // public function role()
    // {
    //     return $this->belongsTo(Role::class);
    // }

    // ------------------------------
    // Relation avec les opérations (1 user -> N operations)
    // ------------------------------
    public function operations()
    {
        return $this->hasMany(Operation::class);
    }

    // ------------------------------
    // Relation pratique avec les événements via les opérations
    // ------------------------------
    public function events()
    {
        // un user peut créer ou réserver plusieurs événements via les opérations
        return $this->hasManyThrough(Event::class, Operation::class, 'user_id', 'id', 'id', 'event_id');
        // user_id dans Operation
        // event_id dans Operation vers id dans Event
    }
}
