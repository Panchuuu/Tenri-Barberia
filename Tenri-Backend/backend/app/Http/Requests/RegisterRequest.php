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
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Este correo ya está en uso.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.'
        ];
    }
}