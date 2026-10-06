// Edge Function: genera un token de reseteo y envía el email de recuperación.
// El token se crea en el servidor (service role) para que nadie pueda forjarlo
// desde el navegador. El envío usa Resend (https://resend.com).
//
// Despliegue:
//   supabase secrets set RESEND_API_KEY=re_xxxx
//   supabase functions deploy send-reset-email --no-verify-jwt
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, appUrl } = await req.json();
    if (!email || !appUrl) {
      return json({ success: false, error: 'Email requerido' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: userData } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', String(email).toLowerCase())
      .single();

    if (!userData) {
      return json({ success: false, error: 'Usuario no encontrado' }, 404);
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_token: token,
        password_reset_expires: expiresAt,
      })
      .eq('id', userData.id);

    if (updateError) throw updateError;

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.error('RESEND_API_KEY no configurada');
      return json({ success: false, error: 'Servicio de email no configurado' }, 500);
    }

    const resetUrl = `${appUrl}/reset-password/${token}`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Falla Màrtirs <onboarding@resend.dev>',
        to: [userData.email],
        subject: 'Recuperació de contrasenya — Falla Màrtirs',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #464971;">Falla Màrtirs</h2>
            <p>Hola ${userData.name || 'faller/a'},</p>
            <p>Has solicitado restablecer tu contraseña. Pulsa el botón para elegir una nueva:</p>
            <p style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background: #464971; color: #fff; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                Restablecer contraseña
              </a>
            </p>
            <p style="color: #666; font-size: 13px;">El enlace caduca en 24 horas. Si no has sido tú, ignora este email.</p>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      const body = await resendRes.text();
      console.error('Resend error:', resendRes.status, body);
      return json({ success: false, error: 'Error enviando el email' }, 502);
    }

    return json({ success: true });
  } catch (err) {
    console.error('send-reset-email error:', err);
    return json({ success: false, error: 'Error al procesar la solicitud' }, 500);
  }
});
