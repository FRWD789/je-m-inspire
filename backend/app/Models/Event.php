<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use App\Traits\OptimizesImages;

class Event extends Model
{
    use HasFactory, OptimizesImages;

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
        'is_cancelled',      // ✅ AJOUTÉ
        'cancelled_at',      // ✅ AJOUTÉ
        'social_platform_ids',
        'sync_status',
        'last_synced_at',
        'sync_errors'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'base_price' => 'decimal:2',
        'is_cancelled' => 'boolean',  // ✅ AJOUTÉ - Cast integer (0/1) vers boolean
        'cancelled_at' => 'datetime', // ✅ AJOUTÉ
        'social_platform_ids' => 'array',
        'sync_errors' => 'array'
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
    // AJOUT À LA FIN DE LA CLASSE Event (backend/app/Models/Event.php)

    /**
     * Casts pour les nouveaux champs sociaux
     */
    // Ajouter à la propriété $casts existante :
    // 'social_platform_ids' => 'array',
    // 'sync_errors' => 'array',

    /**
     * Ajouter à $fillable :
     */
    // 'social_platform_ids',
    // 'sync_status',
    // 'last_synced_at',
    // 'sync_errors',

    /**
     * ============================================
     * MÉTHODES SOCIAL MEDIA
     * ============================================
     */

    /**
     * Obtenir l'ID de l'event sur une plateforme spécifique
     */
    public function getSocialPlatformId(string $platform): ?string
    {
        if (!$this->social_platform_ids) {
            return null;
        }
        return $this->social_platform_ids[$platform] ?? null;
    }

    /**
     * Définir l'ID de l'event sur une plateforme
     */
    public function setSocialPlatformId(string $platform, string $platformEventId): void
    {
        $ids = $this->social_platform_ids ?? [];
        $ids[$platform] = $platformEventId;
        $this->social_platform_ids = $ids;
        $this->save();
    }

    /**
     * Supprimer l'ID d'une plateforme
     */
    public function removeSocialPlatformId(string $platform): void
    {
        $ids = $this->social_platform_ids ?? [];
        unset($ids[$platform]);
        $this->social_platform_ids = $ids;
        $this->save();
    }

    /**
     * Vérifier si l'event est synchronisé sur une plateforme
     */
    public function isSyncedTo(string $platform): bool
    {
        return !empty($this->getSocialPlatformId($platform));
    }

    /**
     * Obtenir l'erreur de sync pour une plateforme
     */
    public function getSyncError(string $platform): ?string
    {
        if (!$this->sync_errors) {
            return null;
        }
        return $this->sync_errors[$platform] ?? null;
    }

    /**
     * Définir une erreur de sync
     */
    public function setSyncError(string $platform, ?string $error): void
    {
        $errors = $this->sync_errors ?? [];

        if ($error === null) {
            unset($errors[$platform]);
        } else {
            $errors[$platform] = $error;
        }

        $this->sync_errors = $errors;
        $this->sync_status = 'failed';
        $this->save();
    }

    /**
     * Marquer comme synchronisé avec succès
     */
    public function markAsSynced(string $platform): void
    {
        // Supprimer l'erreur si elle existe
        $errors = $this->sync_errors ?? [];
        unset($errors[$platform]);
        $this->sync_errors = $errors;

        // Mettre à jour le statut
        $this->sync_status = 'synced';
        $this->last_synced_at = now();
        $this->save();
    }

    /**
     * Vérifier si l'event peut être synchronisé
     */
    public function canBeSynced(): bool
    {
        // Ne pas synchroniser les events annulés ou passés
        if ($this->is_cancelled || $this->end_date < now()) {
            return false;
        }

        return $this->sync_status !== 'disabled';
    }

    /**
     * Scopes
     */
    public function scopeSyncEnabled($query)
    {
        return $query->where('sync_status', '!=', 'disabled');
    }

    public function scopePendingSync($query)
    {
        return $query->where('sync_status', 'pending');
    }

    public function scopeSyncFailed($query)
    {
        return $query->where('sync_status', 'failed');
    }
}
