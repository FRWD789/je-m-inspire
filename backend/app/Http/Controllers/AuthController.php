<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redis;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
class AuthController extends Controller
{


    public function register(Request $request){

        try {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);
    } catch (ValidationException $e) {
        return response()->json([
            'status' => 'error',
            'errors' => $e->errors(),
        ], 422);
    }

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);

    try {
        $accessToken = JWTAuth::fromUser($user);
        $refreshToken = JWTAuth::fromUser($user, ['exp' => 60]);
    } catch (JWTException $e) {
        return response()->json(['error' => 'Could not create token'], 500);

    }

    return response()->json([
        'token' => $accessToken,
        'user' => $user,
    ], 201)->cookie(
                        'refresh_token',        // cookie name
                        $refreshToken,          // cookie value (JWT string)
                        7*24*60,                // minutes → 7 days
                        '/',                   // path → defaults to "/"
                        null,                   // domain → defaults to current domain
                        false,                  // secure → ❌ (so works on HTTP localhost)
                        false                   // httpOnly → ❌ (so frontend JS can read it)
                );



    }
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            if (!$accessToken = JWTAuth::claims(['type' => 'access'])->attempt($credentials)) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }

            $refreshToken = $this->generateRefreshToken(JWTAuth::user());

        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        return response()->json([
            'token' => $accessToken,
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
            'refresh_token' => $refreshToken,
        ])->cookie(
            'refresh_token',
            $refreshToken,
            7*24*60,
            '/',
            null,
            false,
            true
        );
    }



    private function generateAccessToken(User $user): string
    {
        return JWTAuth::claims(['type' => 'access'])->fromUser($user);
    }

    private function generateRefreshToken(User $user): string
        {
            $jti = Str::uuid()->toString();

            $token = JWTAuth::claims([
                'type' => 'refresh',
                'jti'  => $jti,
                'exp'  => now()->addDays(7)->timestamp,
            ])->fromUser($user);

            Cache::put("refresh_token:$jti", $user->id, now()->addDays(7));

            return $token;
        }


     public function refresh(Request $request)
    {
        $refreshToken = $request->cookie('refresh_token');

        if (empty($refreshToken)) {
            return response()->json(['error' => 'No refresh token provided',"refreshToken"=>$refreshToken], 401);
        }



         try {
            $payload = JWTAuth::setToken($refreshToken)->getPayload();

            if ($payload->get('type') !== 'refresh') {
                return response()->json(['error' => 'Invalid token type'], 401);
            }

            $jti = $payload->get('jti');
            $userId = Cache::get("refresh_token:$jti");

            if (!$userId) {
                return response()->json(['error' => 'Refresh token revoked or reused'], 401);
            }
            $user = User::findOrFail($userId);


            Cache::forget("refresh_token:$jti");
            $newRefreshToken = $this->generateRefreshToken($user);
            $newAccessToken  = $this->generateAccessToken($user);

            return response()->json([
                "refreshToken"=>$refreshToken,
                'access_token' => $newAccessToken,
                'expires_in'   => JWTAuth::factory()->getTTL() * 60,
            ])->cookie(

                'refresh_token',
                $newRefreshToken,
                7*24*60,
                '/',
                null,
                false,   //secure // for dev env
                true    // httpOnly
            );


        } catch (JWTException $e) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Server error'], 500);
        }
    }



    public function logout(Request $request){
        try {
            // Grab refresh token from cookie
            $refreshToken = $request->cookie('refresh_token');

            if (!$refreshToken) {
                return response()->json(['error' => 'No refresh token provided'], 400);
            }
            $payload = JWTAuth::setToken($refreshToken)->getPayload();
            $jti = $payload->get('jti');
            Cache::forget("refresh_token:$jti");
            return response()
                ->json(['message' => 'Logged out successfully'])
                ->cookie('refresh_token', '', -1); // clear cookie

         } catch (\Exception $e) {
            return response()->json([
                'error' => 'Could not log out',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
