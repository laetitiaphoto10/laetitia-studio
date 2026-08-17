import { useEffect, useMemo, useState } from 'react'
import { listenSessions, listenEvents, createEvent, deleteEvent } from '../lib/data'

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function toKey(d) {
  return d.toISOString().slice(0, 10)
}

export default function Calendrier() {
  const [sessions, setSessions] = useState([])
  const [events, setEvents] = useState([])
  const [cursor, setCursor] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [newEvent, setNewEvent] = useState({ title: '', notes: '' })

  useEffect(() => {
    const u1 = listenSessions(setSessions)
    const u2 = listenEvents(setEvents)
    return () => { u1(); u2() }
  }, [])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const days = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1)
    // Lundi = 0 ... Dimanche = 6
    const startOffset = (firstOfMonth.getDay() + 6) % 7
    const start = new Date(year, month, 1 - startOffset)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [year, month])

  const itemsByDay = useMemo(() => {
    const map = {}
    sessions.forEach(s => {
      if (!s.date || s.status === 'annule') return
      map[s.date] = map[s.date] || { sessions: [], events: [] }
      map[s.date].sessions.push(s)
    })
    events.forEach(e => {
      if (!e.date) return
      map[e.date] = map[e.date] || { sessions: [], events: [] }
      map[e.date].events.push(e)
    })
    return map
  }, [sessions, events])

  const addPersonalEvent = async (e) => {
    e.preventDefault()
    if (!newEvent.title || !selectedDay) return
    await createEvent({ date: selectedDay, title: newEvent.title, notes: newEvent.notes })
    setNewEvent({ title: '', notes: '' })
  }

  const today = toKey(new Date())

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">Calendrier</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="px-3 py-1.5 rounded border border-border text-sm">←</button>
          <p className="font-display text-lg w-40 text-center">{MOIS[month]} {year}</p>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="px-3 py-1.5 rounded border border-border text-sm">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {JOURS.map(j => (
          <div key={j} className="text-center text-xs text-charcoal/50 font-medium py-1">{j}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(d => {
          const key = toKey(d)
          const inMonth = d.getMonth() === month
          const dayItems = itemsByDay[key]
          const isToday = key === today
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className={`text-left align-top p-1.5 rounded border min-h-20 ${inMonth ? 'bg-white' : 'bg-paper/40'} ${
                selectedDay === key ? 'border-amber ring-1 ring-amber' : 'border-border'
              }`}
            >
              <span className={`text-xs ${isToday ? 'font-display text-amber font-bold' : 'text-charcoal/60'}`}>
                {d.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayItems?.sessions.map(s => (
                  <div key={s.id} className="text-[11px] bg-charcoal text-paper rounded px-1 py-0.5 truncate">
                    {s.time ? `${s.time} ` : ''}{s.clientName}
                  </div>
                ))}
                {dayItems?.events.map(ev => (
                  <div key={ev.id} className="text-[11px] bg-amber/30 text-charcoal rounded px-1 py-0.5 truncate">
                    {ev.title}
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {selectedDay && (
        <div className="filmcard py-6 mt-6">
          <h3 className="font-display text-lg mb-3">{selectedDay}</h3>

          {itemsByDay[selectedDay]?.sessions.map(s => (
            <div key={s.id} className="text-sm mb-2 pb-2 border-b border-border">
              <span className="font-medium">{s.time ? `${s.time} — ` : ''}{s.clientName}</span>
              {s.type && <span className="text-charcoal/60"> · {s.type}</span>}
              {s.location && <span className="text-charcoal/60"> · {s.location}</span>}
            </div>
          ))}

          {itemsByDay[selectedDay]?.events.map(ev => (
            <div key={ev.id} className="text-sm mb-2 pb-2 border-b border-border flex items-center justify-between">
              <div>
                <span className="font-medium">{ev.title}</span>
                {ev.notes && <span className="text-charcoal/60"> — {ev.notes}</span>}
              </div>
              <button onClick={() => deleteEvent(ev.id)} className="text-red-700/70 text-xs">Supprimer</button>
            </div>
          ))}

          <form onSubmit={addPersonalEvent} className="flex flex-wrap gap-2 mt-3">
            <input placeholder="Ajouter un RDV perso / besoin (ex: dentiste, retouches...)" value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              className="flex-1 min-w-48 px-3 py-2 rounded border border-border" />
            <input placeholder="Note (optionnel)" value={newEvent.notes}
              onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })}
              className="flex-1 min-w-48 px-3 py-2 rounded border border-border" />
            <button type="submit" className="bg-amber text-ink px-4 py-2 rounded text-sm font-medium">
              Ajouter
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
