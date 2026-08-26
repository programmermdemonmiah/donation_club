<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SequenceCounter extends Model
{
    protected $primaryKey = 'name';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['name', 'current_value'];
}
