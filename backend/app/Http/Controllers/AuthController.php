<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
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
            if (!$accessToken = JWTAuth::claims(['type' => 'access'])->attempt($credentials)) 
            {
            return response()->json(['error' => 'Invalid credentials'], 401);
            }

            $refreshJti = Str::uuid();

            $refreshToken = JWTAuth::claims([
                                    'jti'  => $refreshJti,
                                    'exp' => now()->addSeconds(60)->timestamp, // refresh token valid 7 days
                                    'type' => 'refresh' // custom claim
                                ])->fromUser(JWTAuth::user());

            Cache::put("refresh_token:$refreshJti", JWTAuth::user()->id, now()->addDays(7));

                    
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        return response()->json([
            'token' => JWTAuth::setToken($accessToken)->getPayload(),
            'expires_in' => JWTAuth::factory()->getTTL()*60,
            "refresh_token"=> JWTAuth::setToken($refreshToken)->getPayload(),
 
        ])->cookie(
                        'refresh_token',        // cookie name
                        $refreshToken,          // cookie value (JWT string)
                        7*24*60,                // minutes → 7 days
                        '/',                   // path → defaults to "/"
                        null,                   // domain → defaults to current domain
                        false,                  // secure → ❌ (so works on HTTP localhost)
                        true                   // httpOnly → ❌ (so frontend JS can read it)
                );

    }

     public function refresh(Request $request)
    {
        $refreshToken = $request->cookie('refresh_token');
         // Check token type

       

        if (!$refreshToken) {
            return response()->json(['error' => 'No refresh token'], 401);
        }
        $payload = JWTAuth::setToken($refreshToken)->getPayload();
        
        if ($payload->get('type') !== 'refresh') {
            return response()->json(['error' => 'Invalid token type'], 401);
        }

        try {
            $jti = $payload->get('jti');
            $userId = Cache::get("refresh_token:$jti");
            if (!$userId) return response()->json(['error'=>'Refresh token revoked or expired'], 401);
            $user = User::findOrFail($userId);
            $user = JWTAuth::setToken($refreshToken)->authenticate();

            Cache::forget("refresh_token:$jti");
            $newJti = Str::uuid();
            $newRefreshToken = JWTAuth::claims([
                                                    'type' => 'refresh',
                                                    'jti'  => $newJti,
                                                    'exp'  => now()->addDays(7)->timestamp
                                                ])->fromUser($user);
            Cache::put("refresh_token:$newJti", $user->id, now()->addDays(7));
            // Issue new tokens
            $newAccessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);
            $newRefreshToken = JWTAuth::claims([
                'exp' => now()->addDays(7)->timestamp,
                'type' => 'refresh'
            ])->fromUser($user);
           
        } catch (JWTException $e) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        }

        return response()->json([
            'access_token' => $newAccessToken,
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
        ]);
    //     ->cookie(
    //         'refresh_token',        // cookie name
    //         $refreshToken,          // cookie value (JWT string)
    //         7*24*60,                // minutes → 7 days
    //         '/',                   // path → defaults to "/"
    //         null,                   // domain → defaults to current domain
    //         false,                  // secure → ❌ (so works on HTTP localhost)
    //         false                   // httpOnly → ❌ (so frontend JS can read it)
    // );
    }
}
