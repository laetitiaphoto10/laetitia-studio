const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export async function onRequestPost({ request, env }) {
  try {
    const d = await request.json()
    const origin = new URL(request.url).origin
    const isContrat = d.kind === 'contrat'

    const subject = isContrat
      ? `Contrat signé — ${d.clientName || 'client'}`
      : `Nouvelle demande de séance — ${d.clientName || 'client'}`

    const rows = isContrat
      ? [['Client', d.clientName], ['Signé le', d.signedAt]]
      : [
          ['Client', d.clientName],
          ['Email', d.email || 'non renseigné'],
          ['Téléphone', d.phone || 'non renseigné'],
          ['Séance', d.type],
          ['Date souhaitée', `${d.date || ''}${d.time ? ' à ' + d.time : ''}`],
          ['Lieu', d.location || 'non renseigné'],
          ['Notes', d.notes || 'aucune']
        ]

    const link = isContrat ? `${origin}/admin/contrats` : `${origin}/admin/agenda`
    const title = isContrat ? 'Un client vient de signer son contrat' : 'Nouvelle demande de séance'

    const html =
      `<h2>${esc(title)}</h2>` +
      rows.map(([k, v]) => `<p><b>${esc(k)} :</b> ${esc(v)}</p>`).join('') +
      (isContrat && d.content ? `<hr><p><b>Copie du contrat :</b></p><pre style="white-space:pre-wrap;font-family:inherit">${esc(d.content)}</pre>` : '') +
      `<p><a href="${link}">Ouvrir l'espace pro</a></p>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Studio Laetitia Fey <onboarding@resend.dev>',
        to: [env.NOTIFY_EMAIL],
        subject,
        html
      })
    })

    if (!res.ok) return new Response(await res.text(), { status: 500 })
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(err.message, { status: 500 })
  }
}
