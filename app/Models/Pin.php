<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pin extends Model
{
    use HasFactory;

    protected $fillable = [
        'pin_code',
        'is_used',
        'used_by_user_id',
    ];

    protected $casts = [
        'is_used' => 'boolean',
    ];

    public function usedBy()
    {
        return $this->belongsTo(User::class, 'used_by_user_id');
    }
}
