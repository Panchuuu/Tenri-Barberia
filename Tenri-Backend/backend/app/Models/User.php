<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// 👇 AQUÍ ESTÁ EL CAMBIO: Agregamos las nuevas columnas permitidas
#[Fillable(['name', 'email', 'password', 'rol', 'avatar', 'hora_inicio', 'hora_fin', 'barberia_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;
    
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected $appends = ['promedio_calificacion']; 

    // Relación: Un usuario (barbero) tiene muchas citas como trabajador
    public function citasAtendidas()
    {
        return $this->hasMany(Cita::class, 'barbero_id');
    }

    // Calcula el promedio de estrellas automáticamente
    public function getPromedioCalificacionAttribute()
    {
        // Solo calculamos el promedio de citas que tienen calificación
        $promedio = $this->citasAtendidas()->whereNotNull('calificacion')->avg('calificacion');
        
        // Lo redondeamos a 1 decimal (ej. 4.8). Si no tiene reseñas, devolvemos 0
        return $promedio ? round($promedio, 1) : 0; 
    }
}