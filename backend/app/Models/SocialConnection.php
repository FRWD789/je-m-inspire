<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Crypt;

class SocialConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'platform',
        'platform_user_id',
        'platform_page_id',
        'platform_username',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'metadata',
        'is_active',
        'last_synced_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'token_expires_at' => 'datetime',
        'last_synced_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'access_token',
        'refresh_token',
    ];

    /**
     * Relation avec User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Encrypt access token avant de le sauvegarder
     */
    public function setAccessTokenAttribute($value)
    {
        if ($value) {
            $this->attributes['access_token'] = Crypt::encryptString($value);
        }
    }

    /**
     * Decrypt access token lors de la lecture
     */
    public function getAccessTokenAttribute($value)
    {
        if ($value) {
            return Crypt::decryptString($value);
        }
        return null;
    }

    /**
     * Encrypt refresh token
     */
    public function setRefreshTokenAttribute($value)
    {
        if ($value) {
            $this->attributes['refresh_token'] = Crypt::encryptString($value);
        }
    }

    /**
     * Decrypt refresh token
     */
    public function getRefreshTokenAttribute($value)
    {
        if ($value) {
            return Crypt::decryptString($value);
        }
        return null;
    }

    /**
     * Vérifier si le token a expiré
     */
    public function isTokenExpired(): bool
    {
        if (!$this->token_expires_at) {
            return false;
        }
        return now()->greaterThan($this->token_expires_at);
    }

    /**
     * Vérifier si le token expire bientôt (dans les 7 jours)
     */
    public function isTokenExpiringSoon(): bool
    {
        if (!$this->token_expires_at) {
            return false;
        }
        return now()->addDays(7)->greaterThan($this->token_expires_at);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForPlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('token_expires_at')
                    ->where('token_expires_at', '<', now());
    }

    public function scopeExpiringSoon($query)
    {
        return $query->whereNotNull('token_expires_at')
                    ->where('token_expires_at', '<', now()->addDays(7))
                    ->where('token_expires_at', '>', now());
    }
}
