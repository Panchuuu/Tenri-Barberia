<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBarberoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => 'nullable|string|max:255',
            'hora_inicio'  => 'nullable|date_format:H:i',
            'hora_fin'     => 'nullable|date_format:H:i',
            // 🎨 FASE 4A
            'bio'          => 'nullable|string|max:500',
            'especialidad' => 'nullable|string|max:100',
            'avatar'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }
}
