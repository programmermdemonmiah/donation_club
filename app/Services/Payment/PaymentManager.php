<?php

namespace App\Services\Payment;

use InvalidArgumentException;

/**
 * Resolves gateways by identifier. Register additional gateways here as they
 * are added — controllers never instantiate gateways directly.
 */
class PaymentManager
{
    /** @var array<string, PaymentGatewayInterface> */
    private array $gateways = [];

    public function __construct()
    {
        foreach (config('payments.gateways', []) as $identifier => $class) {
            $gateway = app($class);
            $this->gateways[$gateway->identifier()] = $gateway;
        }
    }

    public function gateway(string $identifier): PaymentGatewayInterface
    {
        if (! isset($this->gateways[$identifier])) {
            throw new InvalidArgumentException("Unknown payment gateway [{$identifier}].");
        }

        return $this->gateways[$identifier];
    }

    public function defaultGateway(): PaymentGatewayInterface
    {
        return $this->gateway(config('payments.default', 'manual'));
    }

    /**
     * @return array<string, string> identifier => label
     */
    public function available(): array
    {
        return collect($this->gateways)
            ->map(fn (PaymentGatewayInterface $g) => $g->label())
            ->all();
    }
}
