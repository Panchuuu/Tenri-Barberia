<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBarberiaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 🔧 FIX #8 (PDF): el nombre tenía max:255 (irreal en UI).
            // Bajamos a max:60 con min:3 para evitar nombres absurdos.
            'nombre_barberia' => 'required|string|min:3|max:60',

            // Color HEX típico (#RRGGBB = 7 chars). Dejamos 20 por
            // tolerancia a formatos extendidos.
            'color_principal' => 'required|string|max:20',

            // Logo: imagen real, máx 2MB.
            'logo'            => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',

            // Admin que se crea junto con la barbería.
            'admin_nombre'    => 'required|string|min:2|max:80',

            // 🎯 Alineado con RegisterRequest del Pack 1:
            //    email validation completa + maxlength.
            //    "spoof" omitido (requiere ext-intl, ver deuda técnica E).
            'admin_email'     => 'required|string|email:rfc,dns,filter|max:120|unique:users,email',

            // 🎯 Alineado con RegisterRequest del Pack 1:
            //    min:8 + letters + numbers (política única en la app).
            'admin_password'  => ['required', 'string', 'min:8', 'regex:/[A-Za-z]/', 'regex:/[0-9]/'],
        ];
    }

    public function messages(): array
    {
        return [
            // Nombre de la barbería
            'nombre_barberia.required' => 'El nombre de la barbería es obligatorio.',
            'nombre_barberia.min'      => 'El nombre debe tener al menos 3 caracteres.',
            'nombre_barberia.max'      => 'El nombre no puede superar los 60 caracteres.',

            // Color
            'color_principal.required' => 'El color principal es obligatorio.',

            // Logo
            'logo.image' => 'El logo debe ser una imagen válida.',
            'logo.mimes' => 'El logo debe ser JPG, PNG o WebP.',
            'logo.max'   => 'El logo no puede pesar más de 2 MB.',

            // Admin nombre
            'admin_nombre.required' => 'El nombre del administrador es obligatorio.',
            'admin_nombre.min'      => 'El nombre del administrador debe tener al menos 2 caracteres.',
            'admin_nombre.max'      => 'El nombre del administrador no puede superar los 80 caracteres.',

            // Admin email
            'admin_email.required' => 'El correo del administrador es obligatorio.',
            'admin_email.email'    => 'El correo no es válido. Verifica el dominio (ej: usuario@gmail.com).',
            'admin_email.max'      => 'El correo no puede superar los 120 caracteres.',
            'admin_email.unique'   => 'Ya existe un usuario con este correo.',

            // Admin password
            'admin_password.required' => 'La contraseña del administrador es obligatoria.',
            'admin_password.min'      => 'La contraseña debe tener al menos 8 caracteres.',
            'admin_password.regex'    => 'La contraseña debe contener letras y números.',
        ];
    }
}