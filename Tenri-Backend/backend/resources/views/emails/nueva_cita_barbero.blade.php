<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nueva Cita Agendada</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 900; color: #0f1b29; letter-spacing: 2px; }
        .logo span { color: #10b981; }
        h1 { color: #0f1b29; font-size: 22px; }
        .details { background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .details p { margin: 10px 0; font-size: 16px; color: #334155; }
        .details strong { color: #0f1b29; }
        .footer { text-align: center; margin-top: 30px; font-size: 13px; color: #94a3b8; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TENRI <span>SPA</span></div>
        </div>
        
        <h1>¡Hola, {{ $cita->barbero->name }}! 💈</h1>
        <p>Se acaba de agendar una nueva cita en tu agenda. Aquí tienes los detalles:</p>
        
        <div class="details">
            <p>👤 <strong>Cliente:</strong> {{ $cita->cliente->name }}</p>
            <p>✂️ <strong>Servicio:</strong> {{ $cita->servicio->nombre }}</p>
            <p>📅 <strong>Fecha:</strong> {{ \Carbon\Carbon::parse($cita->fecha)->format('d/m/Y') }}</p>
            <p>⏰ <strong>Hora:</strong> {{ \Carbon\Carbon::parse($cita->hora)->format('H:i') }}</p>
        </div>

        <p>Asegúrate de estar preparado para brindar el mejor servicio.</p>
        
        <div style="text-align: center;">
            <a href="http://localhost:5173" class="btn">Ver mi agenda</a>
        </div>

        <div class="footer">
            <p>Este es un correo automático de TENRI SPA. Por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>