<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:80|min:2',
            // ============================================================
            // 🔒 FIX #1: validación de email completa
            // ============================================================
            // Antes: 'email' a secas → 'fgaete@tenricl' pasaba la validación
            //        porque Laravel SOLO chequeaba sintaxis básica RFC.
            //
            // Ahora usamos las reglas FULL de Laravel:
            //  - rfc:       sintaxis RFC 5321
            //  - dns:       el dominio DEBE tener registros DNS reales
            //  - filter:    PHP filter_var() (capa extra)
            // NOTA: se omite 'spoof' porque requiere la extensión PHP intl
            //       (no disponible en el entorno). 'dns' ya rechaza dominios
            //       inexistentes como "tenricl". Coincide con BarberoController.
            // ============================================================
            'email' => [
                'required',
                'string',
                'email:rfc,dns,filter',
                'max:120',
                'unique:users,email',
            ],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'       => 'El nombre es obligatorio.',
            'name.min'            => 'El nombre debe tener al menos 2 caracteres.',
            'name.max'            => 'El nombre no puede superar los 80 caracteres.',
            'email.required'      => 'El correo es obligatorio.',
            'email.email'         => 'El correo no es válido. Verifica el dominio (ej: usuario@gmail.com).',
            'email.max'           => 'El correo no puede superar los 120 caracteres.',
            'email.unique'        => 'Este correo ya está en uso.',
            'password.required'   => 'La contraseña es obligatoria.',
            'password.confirmed'  => 'Las contraseñas no coinciden.',
            'password.min'        => 'La contraseña debe tener al menos 8 caracteres.',
            'password.letters'    => 'La contraseña debe contener al menos una letra.',
            'password.numbers'    => 'La contraseña debe contener al menos un número.',
        ];
    }
}
