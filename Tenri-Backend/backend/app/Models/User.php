<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',
        'avatar',
        'barberia_id',
        'hora_inicio',
        'hora_fin',
        // 🎨 FASE 4A
        'bio',
        'especialidad',
        'promedio_calificacion',
        'total_resenas',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at'      => 'datetime',
        'password'               => 'hashed',
        'promedio_calificacion'  => 'decimal:2',
        'total_resenas'          => 'integer',
    ];

    // Siempre exponer avatar_url en la respuesta JSON
    protected $appends = ['avatar_url'];

    /**
     * Accessor: URL completa del avatar.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? asset('storage/' . $this->avatar) : null;
    }

    // ===== Relaciones =====

    public function barberia()
    {
        return $this->belongsTo(Barberia::class);
    }

    public function citasComoBarbero()
    {
        return $this->hasMany(Cita::class, 'barbero_id');
    }

    public function citasComoCliente()
    {
        return $this->hasMany(Cita::class, 'cliente_id');
    }

    public function bloqueos()
    {
        return $this->hasMany(BloqueoHorario::class, 'barbero_id');
    }
}
