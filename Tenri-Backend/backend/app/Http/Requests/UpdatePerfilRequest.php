<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePerfilRequest extends FormRequest
{
    /**
     * Todos los usuarios autenticados pueden actualizar su perfil.
     */
    public function authorize(): bool { return true; }

    /**
     * Reglas de validación comentadas.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $this->user()->id,
            'password' => 'nullable|min:6|confirmed',
            // 👇 Nueva regla para la foto
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', 
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Este correo electrónico ya está registrado por otro usuario.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'password.min' => 'La nueva contraseña debe tener al menos 6 caracteres.',
        ];
    }
}