<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'precio', 'duracion_minutos', 'descripcion', 'imagen', 'barberia_id'];

    // 1. Le decimos a Laravel que SIEMPRE envíe este campo inventado llamado 'imagen_url'
    protected $appends = ['imagen_url'];

    // 2. Aquí calculamos cómo se construye esa URL
    public function getImagenUrlAttribute()
    {
        // Si el servicio tiene imagen, le pegamos la ruta de tu servidor local
        if ($this->imagen) {
            return asset('storage/' . $this->imagen);
        }
        // Si no tiene, devolvemos null para que React ponga un ícono por defecto
        return null; 
    }

    public function barberia() {
        return $this->belongsTo(Barberia::class);
    }
}