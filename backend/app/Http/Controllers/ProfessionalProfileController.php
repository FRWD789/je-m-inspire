<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class ProfessionalProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
         try {
            $professional = User::whereHas('roles', function ($q) {
                $q->where('role', 'professionnel');
            })
            ->where('id', $id)
           
            ->firstOrFail();

            // Calculate statistics
            $stats = $this->calculateUserStats($professional);

            $profileData = new UserResource($professional);
        
            return response()->json([
                'success' => true,
                'data' => $profileData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Profil professionnel non trouvé'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
     private function calculateUserStats(User $user): array
    {
        $events = $user->events ?? collect();
        
        $totalEvents = $events->count();
        $completedEvents = $events->where('status', 'completed')->count();
        $completionRate = $totalEvents > 0 ? round(($completedEvents / $totalEvents) * 100) : 0;

        // Calculate average rating from events
        $avgRating = $events->avg('avg_rating') ?? 4.5;
        $reviewsCount = $events->sum('reviews_count') ?? 0;

        return [
            'total_events' => $totalEvents,
            'avg_rating' => round($avgRating, 1),
            'reviews_count' => $reviewsCount,
            'completion_rate' => $completionRate,
        ];
    }
}
