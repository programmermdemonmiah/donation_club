<?php

namespace App\Models;

use App\Enums\SettingType;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group'];

    protected function casts(): array
    {
        return [
            'type' => SettingType::class,
        ];
    }
}
