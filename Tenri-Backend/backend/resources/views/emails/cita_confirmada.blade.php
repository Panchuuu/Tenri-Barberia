<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px;">
    
    <!-- Contenedor Principal -->
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        
        <!-- Cabecera -->
        <div style="background-color: #03070e; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">
                TENRI <span style="color: #10b981;">BARBER</span>
            </h1>
        </div>
        
        <!-- Contenido -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-top: 0;">
                Hola, <strong style="color: #0f172a;">{{ $cita->cliente->name }}</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                ¡Tu reserva ha sido confirmada exitosamente! Estamos listos para elevar tu estilo.
            </p>
            
            <!-- Tarjeta de Resumen -->
            <div style="background-color: #f1f5f9; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 8px 0; color: #0f172a; font-weight: bold; font-size: 15px;">
                    🗓️ Fecha: <span style="font-weight: normal; color: #475569;">{{ $cita->fecha }}</span>
                </p>
                <p style="margin: 8px 0; color: #0f172a; font-weight: bold; font-size: 15px;">
                    ⏰ Hora: <span style="font-weight: normal; color: #475569;">{{ $cita->hora }}</span>
                </p>
                <p style="margin: 8px 0; color: #0f172a; font-weight: bold; font-size: 15px;">
                    ✂️ Especialista: <span style="font-weight: normal; color: #475569;">{{ $cita->barbero->name ?? 'Por asignar' }}</span>
                </p>
                <p style="margin: 8px 0; color: #0f172a; font-weight: bold; font-size: 15px;">
                    💵 Total a pagar en local: <span style="font-weight: normal; color: #10b981;">${{ number_format($cita->servicio->precio ?? 0, 0, ',', '.') }} CLP</span>
                </p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #64748b;">
                Te recordamos llegar con 5 minutos de anticipación. Si necesitas cancelar, por favor contáctanos con antelación.
            </p>
            <p style="font-size: 16px; font-weight: bold; color: #0f172a;">
                ¡Te esperamos!
            </p>
        </div>
        
        <!-- Pie de página -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © {{ date('Y') }} TENRI Barber. Todos los derechos reservados.
            </p>
        </div>
        
    </div>
</body>
</html>