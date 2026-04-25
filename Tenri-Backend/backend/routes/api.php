<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServicioController;
use App\Http\Controllers\CitaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BarberoController;

// ==========================================
// 🔓 RUTAS PÚBLICAS (No requieren sesión)
// ==========================================
Route::get('/servicios', [ServicioController::class, 'index']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/barberos', [BarberoController::class, 'index']);
Route::post('/login', [AuthController::class, 'login']);

// ==========================================
// 🔒 RUTAS PROTEGIDAS (Requieren Token de Sanctum)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/citas', [CitaController::class, 'index']);
    Route::post('/citas', [CitaController::class, 'store']);

    Route::post('/barberos', [BarberoController::class, 'store']);
});