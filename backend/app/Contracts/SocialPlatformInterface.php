<?php

namespace App\Contracts;

use App\Models\Event;
use App\Models\SocialConnection;

interface SocialPlatformInterface
{
    /**
     * Obtenir le nom de la plateforme
     */
    public function getPlatformName(): string;

    /**
     * Générer l'URL d'autorisation OAuth
     */
    public function getAuthorizationUrl(int $userId): string;

    /**
     * Traiter le callback OAuth et créer/mettre à jour la connexion
     */
    public function handleCallback(string $code, int $userId): SocialConnection;

    /**
     * Rafraîchir le token d'accès
     */
    public function refreshToken(SocialConnection $connection): SocialConnection;

    /**
     * Créer un événement sur la plateforme
     */
    public function createEvent(Event $event, SocialConnection $connection): string;

    /**
     * Mettre à jour un événement sur la plateforme
     */
    public function updateEvent(Event $event, SocialConnection $connection): bool;

    /**
     * Supprimer un événement de la plateforme
     */
    public function deleteEvent(string $platformEventId, SocialConnection $connection): bool;

    /**
     * Upload une image pour l'événement
     */
    public function uploadEventImage(string $platformEventId, string $imagePath, SocialConnection $connection): bool;

    /**
     * Valider que la connexion est toujours active
     */
    public function validateConnection(SocialConnection $connection): bool;
}
