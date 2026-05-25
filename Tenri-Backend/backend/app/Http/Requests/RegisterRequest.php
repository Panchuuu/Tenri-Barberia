<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            // 🔒 FIX FASE 1: subimos mínimo a 8 caracteres
            'password' => 'required|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'        => 'Este correo ya está en uso.',
            'password.min'        => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed'  => 'Las contraseñas no coinciden.',
        ];
    }
}
