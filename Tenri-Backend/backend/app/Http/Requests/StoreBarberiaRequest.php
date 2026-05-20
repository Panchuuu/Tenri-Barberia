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
            'nombre_barberia' => 'required|string|max:255',
            'color_principal' => 'required|string|max:20',
            'logo' => 'nullable|image|max:2048', // Máximo 2MB
            'admin_nombre' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:6'
        ];
    }

    public function messages(): array
    {
        return [
            'admin_email.unique' => 'Este correo ya está registrado en nuestro sistema.',
            'logo.max' => 'El logo no puede pesar más de 2MB.',
            'logo.image' => 'El archivo del logo debe ser una imagen válida.'
        ];
    }
}