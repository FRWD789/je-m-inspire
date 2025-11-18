<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class FollowProController extends Controller
{
    use ApiResponse;

    /**
     * Suivre ou ne plus suivre un professionnel (toggle)
     */
    public function toggle(Request $request, $proId)
    {
        try {
            $user = Auth::user();

            // Vérifier que l'utilisateur ne tente pas de se suivre lui-même
            if ($user->id == $proId) {
                return $this->errorResponse('Vous ne pouvez pas vous suivre vous-même', 400);
            }

            // Vérifier que le pro existe
            $pro = User::find($proId);
            if (!$pro) {
                return $this->notFoundResponse('Professionnel non trouvé');
            }

            // Toggle follow/unfollow
            $isFollowing = $user->isFollowing($proId);

            if ($isFollowing) {
                $user->unfollow($proId);
                Log::info("[Follow] Unfollow", ['user_id' => $user->id, 'pro_id' => $proId]);

                return $this->successResponse([
                    'is_following' => false,
                    'followers_count' => $pro->followers()->count()
                ], 'Vous ne suivez plus ce professionnel');
            } else {
                $user->follow($proId);
                Log::info("[Follow] Follow", ['user_id' => $user->id, 'pro_id' => $proId]);

                return $this->successResponse([
                    'is_following' => true,
                    'followers_count' => $pro->followers()->count()
                ], 'Vous suivez maintenant ce professionnel');
            }

        } catch (\Exception $e) {
            Log::error("[Follow] Erreur toggle", [
                'user_id' => $user->id,
                'pro_id' => $proId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Erreur lors du suivi', 500);
        }
    }

    /**
     * Vérifier si l'utilisateur suit un professionnel
     */
    public function check($proId)
    {
        try {
            $user = Auth::user();
            $pro = User::find($proId);

            if (!$pro) {
                return $this->notFoundResponse('Professionnel non trouvé');
            }

            return $this->successResponse([
                'is_following' => $user->isFollowing($proId),
                'followers_count' => $pro->followers()->count()
            ]);

        } catch (\Exception $e) {
            Log::error("[Follow] Erreur check", [
                'user_id' => $user->id,
                'pro_id' => $proId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Erreur lors de la vérification', 500);
        }
    }

    /**
     * Liste des professionnels suivis par l'utilisateur connecté
     */
    public function myFollowing()
    {
        try {
            $user = auth()->user();
            $following = $user->following()
                ->select('users.id', 'users.name', 'users.last_name', 'users.profile_picture', 'users.city')
                ->get();

            return $this->successResponse(['following' => $following]);

        } catch (\Exception $e) {
            Log::error("[Follow] Erreur myFollowing", [
                'user_id' => auth()->id(),
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Erreur lors de la récupération', 500);
        }
    }
}