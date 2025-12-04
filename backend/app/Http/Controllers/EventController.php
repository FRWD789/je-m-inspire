<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Http\Resources\EventCollection;
use App\Models\Event;
use App\Models\EventImage;
use App\Models\Operation;
use App\Models\Localisation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Notifications\NewEventNotification;
use App\Traits\OptimizesImages;
use App\Helpers\FileHelper;

class EventController extends Controller
{
    use ApiResponse;
    use OptimizesImages;
    /**
     * Liste tous les événements futurs
     */
    public function index()
    {
        $events = Event::with(['localisation', 'categorie', 'images', 'creator'])
            ->where('is_cancelled', false)
            ->where('start_date', '>', now())
            ->orderBy('start_date')
            ->get();

        return $this->collectionResponse(
            EventResource::collection($events),
            'Événements récupérés avec succès'
        );
    }

    /**
     * Afficher un événement
     */
    public function show($id)
    {
        $event = Event::with(['localisation', 'categorie', 'creator', 'images'])->find($id);

        if (!$event) {
            return $this->notFoundResponse('Événement non trouvé');
        }

        return $this->resourceResponse(
            new EventResource($event),
            'Événement récupéré'
        );
    }

    /**
     * Créer un événement (professionnels uniquement)
     */
    public function store(Request $request)
    {
        $debug = config('app.debug');
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        if (!$user->hasRole('professionnel') && !$user->hasRole('admin')) {
            return $this->unauthorizedResponse('Seuls les professionnels peuvent créer des événements');
        }

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string|max:2000',
                'start_date' => 'required|date|after_or_equal:now',
                'end_date' => 'required|date|after:start_date',
                'base_price' => 'required|numeric|min:0|max:9999.99',
                'capacity' => 'required|integer|min:1|max:10000',
                'max_places' => 'required|integer|min:1|max:10000',
                'level' => 'required|string|max:50',
                'priority' => 'required|integer|min:1|max:10',
                'localisation_address' => 'required|string|max:255',
                'localisation_lat' => 'required|numeric|between:-90,90',
                'localisation_lng' => 'required|numeric|between:-180,180',
                'categorie_event_id' => 'required|exists:categorie_events,id',
                'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif|max:2048',
                'banner' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif|max:4096',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif|max:2048',
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        if ($request->hasFile('images')) {
            $images = $request->file('images');
            if (count($images) > 5) {
                return $this->errorResponse('Maximum 5 images autorisées', 422);
            }
        }

        if ($validated['capacity'] > $validated['max_places']) {
            return $this->errorResponse('La capacité ne peut pas dépasser le nombre maximum de places', 422);
        }

        $validated['available_places'] = $validated['max_places'];

        try {
            DB::beginTransaction();

            $existingLocalisation = Localisation::where(function($query) use ($validated) {
                $query->whereBetween('latitude', [
                    $validated['localisation_lat'] - 0.0001,
                    $validated['localisation_lat'] + 0.0001
                ])
                ->whereBetween('longitude', [
                    $validated['localisation_lng'] - 0.0001,
                    $validated['localisation_lng'] + 0.0001
                ]);
            })->first();

            if ($existingLocalisation) {
                $localisation = $existingLocalisation;
            } else {
                $localisation = Localisation::create([
                    'name' => substr($validated['localisation_address'], 0, 100),
                    'address' => $validated['localisation_address'],
                    'latitude' => $validated['localisation_lat'],
                    'longitude' => $validated['localisation_lng'],
                ]);
            }

            // ✅ UPLOAD RAPIDE : Sauvegarder sans optimiser
            $thumbnailPath = null;
            $thumbnailOptimize = null;
            if ($request->hasFile('thumbnail')) {
                $file = $request->file('thumbnail');
                $extension = FileHelper::getExtensionFromMimeType($file);
                $filename = time() . '_thumb_' . Str::random(10) . '.' . $extension;
                $thumbnailPath = $file->storeAs('event_thumbnails', $filename, 'public');
                $thumbnailOptimize = [
                    'temp_path' => $thumbnailPath,
                    'directory' => 'event_thumbnails',
                    'max_width' => 800,
                    'quality' => 85,
                    'field' => 'thumbnail'
                ];
            }

            $bannerPath = null;
            $bannerOptimize = null;
            if ($request->hasFile('banner')) {
                $file = $request->file('banner');
                $extension = FileHelper::getExtensionFromMimeType($file);
                $filename = time() . '_banner_' . Str::random(10) . '.' . $extension;
                $bannerPath = $file->storeAs('event_banners', $filename, 'public');
                $bannerOptimize = [
                    'temp_path' => $bannerPath,
                    'directory' => 'event_banners',
                    'max_width' => 1920,
                    'quality' => 90,
                    'field' => 'banner'
                ];
            }

            $event = Event::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'base_price' => $validated['base_price'],
                'capacity' => $validated['capacity'],
                'max_places' => $validated['max_places'],
                'available_places' => $validated['available_places'],
                'level' => $validated['level'],
                'priority' => $validated['priority'],
                'localisation_id' => $localisation->id,
                'categorie_event_id' => $validated['categorie_event_id'],
                'thumbnail_path' => $thumbnailPath,
                'banner_path' => $bannerPath,
            ]);

            // Upload rapide des images
            $imagesToOptimize = [];
            if ($request->hasFile('images')) {
                $images = $request->file('images');

                foreach ($images as $index => $image) {
                    $extension = FileHelper::getExtensionFromMimeType($image);
                    $filename = time() . '_' . Str::random(10) . '.' . $extension;
                    $imagePath = $image->storeAs('event_images', $filename, 'public');

                    $eventImage = EventImage::create([
                        'event_id' => $event->id,
                        'image_path' => $imagePath,
                        'display_order' => $index,
                    ]);

                    $imagesToOptimize[] = [
                        'temp_path' => $imagePath,
                        'directory' => 'event_images',
                        'max_width' => 1200,
                        'quality' => 85,
                        'image_id' => $eventImage->id
                    ];
                }
            }

            Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 1,
            ]);

            DB::commit();

            // ✅ LANCER L'OPTIMISATION EN ARRIÈRE-PLAN
            $allImages = array_filter(array_merge(
                $thumbnailOptimize ? [$thumbnailOptimize] : [],
                $bannerOptimize ? [$bannerOptimize] : [],
                $imagesToOptimize
            ));

            if (!empty($allImages)) {
                \App\Jobs\OptimizeEventImages::dispatch($event->id, $allImages);

                Log::info('[Event] Job d\'optimisation lancé', [
                    'event_id' => $event->id,
                    'images_count' => count($allImages)
                ]);
            }

            // Notifier les followers
            try {
                $this->notifyFollowers($user, $event);
            } catch (\Exception $e) {
                Log::warning('[Event] Erreur notification (non-bloquant)', [
                    'event_id' => $event->id,
                    'error' => $e->getMessage()
                ]);
            }

            return $this->resourceResponse(
                new EventResource($event->load(['localisation', 'categorie', 'images', 'creator'])),
                'Événement créé avec succès',
                201
            );

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Event] Erreur création: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la création de l\'événement', 500);
        }
    }


    /**
     * Mettre à jour un événement
     */
    public function update(Request $request, $id)
    {
        // ✅ LOG FORCÉ - PREMIÈRE LIGNE
        Log::error('========== [EVENT] DÉBUT UPDATE ==========', [
            $request->all(),
            'event_id' => $id,
            'user_id' => auth()->id() ?? 'non authentifié',
            'has_delete_thumbnail' => $request->input('delete_thumbnail'),
            'has_delete_banner' => $request->input('delete_banner'),
            'has_thumbnail_file' => $request->hasFile('thumbnail'),
            'has_banner_file' => $request->hasFile('banner'),
        ]);

        $debug = config('app.debug');
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $event = Event::with('images')->find($id);

            if (!$event) {
                return $this->notFoundResponse('Événement non trouvé');
            }

            $isAdmin = $user->hasRole('admin');
            $isCreator = Operation::where([
                'event_id' => $id,
                'user_id' => $user->id,
                'type_operation_id' => 1
            ])->exists();

            if (!$isAdmin && !$isCreator) {
                return $this->unauthorizedResponse('Vous n\'êtes pas autorisé à modifier cet événement');
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'sometimes|string|max:2000',
                'start_date' => 'sometimes|date|after_or_equal:now',
                'end_date' => 'sometimes|date|after:start_date',
                'base_price' => 'sometimes|numeric|min:0|max:9999.99',
                'max_places' => 'sometimes|integer|min:1|max:10000',
                'level' => 'sometimes|string|max:50',
                'priority' => 'sometimes|integer|min:1|max:10',
                'localisation_id' => 'sometimes|exists:localisations,id',
                'categorie_event_id' => 'sometimes|exists:categorie_events,id',
                'thumbnail' => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:2048',
                'banner' => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:4096',
                'images.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,avif|max:2048',
                'delete_images' => 'nullable|array',
                'delete_images.*' => 'integer|exists:event_images,id',
                'images_order' => 'nullable|array',
                'images_order.*' => 'integer|exists:event_images,id',
                'delete_thumbnail' => 'nullable|in:0,1',
                'delete_banner' => 'nullable|in:0,1',
            ]);

            Log::info('[Event] Validation passée', [
                'event_id' => $id,
                'validated_keys' => array_keys($validated)
            ]);

            DB::beginTransaction();

            Log::info('[Event] Transaction démarrée', ['event_id' => $id]);

            // ✅ UPLOAD RAPIDE : Collection des images à optimiser
            $imagesToOptimize = [];

            // ========================================
            // THUMBNAIL DELETION
            // ========================================
            if ($request->input('delete_thumbnail') == 1) {
                Log::info('[Event] 🗑️ Demande suppression thumbnail', [
                    'event_id' => $id,
                    'current_thumbnail_path' => $event->thumbnail_path
                ]);

                if ($event->thumbnail_path && Storage::disk('public')->exists($event->thumbnail_path)) {
                    $oldPath = $event->thumbnail_path;

                    Storage::disk('public')->delete($event->thumbnail_path);

                    // ✅ Vérification suppression physique
                    if (!Storage::disk('public')->exists($oldPath)) {
                        Log::info('[Event] ✅ Fichier thumbnail PHYSIQUEMENT supprimé', [
                            'event_id' => $id,
                            'path' => $oldPath
                        ]);
                    } else {
                        Log::error('[Event] ❌ ÉCHEC suppression thumbnail', [
                            'event_id' => $id,
                            'path' => $oldPath
                        ]);
                    }

                    // Supprimer les variantes
                    $pathInfo = pathinfo($oldPath);
                    $oldBasename = $pathInfo['filename'];
                    $oldDir = $pathInfo['dirname'];

                    foreach (['_md', '_lg', '_xl'] as $suffix) {
                        foreach (['.jpg', '.webp'] as $ext) {
                            $variantPath = "{$oldDir}/{$oldBasename}{$suffix}{$ext}";
                            if (Storage::disk('public')->exists($variantPath)) {
                                Storage::disk('public')->delete($variantPath);
                                Log::info('[Event] Variante thumbnail supprimée', [
                                    'variant_path' => $variantPath
                                ]);
                            }
                        }
                    }

                    // ✅ CORRECTION CRITIQUE
                    $validated['thumbnail_path'] = null;

                    Log::info('[Event] ✅ thumbnail_path ajouté dans $validated', [
                        'event_id' => $id,
                        'value' => 'NULL'
                    ]);
                } else {
                    Log::warning('[Event] Thumbnail inexistant ou déjà supprimé', [
                        'event_id' => $id,
                        'thumbnail_path' => $event->thumbnail_path
                    ]);
                }
            }

            // ========================================
            // THUMBNAIL UPDATE
            // ========================================
            if ($request->hasFile('thumbnail')) {
                Log::info('[Event] 🖼️ Nouveau thumbnail uploadé', ['event_id' => $id]);

                // Supprimer l'ancien thumbnail
                if ($event->thumbnail_path && Storage::disk('public')->exists($event->thumbnail_path)) {
                    Storage::disk('public')->delete($event->thumbnail_path);

                    // Supprimer aussi les variantes de l'ancien thumbnail
                    $oldPath = pathinfo($event->thumbnail_path);
                    $oldBasename = $oldPath['filename'];
                    $oldDir = $oldPath['dirname'];

                    foreach (['_md', '_lg', '_xl'] as $suffix) {
                        foreach (['.jpg', '.webp'] as $ext) {
                            $variantPath = "{$oldDir}/{$oldBasename}{$suffix}{$ext}";
                            if (Storage::disk('public')->exists($variantPath)) {
                                Storage::disk('public')->delete($variantPath);
                            }
                        }
                    }
                }

                $file = $request->file('thumbnail');
                $extension = FileHelper::getExtensionFromMimeType($file);
                $filename = time() . '_thumb_' . Str::random(10) . '.' . $extension;
                $thumbnailPath = $file->storeAs('event_thumbnails', $filename, 'public');

                $validated['thumbnail_path'] = $thumbnailPath;

                $imagesToOptimize[] = [
                    'temp_path' => $thumbnailPath,
                    'directory' => 'event_thumbnails',
                    'max_width' => 800,
                    'quality' => 85,
                    'field' => 'thumbnail'
                ];
            }

            // ========================================
            // BANNER DELETION
            // ========================================
            if ($request->input('delete_banner') == 1) {
                Log::info('[Event] 🗑️ Demande suppression banner', [
                    'event_id' => $id,
                    'current_banner_path' => $event->banner_path
                ]);

                if ($event->banner_path && Storage::disk('public')->exists($event->banner_path)) {
                    $oldPath = $event->banner_path;

                    Storage::disk('public')->delete($event->banner_path);

                    // ✅ Vérification suppression physique
                    if (!Storage::disk('public')->exists($oldPath)) {
                        Log::info('[Event] ✅ Fichier banner PHYSIQUEMENT supprimé', [
                            'event_id' => $id,
                            'path' => $oldPath
                        ]);
                    } else {
                        Log::error('[Event] ❌ ÉCHEC suppression banner', [
                            'event_id' => $id,
                            'path' => $oldPath
                        ]);
                    }

                    // Supprimer les variantes
                    $pathInfo = pathinfo($oldPath);
                    $oldBasename = $pathInfo['filename'];
                    $oldDir = $pathInfo['dirname'];

                    foreach (['_md', '_lg', '_xl'] as $suffix) {
                        foreach (['.jpg', '.webp'] as $ext) {
                            $variantPath = "{$oldDir}/{$oldBasename}{$suffix}{$ext}";
                            if (Storage::disk('public')->exists($variantPath)) {
                                Storage::disk('public')->delete($variantPath);
                                Log::info('[Event] Variante banner supprimée', [
                                    'variant_path' => $variantPath
                                ]);
                            }
                        }
                    }

                    // ✅ CORRECTION CRITIQUE
                    $validated['banner_path'] = null;

                    Log::info('[Event] ✅ banner_path ajouté dans $validated', [
                        'event_id' => $id,
                        'value' => 'NULL'
                    ]);
                } else {
                    Log::warning('[Event] Banner inexistant ou déjà supprimé', [
                        'event_id' => $id,
                        'banner_path' => $event->banner_path
                    ]);
                }
            }

            // ========================================
            // BANNER UPDATE
            // ========================================
            if ($request->hasFile('banner')) {
                Log::info('[Event] 🖼️ Nouveau banner uploadé', ['event_id' => $id]);

                // Supprimer l'ancien banner
                if ($event->banner_path && Storage::disk('public')->exists($event->banner_path)) {
                    Storage::disk('public')->delete($event->banner_path);

                    // Supprimer aussi les variantes de l'ancien banner
                    $oldPath = pathinfo($event->banner_path);
                    $oldBasename = $oldPath['filename'];
                    $oldDir = $oldPath['dirname'];

                    foreach (['_md', '_lg', '_xl'] as $suffix) {
                        foreach (['.jpg', '.webp'] as $ext) {
                            $variantPath = "{$oldDir}/{$oldBasename}{$suffix}{$ext}";
                            if (Storage::disk('public')->exists($variantPath)) {
                                Storage::disk('public')->delete($variantPath);
                            }
                        }
                    }
                }

                $file = $request->file('banner');
                $extension = FileHelper::getExtensionFromMimeType($file);
                $filename = time() . '_banner_' . Str::random(10) . '.' . $extension;
                $bannerPath = $file->storeAs('event_banners', $filename, 'public');

                $validated['banner_path'] = $bannerPath;

                $imagesToOptimize[] = [
                    'temp_path' => $bannerPath,
                    'directory' => 'event_banners',
                    'max_width' => 1920,
                    'quality' => 90,
                    'field' => 'banner'
                ];
            }

            // ========================================
            // GALLERY IMAGES DELETION
            // ========================================
            if (!empty($validated['delete_images'])) {
                $imagesToDelete = EventImage::where('event_id', $id)
                    ->whereIn('id', $validated['delete_images'])
                    ->get();

                foreach ($imagesToDelete as $image) {
                    // Supprimer le fichier original
                    if (Storage::disk('public')->exists($image->image_path)) {
                        Storage::disk('public')->delete($image->image_path);
                    }

                    // Supprimer les variantes
                    $pathInfo = pathinfo($image->image_path);
                    $basename = $pathInfo['filename'];
                    $directory = $pathInfo['dirname'];

                    foreach (['_md', '_lg', '_xl'] as $suffix) {
                        foreach (['.jpg', '.webp'] as $ext) {
                            $variantPath = "{$directory}/{$basename}{$suffix}{$ext}";
                            if (Storage::disk('public')->exists($variantPath)) {
                                Storage::disk('public')->delete($variantPath);
                            }
                        }
                    }

                    $image->delete();

                    Log::info('[Event] Image galerie supprimée', [
                        'event_id' => $id,
                        'image_id' => $image->id
                    ]);
                }
            }

            // ========================================
            // GALLERY IMAGES REORDERING
            // ========================================
            if (!empty($validated['images_order'])) {
                foreach ($validated['images_order'] as $newOrder => $imageId) {
                    EventImage::where('id', $imageId)
                        ->where('event_id', $id)
                        ->update(['display_order' => $newOrder]);
                }

                Log::info('[Event] Ordre des images mis à jour', [
                    'event_id' => $id,
                    'new_order' => $validated['images_order']
                ]);
            }

            // ========================================
            // ADD NEW GALLERY IMAGES
            // ========================================
            if ($request->hasFile('images')) {
                $images = $request->file('images');

                // Vérifier la limite totale (existantes + nouvelles)
                $existingCount = $event->images()->count();
                $newCount = count($images);

                if (($existingCount + $newCount) > 5) {
                    DB::rollBack();
                    return $this->errorResponse('Maximum 5 images au total (actuellement: ' . $existingCount . ')', 422);
                }

                $currentMaxOrder = $event->images()->max('display_order') ?? -1;

                foreach ($images as $index => $image) {
                    $extension = FileHelper::getExtensionFromMimeType($image);
                    $filename = time() . '_' . Str::random(10) . '.' . $extension;
                    $imagePath = $image->storeAs('event_images', $filename, 'public');

                    $eventImage = EventImage::create([
                        'event_id' => $event->id,
                        'image_path' => $imagePath,
                        'display_order' => $currentMaxOrder + $index + 1,
                    ]);

                    $imagesToOptimize[] = [
                        'temp_path' => $imagePath,
                        'directory' => 'event_images',
                        'max_width' => 1200,
                        'quality' => 85,
                        'image_id' => $eventImage->id
                    ];

                    Log::info('[Event] Nouvelle image ajoutée', [
                        'event_id' => $event->id,
                        'image_id' => $eventImage->id,
                        'image_path' => $imagePath,
                        'display_order' => $currentMaxOrder + $index + 1
                    ]);
                }
            }

            // ========================================
            // UPDATE EVENT FIELDS
            // ========================================
            if (isset($validated['max_places'])) {
                $reservedPlaces = $event->max_places - $event->available_places;
                if ($validated['max_places'] < $reservedPlaces) {
                    DB::rollBack();
                    return $this->errorResponse(
                        'Le nouveau nombre maximum de places ne peut pas être inférieur aux places déjà réservées',
                        422
                    );
                }
                $validated['available_places'] = $validated['max_places'] - $reservedPlaces;
            }

            // ✅ LOG AVANT UPDATE
            Log::info('[Event] AVANT update() - Contenu de $validated', [
                'event_id' => $event->id,
                'has_thumbnail_path' => array_key_exists('thumbnail_path', $validated),
                'thumbnail_path_value' => $validated['thumbnail_path'] ?? 'NON PRÉSENT',
                'has_banner_path' => array_key_exists('banner_path', $validated),
                'banner_path_value' => $validated['banner_path'] ?? 'NON PRÉSENT',
                'all_validated_keys' => array_keys($validated)
            ]);

            // ✅ MISE À JOUR EN BASE DE DONNÉES
            $event->update($validated);

            // ✅ LOG APRÈS UPDATE
            $freshEvent = $event->fresh(); // Recharger depuis la DB
            Log::info('[Event] APRÈS update() - Événement mis à jour en DB', [
                'event_id' => $event->id,
                'thumbnail_path' => $freshEvent->thumbnail_path,
                'banner_path' => $freshEvent->banner_path,
            ]);

            DB::commit();

            Log::info('[Event] Transaction commitée', ['event_id' => $id]);

            // ✅ LANCER L'OPTIMISATION EN ARRIÈRE-PLAN
            if (!empty($imagesToOptimize)) {
                \App\Jobs\OptimizeEventImages::dispatch($event->id, $imagesToOptimize);

                Log::info('[Event] Job optimisation lancé (update)', [
                    'event_id' => $event->id,
                    'images_count' => count($imagesToOptimize)
                ]);
            }

            Log::info('[Event] ✅ UPDATE TERMINÉ AVEC SUCCÈS', [
                'event_id' => $event->id,
                'updated_by' => $user->id
            ]);

            // Build response including is_creator and user_role
            $eventResource = new EventResource($event->load(['localisation', 'categorie', 'images', 'creator']));
            $responseData = $eventResource->toArray($request);
            $responseData['is_creator'] = $isCreator;
            $responseData['user_role'] = $isAdmin ? 'admin' : ($isCreator ? 'creator' : 'user');

            return $this->successResponse(
                $responseData,
                'Événement mis à jour avec succès'
            );

        } catch (ValidationException $e) {
            Log::error('[Event] ❌ Erreur validation', [
                'event_id' => $id,
                'errors' => $e->errors()
            ]);
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Event] ❌ Erreur mise à jour: ' . $e->getMessage(), [
                'event_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->errorResponse('Erreur lors de la mise à jour de l\'événement', 500);
        }
    }

    /**
     * Supprimer un événement
     */
    public function destroy($id)
    {
        $debug = config('app.debug');
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $event = Event::with('images')->find($id);

            if (!$event) {
                return $this->notFoundResponse('Événement non trouvé');
            }

            $isAdmin = $user->hasRole('admin');
            $isCreator = Operation::where([
                'event_id' => $id,
                'user_id' => $user->id,
                'type_operation_id' => 1
            ])->exists();

            if (!$isAdmin && !$isCreator) {
                return $this->unauthorizedResponse('Vous n\'êtes pas autorisé à supprimer cet événement');
            }

            DB::beginTransaction();

            // Supprimer les images physiques
            foreach ($event->images as $image) {
                if (Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
            }

            $event->delete();

            DB::commit();

            if ($debug) {
                Log::info('[Event] Événement supprimé', [
                    'event_id' => $id,
                    'deleted_by' => $user->id
                ]);
            }

            return $this->successResponse(null, 'Événement supprimé avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Event] Erreur suppression: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la suppression de l\'événement', 500);
        }
    }

    /**
     * Réserver des places pour un événement
     */
    public function reserve(Request $request, $eventId)
    {
        $debug = config('app.debug');
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            DB::beginTransaction();

            $event = Event::lockForUpdate()->find($eventId);

            if (!$event) {
                return $this->notFoundResponse('Événement non trouvé');
            }

            if ($event->start_date <= now()) {
                return $this->errorResponse('Impossible de réserver pour un événement passé ou en cours', 422);
            }

            if ($event->available_places < 1) {
                return $this->errorResponse('Places insuffisantes disponibles', 422);
            }

            $existingReservation = Operation::where([
                'user_id' => $user->id,
                'event_id' => $eventId,
                'type_operation_id' => 2
            ])->first();

            if ($existingReservation) {
                return $this->errorResponse('Vous avez déjà une réservation pour cet événement', 422);
            }

            $event->available_places -= 1;
            $event->save();

            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $eventId,
                'type_operation_id' => 2,
            ]);

            DB::commit();

            if ($debug) {
                Log::info('[Event] Réservation créée', [
                    'operation_id' => $operation->id,
                    'event_id' => $eventId,
                    'user_id' => $user->id,
                ]);
            }

            return $this->successResponse([
                'operation' => $operation,
                'event' => new EventResource($event->load(['localisation', 'categorie', 'images'])),
                'remaining_places' => $event->available_places
            ], 'Réservation effectuée avec succès', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Event] Erreur réservation: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la réservation', 500);
        }
    }

    /**
     * Annuler une réservation
     */
    public function cancelReservation($eventId)
    {
        $debug = config('app.debug');
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            DB::beginTransaction();

            $operation = Operation::where([
                'user_id' => $user->id,
                'event_id' => $eventId,
                'type_operation_id' => 2
            ])->first();

            if (!$operation) {
                return $this->notFoundResponse('Réservation non trouvée');
            }

            $event = Event::lockForUpdate()->find($eventId);
            $event->available_places += 1;
            $event->save();

            $operation->delete();

            DB::commit();

            if ($debug) {
                Log::info('[Event] Réservation annulée', [
                    'event_id' => $eventId,
                    'user_id' => $user->id,
                ]);
            }

            return $this->successResponse(null, 'Réservation annulée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Event] Erreur annulation: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de l\'annulation', 500);
        }
    }

    /**
     * Récupérer les événements de l'utilisateur connecté
     */
     public function myEvents()
    {
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $userOperations = Operation::where('user_id', $user->id)->get();
            $eventIds = $userOperations->pluck('event_id')->unique();

            $events = Event::with(['localisation', 'categorie', 'images', 'creator'])
                ->whereIn('id', $eventIds)
                ->orderBy('start_date')
                ->get();

            $createdEvents = collect();

            foreach ($events as $event) {
                $userOpsForEvent = $userOperations->where('event_id', $event->id);
                $isCreator = $userOpsForEvent->where('type_operation_id', 1)->isNotEmpty();
                $eventResource = new EventResource($event);
                $eventData = $eventResource->toArray(request());

                if ($isCreator) {
                    $createdEvents->push(array_merge($eventData, [
                        'is_creator' => true,
                        'user_role' => 'creator'
                    ]));
                }
            }

            return $this->successResponse([
                'created_events' => $createdEvents->values(),
                'total_created' => $createdEvents->count(),
            ], 'Événements de l\'utilisateur récupérés');

        } catch (\Exception $e) {
            Log::error('[Event] Erreur récupération événements utilisateur: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la récupération des événements', 500);
        }
    }

    /**
     * Notifier les followers d'un pro quand il crée un événement
     */
    protected function notifyFollowers($pro, $event)
    {
        try {
            $event->load(['localisation', 'categorie', 'creator']);
            $followers = $pro->followersWithNotifications()->get();

            if ($followers->isEmpty()) {
                Log::info('[Event] Aucun follower avec notifications', [
                    'pro_id' => $pro->id,
                    'event_id' => $event->id
                ]);
                return;
            }

            foreach ($followers as $follower) {
                $follower->notify(new NewEventNotification($event));
            }

            Log::info('[Event] Followers notifiés', [
                'pro_id' => $pro->id,
                'event_id' => $event->id,
                'followers_count' => $followers->count()
            ]);
        } catch (\Exception $e) {
            Log::error('[Event] Erreur notification followers', [
                'pro_id' => $pro->id ?? 'N/A',
                'event_id' => $event->id ?? 'N/A',
                'error' => $e->getMessage()
            ]);
        }
    }
}
