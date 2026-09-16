<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsernameAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_taken_username_is_not_available(): void
    {
        $this->createUser(['username' => 'takenname']);

        $this->getJson('/api/username-availability?username=takenname')
            ->assertOk()
            ->assertJson(['status' => 'taken']);
    }

    public function test_username_check_ignores_letter_case(): void
    {
        $this->createUser(['username' => 'TakenName']);

        $this->getJson('/api/username-availability?username=takenname')
            ->assertOk()
            ->assertJson(['status' => 'taken']);
    }

    public function test_unused_username_is_available(): void
    {
        $this->getJson('/api/username-availability?username=freshname')
            ->assertOk()
            ->assertJson(['status' => 'available']);
    }

    public function test_invalid_username_is_rejected_before_availability(): void
    {
        $this->getJson('/api/username-availability?username='.urlencode('bad name'))
            ->assertOk()
            ->assertJson(['status' => 'invalid']);
    }
}
