<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AsignarRolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 🔧 FIX #9 (PDF): "Al ingresar el correo de un barbero deja
            // poner una cantidad infinita de valores y el backend no lo
            // soporta y arroja error sin mencionar cual es el problema."
            //
            // Alineado con RegisterRequest del Pack 1:
            //   rfc + dns + filter + max:120 + exists.
            //   "spoof" omitido (requiere ext-intl, ver deuda técnica E).
            'email'       => 'required|string|email:rfc,dns,filter|max:120|exists:users,email',

            // Horarios opcionales en el request (con defaults en el controller).
            // El cross-field check va en withValidator().
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin'    => 'nullable|date_format:H:i',
        ];
    }

    /**
     * 🔧 FIX #10 (PDF): valida que hora_fin sea posterior a hora_inicio
     * cuando ambas se envían en el request.
     *
     * A diferencia de UpdateBarberoRequest (B.3), aquí NO hacemos lookup
     * a la BD porque este Request se usa para ASIGNAR rol a un usuario
     * existente — no estamos actualizando horarios de un barbero ya
     * configurado, los estamos asignando desde cero.
     *
     * Si el cliente envía solo una hora, el controller usará defaults
     * ("10:00" / "19:00") y el sistema queda consistente sin necesidad
     * de validación cruzada.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $inicio = $this->input('hora_inicio');
            $fin    = $this->input('hora_fin');

            // Solo validamos cuando AMBAS están presentes en el request.
            if (!$inicio || !$fin) {
                return;
            }

            // Normalización defensiva (por si vienen con segundos "HH:MM:SS").
            $inicioNorm = substr((string) $inicio, 0, 5);
            $finNorm    = substr((string) $fin, 0, 5);

            // Comparación lexicográfica de strings zero-padded HH:MM.
            if ($finNorm <= $inicioNorm) {
                $validator->errors()->add(
                    'hora_fin',
                    "La hora de salida ({$finNorm}) debe ser posterior a la hora de entrada ({$inicioNorm})."
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            // Email
            'email.required' => 'Debes indicar el correo del usuario a asignar.',
            'email.email'    => 'El correo no es válido. Verifica el dominio (ej: usuario@gmail.com).',
            'email.max'      => 'El correo no puede superar los 120 caracteres.',
            'email.exists'   => 'No existe ningún usuario con este correo. Pídele que se registre primero.',

            // Horarios
            'hora_inicio.date_format' => 'La hora de entrada debe tener formato HH:MM (ej: 10:00).',
            'hora_fin.date_format'    => 'La hora de salida debe tener formato HH:MM (ej: 19:00).',
        ];
    }
}