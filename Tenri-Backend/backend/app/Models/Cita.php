<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cita extends Model
{
    protected $fillable = ['cliente_id', 'barbero_id', 'servicio_id', 'fecha', 'hora', 'estado', 'barberia_id'];

    // Relación: Una cita pertenece a un Cliente (User)
    public function cliente() {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    // Relación: Una cita pertenece a un Barbero (User)
    public function barbero() {
        return $this->belongsTo(User::class, 'barbero_id');
    }

    // Relación: Una cita pertenece a un Servicio
    public function servicio() {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }
}