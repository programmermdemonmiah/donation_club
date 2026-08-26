<?php

namespace App\Console\Commands;

use App\Services\Rank\RankService;
use Illuminate\Console\Command;

class EvaluateRanks extends Command
{
    protected $signature = 'ranks:evaluate';

    protected $description = 'Evaluate rank requirements for all active members and promote eligible ones';

    public function handle(RankService $ranks): int
    {
        $promoted = $ranks->evaluateAll();

        $this->info("Rank evaluation complete. Promoted {$promoted} member(s).");

        return self::SUCCESS;
    }
}
