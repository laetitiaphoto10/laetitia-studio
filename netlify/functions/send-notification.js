export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const data = JSON.parse(event.body)
    const { clientName, email, phone, type, date, time, location, notes } = data

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Studio Laetitia Fey <onboarding@resend.dev>',
        to: [process.env.NOTIFY_EMAIL],
        subject: `Nouvelle demande de séance — ${clientName}`,
        text: [
          'Nouvelle demande de réservation reçue :',
          '',
          `Client : ${clientName}`,
          `Email : ${email || 'non renseigné'}`,
          `Téléphone : ${phone || 'non renseigné'}`,
          `Type de séance : ${type}`,
          `Date souhaitée : ${date}${time ? ' à ' + time : ''}`,
          `Lieu : ${location || 'non renseigné'}`,
          `Notes : ${notes || 'aucune'}`,
          '',
          'Connecte-toi à ton espace admin pour confirmer ou gérer cette demande.'
        ].join('\n')
      })
    })

    if (!resendRes.ok) {
      const errText = await resendRes.text()
      return { statusCode: 500, body: errText }
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) }
  } catch (err) {
    return { statusCode: 500, body: err.message }
  }
}
