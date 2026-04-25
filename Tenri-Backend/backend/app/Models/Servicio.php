<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    // Definimos qué campos se pueden llenar masivamente
    protected $fillable = [
        'nombre',
        'descripcion',
        'precio',
        'duracion_minutos'
    ];
    
    // Laravel por defecto busca la tabla "servicios" (en plural),
    // lo cual coincide con nuestra migración.
}