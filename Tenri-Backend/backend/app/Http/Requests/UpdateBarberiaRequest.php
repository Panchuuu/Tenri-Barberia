<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBarberiaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // El middleware role:superadmin ya filtra.
    }

    public function rules(): array
    {
        $barberiaId = $this->route('id');

        return [
            // unique ignora la propia barbería para permitir guardar
            // sin cambiar el nombre (mismo patrón que UpdatePerfilRequest).
            'nombre'           => [
                'required', 'string', 'min:3', 'max:60',
                Rule::unique('barberias', 'nombre')->ignore($barberiaId),
            ],
            'color_principal'  => 'required|string|max:20',
            // Logo opcional al editar (si no viene, se conserva el actual).
            'logo'             => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la barbería es obligatorio.',
            'nombre.min'      => 'El nombre debe tener al menos 3 caracteres.',
            'nombre.max'      => 'El nombre no puede superar los 60 caracteres.',
            'nombre.unique'   => 'Ya existe una barbería con ese nombre. Elige otro.',
            'color_principal.required' => 'El color principal es obligatorio.',
            'logo.image'      => 'El logo debe ser una imagen válida.',
            'logo.mimes'      => 'El logo debe ser JPG, PNG o WebP.',
            'logo.max'        => 'El logo no puede pesar más de 2 MB.',
        ];
    }
}
