<?php

return [
    'default' => env('PAYMENT_GATEWAY', 'manual'),

    'gateways' => [
        'manual' => \App\Services\Payment\ManualGateway::class,
    ],
];
