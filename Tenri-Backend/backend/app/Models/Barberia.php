<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barberia extends Model
{
    use HasFactory;

    // 1. Agregamos 'logo' a los campos permitidos
    protected $fillable = ['nombre', 'slug', 'color_principal', 'logo'];

    // 2. Le decimos a Laravel que SIEMPRE envíe este campo inventado llamado 'logo_url'
    protected $appends = ['logo_url'];

    // 3. Calculamos la URL mágica
    public function getLogoUrlAttribute()
    {
        if ($this->logo) {
            return asset('storage/' . $this->logo);
        }
        return null;
    }

    public function usuarios() {
        return $this->hasMany(User::class);
    }
}