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
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric|min:0',
            'duracion' => 'required|numeric|min:1', 
            'descripcion' => 'nullable|string',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048' 
        ];
    }

    /**
     * Opcional: Aquí podemos personalizar los mensajes de error 
     * en español para que React los muestre más bonitos.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del servicio es obligatorio.',
            'precio.required' => 'Debes indicar un precio válido.',
            'imagen.max' => 'La imagen es muy pesada. Máximo 2MB.',
            'imagen.image' => 'El archivo debe ser una imagen válida.'
        ];
    }
}