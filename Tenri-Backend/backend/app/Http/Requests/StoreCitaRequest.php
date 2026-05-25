<?php

namespace App\Http\Requests;

use App\Models\Servicio;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class StoreCitaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'servicio_id' => 'required|exists:servicios,id',
            // El barbero debe existir Y tener rol "barbero"
            'barbero_id'  => [
                'required',
                Rule::exists('users', 'id')->where(fn ($q) => $q->where('rol', 'barbero')),
            ],
            // Fecha real, no en el pasado
            'fecha'       => 'required|date|after_or_equal:today',
            'hora'        => 'required|date_format:H:i',
        ];
    }

    /**
     * 🔒 FIX FASE 1:
     * Validación extra: el barbero seleccionado DEBE pertenecer
     * a la misma barbería que el servicio reservado.
     * Esto evita reservas inconsistentes entre tenants.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (!$this->servicio_id || !$this->barbero_id) {
                return;
            }

            $servicio = Servicio::find($this->servicio_id);
            $barbero  = User::find($this->barbero_id);

            if (!$servicio || !$barbero) {
                return;
            }

            if ($servicio->barberia_id !== $barbero->barberia_id) {
                $validator->errors()->add(
                    'barbero_id',
                    'El barbero seleccionado no pertenece a la misma barbería que el servicio.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'servicio_id.required' => 'Debes seleccionar un servicio.',
            'barbero_id.required'  => 'Debes seleccionar un barbero.',
            'barbero_id.exists'    => 'El barbero seleccionado no es válido.',
            'fecha.required'       => 'La fecha de la reserva es obligatoria.',
            'fecha.after_or_equal' => 'La fecha no puede ser anterior a hoy.',
            'hora.required'        => 'La hora de la reserva es obligatoria.',
            'hora.date_format'     => 'La hora debe tener formato HH:MM.',
        ];
    }
}
