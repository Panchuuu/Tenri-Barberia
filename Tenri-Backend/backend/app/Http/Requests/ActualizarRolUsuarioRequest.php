<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarRolUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // El middleware role:superadmin ya filtra.
    }

    public function rules(): array
    {
        return [
            'rol' => 'required|in:superadmin,admin,barbero,cliente',
        ];
    }

    public function messages(): array
    {
        return [
            'rol.required' => 'El rol es obligatorio.',
            'rol.in'       => 'El rol debe ser superadmin, admin, barbero o cliente.',
        ];
    }
}
