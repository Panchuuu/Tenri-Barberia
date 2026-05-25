<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | 🔒 FIX FASE 1:
    | Antes "allowed_origins" estaba en ['*'], lo que es inseguro en producción.
    | Ahora leemos los dominios permitidos desde .env (FRONTEND_URL).
    |
    | En tu .env agrega:
    |   FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(
        explode(',', env('FRONTEND_URL', 'http://localhost:5173,http://127.0.0.1:5173'))
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
