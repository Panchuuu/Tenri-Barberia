<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloqueoHorario extends Model
{
    use HasFactory;

    protected $table = 'bloqueos_horario';

    protected $fillable = [
        'barbero_id',
        'barberia_id',
        'fecha_inicio',
        'fecha_fin',
        'motivo',
        'descripcion',
    ];

    protected $casts = [
        'fecha_inicio' => 'date:Y-m-d',
        'fecha_fin'    => 'date:Y-m-d',
    ];

    public function barbero()
    {
        return $this->belongsTo(User::class, 'barbero_id');
    }

    public function barberia()
    {
        return $this->belongsTo(Barberia::class);
    }

    /**
     * Scope: bloqueos que aplican en una fecha específica.
     */
    public function scopeActivoEnFecha($query, $fecha)
    {
        return $query->where('fecha_inicio', '<=', $fecha)
                     ->where('fecha_fin',    '>=', $fecha);
    }
}
