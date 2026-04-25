<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use Illuminate\Http\Request;

class ServicioController extends Controller
{
    public function index()
    {
        // Traemos todos los servicios de la base de datos
        return response()->json(Servicio::all());
    }
}