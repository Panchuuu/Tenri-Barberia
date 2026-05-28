<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateBarberoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Alineado con B.1: max:80 (era max:255 irreal).
            'name'         => 'nullable|string|min:2|max:80',

            // 🔧 FIX #10 (PDF): horario incongruente sin mensaje claro.
            // El cross-field check (hora_fin > hora_inicio) va en withValidator()
            // porque acá no podemos comparar entre campos directamente.
            'hora_inicio'  => 'nullable|date_format:H:i',
            'hora_fin'     => 'nullable|date_format:H:i',

            'bio'          => 'nullable|string|max:500',
            'especialidad' => 'nullable|string|max:100',

            // Alineado con B.1/B.2: 5MB + orden de mimes consistente.
            'avatar'       => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ];
    }

    /**
     * 🔧 FIX #10 (PDF): valida que hora_fin sea posterior a hora_inicio.
     *
     * En un PATCH/PUT el cliente puede enviar solo UNA de las dos horas;
     * en ese caso completamos la faltante con la actual del barbero en BD
     * para que la comparación tenga contexto.
     *
     * Si el cliente envía ambas, simplemente las compara.
     * Si no envía ninguna, no hace nada (no aplica al request actual).
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $inicio = $this->input('hora_inicio');
            $fin    = $this->input('hora_fin');

            // Si no llega ninguna hora en el request, no validamos cross-field.
            if (!$inicio && !$fin) {
                return;
            }

            // Si solo llega una, completamos la otra desde la BD.
            if (!$inicio || !$fin) {
                $barberoId = $this->route('id');
                $barbero   = $barberoId ? User::find($barberoId) : null;

                if (!$barbero) {
                    // Sin barbero en BD no podemos comparar. Salimos sin error
                    // (el resto de validaciones manejan el caso "no existe").
                    return;
                }

                if (!$inicio) $inicio = $barbero->hora_inicio;
                if (!$fin)    $fin    = $barbero->hora_fin;
            }

            // Si después de los fallbacks alguna sigue null, no hay nada que comparar.
            if (!$inicio || !$fin) {
                return;
            }

            // Normalizamos a "HH:MM" por si en BD viene como "HH:MM:SS".
            $inicioNormalizado = substr((string) $inicio, 0, 5);
            $finNormalizado    = substr((string) $fin, 0, 5);

            // Comparación lexicográfica de strings zero-padded HH:MM funciona OK.
            // (Tu observación sobre Carbon es correcta, pero para HH:MM no se gana
            // robustez extra y evitamos importar Carbon en un FormRequest.)
            if ($finNormalizado <= $inicioNormalizado) {
                $validator->errors()->add(
                    'hora_fin',
                    "La hora de salida ({$finNormalizado}) debe ser posterior a la hora de entrada ({$inicioNormalizado})."
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            // Nombre
            'name.min' => 'El nombre debe tener al menos 2 caracteres.',
            'name.max' => 'El nombre no puede superar los 80 caracteres.',

            // Horarios
            'hora_inicio.date_format' => 'La hora de entrada debe tener formato HH:MM (ej: 10:00).',
            'hora_fin.date_format'    => 'La hora de salida debe tener formato HH:MM (ej: 19:00).',

            // Bio
            'bio.max' => 'La biografía no puede superar los 500 caracteres.',

            // Especialidad
            'especialidad.max' => 'La especialidad no puede superar los 100 caracteres.',

            // Avatar
            'avatar.image' => 'El archivo debe ser una imagen válida.',
            'avatar.mimes' => 'La imagen debe ser JPG, PNG o WebP.',
            'avatar.max'   => 'La imagen no puede pesar más de 5 MB.',
        ];
    }
}
