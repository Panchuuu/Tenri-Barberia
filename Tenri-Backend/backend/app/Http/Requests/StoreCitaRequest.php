<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCitaRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a hacer esta petición.
     */
    public function authorize(): bool
    {
        return true; 
    }

    /**
     * Define las reglas de validación.
     */
    public function rules(): array
    {
        return [
            'servicio_id' => 'required|exists:servicios,id',
            'barbero_id' => 'required|exists:users,id',
            'fecha' => 'required|date',
            'hora' => 'required'
        ];
    }

    /**
     * Mensajes de error en español para que React los muestre claritos.
     */
    public function messages(): array
    {
        return [
            'servicio_id.required' => 'Debes seleccionar un servicio.',
            'barbero_id.required' => 'Debes seleccionar un Barbero.',
            'fecha.required' => 'La fecha de la reserva es obligatoria.',
            'hora.required' => 'La hora de la reserva es obligatoria.'
        ];
    }
}