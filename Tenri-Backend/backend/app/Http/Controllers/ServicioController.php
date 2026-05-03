<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use App\Models\Barberia;
use Illuminate\Http\Request;

class ServicioController extends Controller
{
    // 🌍 LISTAR PÚBLICO: Filtrado por el "slug" de la empresa (Ej: tenri-barber)
    public function index(Request $request) {
        $slug = $request->query('barberia'); // React nos enviará ?barberia=tenri-barber

        if (!$slug) {
            return response()->json(['error' => 'Debes indicar la barbería'], 400);
        }

        // Buscamos la empresa por su slug
        $barberia = Barberia::where('slug', $slug)->firstOrFail();

        // Devolvemos SOLO los servicios de ESA empresa
        return Servicio::where('barberia_id', $barberia->id)->get();
    }

    // 🔒 CREAR (ADMIN): Se asigna automáticamente a la empresa del Admin
    public function store(Request $request) {
        // 1. Validamos que si envían una imagen, sea realmente una imagen y no pese más de 2MB
        $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric|min:0',
            'duracion' => 'required|numeric|min:1', 
            'descripcion' => 'nullable|string',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048' 
        ]);

        $rutaImagen = null;

        // 2. Si el usuario subió un archivo, lo guardamos en el disco duro (storage/app/public/servicios)
        if ($request->hasFile('imagen')) {
            $rutaImagen = $request->file('imagen')->store('servicios', 'public');
        }

        $servicio = Servicio::create([
            'nombre' => $request->nombre,
            'precio' => $request->precio,
            'duracion_minutos' => $request->duracion,
            'descripcion' => $request->descripcion,
            'imagen' => $rutaImagen, // Guardamos la ruta en la base de datos (Ej: servicios/foto1.jpg)
            'barberia_id' => $request->user()->barberia_id 
        ]);

        return response()->json($servicio, 201);
    }

    // 🔒 ACTUALIZAR: Verificamos que el servicio pertenezca a la empresa del Admin
    public function update(Request $request, $id) {
        $servicio = Servicio::where('id', $id)
                            ->where('barberia_id', $request->user()->barberia_id)
                            ->firstOrFail();
        
        $request->validate([
            'nombre' => 'required|string',
            'precio' => 'required|numeric',
            'duracion' => 'required|numeric',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        $datosActualizar = [
            'nombre' => $request->nombre,
            'precio' => $request->precio,
            'duracion_minutos' => $request->duracion,
            'descripcion' => $request->descripcion
        ];

        // Si subieron una foto NUEVA al editar, la guardamos y actualizamos la ruta
        if ($request->hasFile('imagen')) {
            // Opcional: Aquí podríamos borrar la foto anterior para ahorrar espacio
            $rutaImagen = $request->file('imagen')->store('servicios', 'public');
            $datosActualizar['imagen'] = $rutaImagen;
        }

        $servicio->update($datosActualizar);

        return response()->json($servicio);
    }

    // 🔒 ELIMINAR: Protegido por empresa
    public function destroy(Request $request, $id) {
        $servicio = Servicio::where('id', $id)
                            ->where('barberia_id', $request->user()->barberia_id)
                            ->firstOrFail();
                            
        $servicio->delete();
        return response()->json(['mensaje' => 'Servicio eliminado correctamente']);
    }
}