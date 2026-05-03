<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px;">
    
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        
        <!-- Cabecera oscura -->
        <div style="background-color: #03070e; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">
                TENRI <span style="color: #10b981;">BARBER</span>
            </h1>
        </div>
        
        <!-- Cuerpo del correo -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-top: 0;">
                Hola, <strong style="color: #0f172a;">{{ $cita->cliente->name }}</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                Te confirmamos que hemos procesado la <strong style="color: #e11d48;">cancelación</strong> de tu reserva. Tu hora ha sido liberada en nuestro sistema.
            </p>
            
            <!-- Tarjeta de Detalles Cancelados (Con borde rojo) -->
            <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 20px; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 8px 0; color: #9f1239; font-weight: bold; font-size: 15px;">
                    Servicio Anulado: <span style="font-weight: normal;">{{ $cita->servicio->nombre ?? 'Servicio' }}</span>
                </p>
                <p style="margin: 8px 0; color: #9f1239; font-weight: bold; font-size: 15px;">
                    🗓️ Fecha: <span style="font-weight: normal;">{{ $cita->fecha }}</span>
                </p>
                <p style="margin: 8px 0; color: #9f1239; font-weight: bold; font-size: 15px;">
                    ⏰ Hora: <span style="font-weight: normal;">{{ $cita->hora }}</span>
                </p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #64748b;">
                Lamentamos que no puedas asistir esta vez. Cuando estés listo, puedes volver a agendar en cualquier momento desde nuestra plataforma.
            </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © {{ date('Y') }} TENRI Barber. Todos los derechos reservados.
            </p>
        </div>
        
    </div>
</body>
</html>