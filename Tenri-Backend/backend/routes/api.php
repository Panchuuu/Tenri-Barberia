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
Route::get('/barberias', [App\Http\Controllers\BarberiaController::class, 'index']);
Route::get('/barberos/{id}/disponibilidad', [CitaController::class, 'disponibilidad']);
Route::post('/login', [AuthController::class, 'login']);

// ==========================================
// 🔒 RUTAS PROTEGIDAS (Requieren Token de Sanctum)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Ruta general para obtener los datos del usuario logueado (Cualquier autenticado)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ==========================================
    // 👑 RUTAS DE SUPERADMIN
    // ==========================================
    Route::middleware('role:superadmin')->group(function () {
        Route::post('/barberias', [App\Http\Controllers\BarberiaController::class, 'store']);
    });

    // ==========================================
    // ⚙️ RUTAS DE ADMIN (Dueño de la barbería)
    // ==========================================
    Route::middleware('role:admin')->group(function () {
        // Finanzas
        Route::get('/finanzas/hoy', [CitaController::class, 'resumenFinancieroHoy']);
        
        // Barberia
        Route::get('/mi-barberia', [\App\Http\Controllers\BarberiaController::class, 'miBarberia']);
        Route::put('/mi-barberia', [\App\Http\Controllers\BarberiaController::class, 'updateConfig']);

        // Gestión de Barberos
        Route::post('/barberos/asignar', [BarberoController::class, 'asignarRol']);
        Route::put('/barberos/{id}', [BarberoController::class, 'update']);
        Route::delete('/barberos/{id}', [App\Http\Controllers\BarberoController::class, 'destroy']);
        Route::post('/barberos', [BarberoController::class, 'store']);
        
        // Gestión de Servicios
        Route::post('/servicios', [ServicioController::class, 'store']);
        Route::put('/servicios/{id}', [ServicioController::class, 'update']);
        Route::delete('/servicios/{id}', [ServicioController::class, 'destroy']);
    });

    // ==========================================
    // 💈 RUTAS DE BARBERO Y ADMIN (Ambos pueden acceder)
    // ==========================================
    Route::middleware('role:admin,barbero')->group(function () {
        // Citas generales y de gestión
        Route::get('/citas', [CitaController::class, 'index']);
        Route::patch('/citas/{id}/estado', [CitaController::class, 'updateEstado']);
        Route::get('/barbero/citas', [CitaController::class, 'citasBarbero']);
    });

    // ==========================================
    // 👤 RUTAS COMUNES (Cliente, Barbero, Admin)
    // ==========================================
    // Todos los usuarios logueados pueden agendar, ver sus propias reservas y cancelar
    Route::post('/citas', [CitaController::class, 'store']);
    Route::get('/mis-reservas', [App\Http\Controllers\CitaController::class, 'misReservas']);
    Route::patch('/mis-citas/{id}/cancelar', [CitaController::class, 'cancelarMiCita']);
    Route::post('/mis-citas/{id}/calificar', [CitaController::class, 'calificar']);
});