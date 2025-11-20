<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'pro_plus_price_id' => env('PRO_PLUS_PLAN_ID'), // price_1S9A0Z3JJu344kSQ63Nnyivb
    ],

    'paypal' => [
        'client_id' => env('PAYPAL_MODE') === 'live'
            ? env('PAYPAL_LIVE_CLIENT_ID')
            : env('PAYPAL_SANDBOX_CLIENT_ID'),
        'secret' => env('PAYPAL_MODE') === 'live'
            ? env('PAYPAL_LIVE_CLIENT_SECRET')
            : env('PAYPAL_SANDBOX_CLIENT_SECRET'),
        'mode' => env('PAYPAL_MODE', 'sandbox'),
        'currency' => env('PAYPAL_CURRENCY', 'CAD'),
        'pro_plus_plan_id' => env('PRO_PLUS_PLAN_ID'), // P-6H8771292B5725726NDG3YXQ
    ],
    'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],

];
