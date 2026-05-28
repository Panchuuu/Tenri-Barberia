<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServicioRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a hacer esta petición.
     */
    public function authorize(): bool
    {
        // Como ya protegemos las rutas con middleware en api.php, aquí lo dejamos en true
        return true; 
    }

    /**
     * Define las reglas de validación.
     * ¡Sacamos esto directamente de tu Controlador!
     */
    public function rules(): array
    {
        return [
            // 🔧 FIX #11 (PDF): "No existen validaciones de caracteres máximos
            // al crear un servicio." Antes max:255 (irreal). Bajamos a max:80.
            'nombre'      => 'required|string|min:2|max:80',

            // 🎯 Integer (no numeric): CLP no tiene decimales.
            // Max 9.999.999 = 9,99M (más que suficiente para barbería).
            'precio'      => 'required|integer|min:1|max:9999999',

            // 🎯 Integer (no numeric): minutos enteros.
            // Mínimo 5 minutos (razonable), máximo 8 horas (480 min).
            'duracion'    => 'required|integer|min:5|max:480',

            // 🔧 FIX #11: descripción no tenía límite. max:300 (suficiente
            // para una línea o dos de texto explicativo).
            'descripcion' => 'nullable|string|max:300',

            // Alineado con StoreBarberiaRequest (B.1):
            // mismo orden de mimes + 5MB para consistencia con ImageUploader.
            'imagen'      => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ];
    }

    /**
     * Opcional: Aquí podemos personalizar los mensajes de error 
     * en español para que React los muestre más bonitos.
     */
    public function messages(): array
    {
        return [
            // Nombre
            'nombre.required' => 'El nombre del servicio es obligatorio.',
            'nombre.min'      => 'El nombre debe tener al menos 2 caracteres.',
            'nombre.max'      => 'El nombre no puede superar los 80 caracteres.',

            // Precio
            'precio.required' => 'El precio es obligatorio.',
            'precio.integer'  => 'El precio debe ser un número entero (sin decimales).',
            'precio.min'      => 'El precio mínimo es $1.',
            'precio.max'      => 'El precio máximo permitido es $9.999.999.',

            // Duración
            'duracion.required' => 'La duración es obligatoria.',
            'duracion.integer'  => 'La duración debe ser un número entero de minutos.',
            'duracion.min'      => 'La duración mínima es de 5 minutos.',
            'duracion.max'      => 'La duración máxima es de 480 minutos (8 horas).',

            // Descripción
            'descripcion.max' => 'La descripción no puede superar los 300 caracteres.',

            // Imagen
            'imagen.image' => 'El archivo debe ser una imagen válida.',
            'imagen.mimes' => 'La imagen debe ser JPG, PNG o WebP.',
            'imagen.max'   => 'La imagen no puede pesar más de 5 MB.',
        ];
    }
}