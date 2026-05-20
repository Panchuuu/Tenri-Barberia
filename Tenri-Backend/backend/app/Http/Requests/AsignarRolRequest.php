<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AsignarRolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Validamos que el correo venga, sea un email válido y EXISTA en la tabla users
            'email' => 'required|email|exists:users,email',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i'
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Debes ingresar el correo del usuario.',
            'email.exists' => 'No encontramos ningún usuario registrado con este correo.',
        ];
    }
}