<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Paiement;
use App\Observers\PaiementObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paiement::observe(PaiementObserver::class);
    }
}
