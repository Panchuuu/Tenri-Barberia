<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash; // Para encriptar la contraseña

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // Creamos al Administrador
        User::create([
            'name' => 'Admin Tenri',
            'email' => 'admin@tenri.cl',
            'password' => Hash::make('admin123'), // Siempre encriptada
            'rol' => 'superadmin'
        ]);

        // Creamos a un Barbero de prueba
        User::create([
            'name' => 'Juan el Barbero',
            'email' => 'juan@tenri.cl',
            'password' => Hash::make('barbero123'),
            'rol' => 'barbero'
        ]);
    }
}