<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pin;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PinController extends Controller
{
    public function index()
    {
        $pins = Pin::with('usedBy:id,username')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('admin/pins/Index', [
            'pins' => $pins
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:500'],
        ]);

        $quantity = $validated['quantity'];
        $generated = 0;

        for ($i = 0; $i < $quantity; $i++) {
            // Generate a unique 6 digit alphanumeric pin
            do {
                // The user requested: "pin ta all time 6 digit hobe ok 6 digit a all time generate hobe".
                // Generating 6 digit numbers.
                $pinCode = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
            } while (Pin::where('pin_code', $pinCode)->exists());

            Pin::create([
                'pin_code' => $pinCode,
                'is_used' => false,
            ]);
            $generated++;
        }

        return redirect()->back()->with('success', "Successfully generated {$generated} secret pins.");
    }
}
