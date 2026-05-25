<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'precio', 'duracion_minutos', 'descripcion', 'imagen', 'barberia_id'];

    // 👇 SIEMPRE enviamos estos campos calculados al frontend
    protected $appends = ['imagen_url', 'duracion'];

    /**
     * 🔧 FIX FASE 1:
     * El frontend usa "servicio.duracion" en TODAS partes,
     * pero la columna real se llama "duracion_minutos".
     *
     * Este accessor crea un alias virtual para mantener compatibilidad
     * sin tener que renombrar la columna en la base de datos.
     */
    public function getDuracionAttribute(): int
    {
        return (int) ($this->duracion_minutos ?? 30);
    }

    /**
     * Genera la URL completa de la imagen del servicio.
     */
    public function getImagenUrlAttribute(): ?string
    {
        if ($this->imagen) {
            return asset('storage/' . $this->imagen);
        }
        return null;
    }

    public function barberia()
    {
        return $this->belongsTo(Barberia::class);
    }
}
