<?php

namespace App\Console\Commands;

use App\Services\Return\ReturnService;
use Illuminate\Console\Command;

class MarkEligibleReturns extends Command
{
    protected $signature = 'returns:mark-eligible';

    protected $description = 'Mark pending returns as eligible for members who satisfy all configured rules (no automatic payout)';

    public function handle(ReturnService $returns): int
    {
        if (! \App\Models\ReturnRule::query()->value('enabled')) {
            $this->line('Return module is disabled — nothing to do.');

            return self::SUCCESS;
        }

        $count = $returns->markEligible();

        $this->info("Marked {$count} return(s) as eligible.");

        return self::SUCCESS;
    }
}
