<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest para PUT /mi-barberia (BarberiaController@updateConfig).
 *
 * 🔧 FIX #4 (PDF): "En ajustes de negocio de la empresa/barberia no se limita
 * el tiempo máximo que se puede cancelar con anticipacion y además da error."
 *
 * El controller ya validaba inline con max:43200, pero:
 *   - Faltaba migrarlo a FormRequest (convención del proyecto, finding Tarea 2).
 *   - Faltaban mensajes claros en español (antes salían en inglés genérico).
 *
 * Contexto de seguridad:
 *   La ruta es PUT /mi-barberia (sin {id}). El controller resuelve la
 *   barbería del usuario autenticado vía $request->user()->barberia_id,
 *   así que NO necesitamos validar ID aquí — el middleware role:admin
 *   ya garantiza que el caller pertenece a una barbería.
 *
 * Único campo validado:
 *   - tiempo_cancelacion: minutos enteros, entre 0 y 43200 (30 días).
 *     El frontend (ConfiguracionPage.jsx) calcula este número con
 *     dias*1440 + horas*60 + minutos y manda el total.
 */
class UpdateConfigBarberiaRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización fina la maneja el middleware role:admin en la ruta.
        return true;
    }

    public function rules(): array
    {
        return [
            // 0 = cancelación instantánea permitida (válido para algunas barberías).
            // 43200 minutos = 30 días = límite superior razonable.
            'tiempo_cancelacion' => 'required|integer|min:0|max:43200',
        ];
    }

    public function messages(): array
    {
        return [
            'tiempo_cancelacion.required' => 'El tiempo de cancelación es obligatorio.',
            'tiempo_cancelacion.integer'  => 'El tiempo de cancelación debe ser un número entero de minutos.',
            'tiempo_cancelacion.min'      => 'El tiempo de cancelación no puede ser negativo.',
            'tiempo_cancelacion.max'      => 'El tiempo máximo de cancelación es de 30 días (43.200 minutos).',
        ];
    }
}
