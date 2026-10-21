// Fonction Cloudflare Pages : envoie un email à Laetitia à chaque nouvelle demande
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export async function onRequestPost({ request, env }) {
  try {
    const d = await request.json()
    const lien = `${new URL(request.url).origin}/admin/agenda`

    const html = `
      <h2>Nouvelle demande de séance</h2>
      <p><strong>${esc(d.clientName)}</strong></p>
      <p>Type : ${esc(d.type)}<br>
         Email : ${esc(d.email)}<br>
         Téléphone : ${esc(d.phone)}<br>
         Lieu : ${esc(d.location)}</p>
      <p>Message : ${esc(d.notes)}</p>
      <p><a href="${lien}">Ouvrir mon agenda</a></p>`

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Studio Laetitia Fey <onboarding@resend.dev>',
        to: [env.NOTIFY_EMAIL],
        subject: `Nouvelle demande : ${d.clientName || 'client'} (${d.type || 'séance'})`,
        html
      })
    })
    return new Response(JSON.stringify({ ok: r.ok }), {
      status: r.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
