<?php

namespace App\Traits;

trait CookieTrait
{
    /**
     * Create a secure HTTP-only cookie using Laravel's helper
     */
    protected function createSecureCookie(
        string $name, 
        string $value, 
        int $minutes = 0, 
        string $sameSite = 'lax'
    ) {
        $isProduction = config('app.env') === 'production';
        
        return cookie(
            $name,
            $value,
            $minutes,
            '/',
            null, // domain
            $isProduction, // secure
            true, // httpOnly
            false,
            $sameSite
        );
    }

    /**
     * Create refresh token cookie (7 days)
     */
    protected function createRefreshTokenCookie(string $refreshToken)
    {
        return $this->createSecureCookie(
            'refresh_token',
            $refreshToken,
            7 * 24 * 60 // 7 days
        );
    }

    /**
     * Create expired cookie (for logout)
     */
    protected function createExpiredCookie(string $name)
    {
        return cookie($name, '', -1);
    }

    /**
     * Get cookie configuration
     */
    protected function getCookieConfig(): array
    {
        $isProduction = config('app.env') === 'production';
        
        return [
            'refresh_token' => [
                'name' => 'refresh_token',
                'duration' => 7 * 24 * 60 * 60,
                'httpOnly' => true,
                'secure' => $isProduction,
                'sameSite' => 'lax'
            ]
        ];
    }
}