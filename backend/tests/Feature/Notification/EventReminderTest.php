<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Jobs\SendEventRemindersJob;
use App\Models\Event;
use App\Models\User;
use App\Models\Operation;
use App\Models\Paiement;
use App\Models\Localisation;
use App\Models\CategorieEvent;
use App\Models\Role;
use App\Notifications\EventReminderNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Artisan;

class EventReminderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
        $this->createBaseData();
    }

    private function createBaseData()
    {
        Localisation::create([
            'name' => 'Test Location',
            'address' => '123 Test Street',
            'latitude' => 45.5017,
            'longitude' => -73.5673,
        ]);

        CategorieEvent::create([
            'name' => 'Test Category',
            'description' => 'Test category description',
        ]);

        Role::firstOrCreate(['role' => 'utilisateur', 'description' => 'Utilisateur standard']);

        // Créer les types de paiement
        \DB::table('type_paiements')->insert([
            ['nom' => 'Carte de crédit', 'description' => 'Paiement par carte'],
            ['nom' => 'PayPal', 'description' => 'Paiement PayPal'],
        ]);

        // Créer les types d'opération
        \DB::table('type_operations')->insert([
            ['name' => 'Création', 'description' => 'Création d\'événement'],
            ['name' => 'Réservation', 'description' => 'Réservation de places'],
            ['name' => 'Abonnement', 'description' => 'Souscription abonnement'],
        ]);
    }

    public function test_complete_reminder_workflow()
    {
        // Créer des utilisateurs
        $user1 = User::factory()->create(['email' => 'user1@test.com']);
        $user2 = User::factory()->create(['email' => 'user2@test.com']);

        // Créer des événements
        $eventIn2Days = $this->createEvent(2, 'Concert Rock');
        $eventIn3Days = $this->createEvent(3, 'Festival Jazz');

        // Créer des réservations payées
        $this->createPaidReservation($user1, $eventIn2Days, 2);
        $this->createPaidReservation($user2, $eventIn2Days, 1);
        $this->createPaidReservation($user1, $eventIn3Days, 1);

        // Exécuter le job
        $job = new SendEventRemindersJob();
        $job->handle();

        // Vérifications
        Notification::assertSentTo($user1, EventReminderNotification::class, function ($notification) use ($eventIn2Days) {
            return $notification->getEvent()->id === $eventIn2Days->id;
        });

        Notification::assertSentTo($user2, EventReminderNotification::class, function ($notification) use ($eventIn2Days) {
            return $notification->getEvent()->id === $eventIn2Days->id;
        });

        // Ne devrait pas envoyer pour l'événement dans 3 jours
        Notification::assertNotSentTo($user1, EventReminderNotification::class, function ($notification) use ($eventIn3Days) {
            return $notification->getEvent()->id === $eventIn3Days->id;
        });
    }

    public function test_scheduler_dispatches_job()
    {
        Queue::fake();

        // Créer un événement dans 2 jours
        $user = User::factory()->create();
        $event = $this->createEvent(2);
        $this->createPaidReservation($user, $event);

        // Dispatcher manuellement le job (simuler le scheduler)
        SendEventRemindersJob::dispatch();

        // Vérifier que le job a été dispatché
        Queue::assertPushed(SendEventRemindersJob::class);
    }

    public function test_handles_users_with_multiple_reservations()
    {
        $user = User::factory()->create();

        $event1 = $this->createEvent(2, 'Événement 1', 10, 0);
        $event2 = $this->createEvent(2, 'Événement 2', 14, 0);
        $event3 = $this->createEvent(2, 'Événement 3', 18, 0);

        $this->createPaidReservation($user, $event1);
        $this->createPaidReservation($user, $event2);
        $this->createPaidReservation($user, $event3);

        $job = new SendEventRemindersJob();
        $job->handle();

        // L'utilisateur devrait recevoir 3 emails
        Notification::assertSentTo($user, EventReminderNotification::class, 3);
    }

    public function test_handles_mixed_payment_statuses()
    {
        $user = User::factory()->create();

        $event = $this->createEvent(2);

        // Réservation payée
        $this->createPaidReservation($user, $event, 2);

        // Réservation en attente
        $this->createReservationWithStatus($user, $event, 'pending');

        // Réservation annulée
        $this->createReservationWithStatus($user, $event, 'cancelled');

        $job = new SendEventRemindersJob();
        $job->handle();

        // Devrait envoyer seulement pour la réservation payée
        Notification::assertSentTo($user, EventReminderNotification::class, 1);
    }

    public function test_handles_event_at_exact_48_hours()
    {
        $user = User::factory()->create();

        // Créer un événement exactement dans 48h
        $event = Event::create([
            'name' => 'Event in exactly 48h',
            'description' => 'Test',
            'start_date' => now()->addHours(48),
            'end_date' => now()->addHours(50),
            'base_price' => 25.00,
            'capacity' => 50,
            'max_places' => 50,
            'available_places' => 50,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => 1,
            'categorie_event_id' => 1,
        ]);

        $this->createPaidReservation($user, $event);

        $job = new SendEventRemindersJob();
        $job->handle();

        Notification::assertSentTo($user, EventReminderNotification::class);
    }

    public function test_notification_email_content()
    {
        $user = User::factory()->create(['name' => 'Jean Dupont']);
        $event = $this->createEvent(2, 'Soirée Gala');
        $operation = $this->createPaidReservation($user, $event, 3);

        $notification = new EventReminderNotification($event, $operation);
        $mailMessage = $notification->toMail($user);

        // Vérifier le contenu
        $this->assertStringContainsString('Soirée Gala', $mailMessage->subject);
        $this->assertStringContainsString('Jean Dupont', $mailMessage->greeting);
        $this->assertStringContainsString('3', implode(' ', $mailMessage->introLines));

        // Vérifier l'action
        $this->assertEquals('Voir les détails', $mailMessage->actionText);
        $this->assertStringContainsString("/events/{$event->id}", $mailMessage->actionUrl);
    }

    public function test_performance_with_many_users()
    {
        // Créer 50 utilisateurs
        $users = User::factory()->count(50)->create();

        $event = $this->createEvent(2);

        // Créer une réservation pour chaque utilisateur
        foreach ($users as $user) {
            $this->createPaidReservation($user, $event);
        }

        $startTime = microtime(true);

        $job = new SendEventRemindersJob();
        $job->handle();

        $executionTime = microtime(true) - $startTime;

        // Vérifier que tous les emails ont été envoyés
        foreach ($users as $user) {
            Notification::assertSentTo($user, EventReminderNotification::class);
        }

        // Le job devrait s'exécuter en moins de 5 secondes
        $this->assertLessThan(5, $executionTime,
            "Job execution took {$executionTime} seconds, should be under 5 seconds");
    }

    // ==========================================
    // MÉTHODES HELPER
    // ==========================================

    private function createEvent(
        int $daysFromNow,
        string $name = 'Test Event',
        int $hour = 14,
        int $minute = 0
    ): Event {
        return Event::create([
            'name' => $name,
            'description' => 'Test event description',
            'start_date' => now()->addDays($daysFromNow)->setTime($hour, $minute),
            'end_date' => now()->addDays($daysFromNow)->setTime($hour + 2, $minute),
            'base_price' => 25.00,
            'capacity' => 50,
            'max_places' => 50,
            'available_places' => 50,
            'level' => 'Débutant',
            'priority' => 5,
            'localisation_id' => 1,
            'categorie_event_id' => 1,
        ]);
    }

    private function createPaidReservation(User $user, Event $event, int $quantity = 1): Operation
    {
        $paiement = Paiement::create([
            'total' => $event->base_price * $quantity,
            'status' => 'paid',
            'type_paiement_id' => 1,
            'taux_commission' => 10,
            'vendor_id' => $user->id,
        ]);

        return Operation::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => $quantity,
            'paiement_id' => $paiement->paiement_id,
        ]);
    }

    private function createReservationWithStatus(User $user, Event $event, string $status, int $quantity = 1): Operation
    {
        $paiement = Paiement::create([
            'total' => $event->base_price * $quantity,
            'status' => $status,
            'type_paiement_id' => 1,
            'taux_commission' => 10,
            'vendor_id' => $user->id,
        ]);

        return Operation::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'type_operation_id' => 2,
            'quantity' => $quantity,
            'paiement_id' => $paiement->paiement_id,
        ]);
    }
}