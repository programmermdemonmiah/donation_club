<?php

namespace App\Enums;

enum UserRankStatus: string
{
    case Active = 'active';
    case Superseded = 'superseded';
}
