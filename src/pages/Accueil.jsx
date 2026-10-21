import { Link } from 'react-router-dom'

// ====== À PERSONNALISER (Laetitia peut changer ces textes quand elle veut) ======
const NOM = 'Laetitia Fey'
const ACCROCHE = 'Photographe'
const INTRO = 'Grossesse, naissance, mariage, couple : des souvenirs photographiés avec sincérité, pour les retrouver et les partager longtemps.'
const SEANCES = [
  { titre: 'Grossesse', texte: 'Un moment pour célébrer l\'attente avant l\'arrivée de bébé.' },
  { titre: 'Naissance', texte: 'Les tout premiers jours, à la maison, en douceur.' },
  { titre: 'Mariage', texte: 'Une journée entière racontée en images.' },
  { titre: 'Couple', texte: 'Une séance naturelle, à votre image.' }
]
// Photos du portfolio : ajouter les fichiers dans le dossier "public/photos"
// puis les lister ici, par exemple : ['/photos/1.jpg', '/photos/2.jpg']
const PHOTOS = []
const EMAIL = 'laetitiafey@gmail.com'
const INSTAGRAM = '' // ex : 'https://instagram.com/mon_compte'
// =================================================================================

export default function Accueil() {
  return (
    <div className="bg-ink text-paper min-h-screen">
      {/* Bandeau d'accueil : la photo /accueil.jpg s'affiche si elle existe */}
      <header className="relative min-h-[70vh] flex items-end overflow-hidden">
        <img
          src="/accueil.jpg"
          alt={`${NOM}, ${ACCROCHE.toLowerCase()}`}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        <div className="relative w-full max-w-3xl mx-auto px-6 pb-14 pt-32">
          <p className="text-amber text-sm tracking-widest uppercase mb-3">{ACCROCHE}</p>
          <h1 className="font-display text-5xl md:text-6xl mb-5">{NOM}</h1>
          <p className="text-paper/80 text-lg max-w-xl mb-8">{INTRO}</p>
          <Link to="/reserver" className="inline-block bg-amber text-ink font-medium px-6 py-3 rounded">
            Réserver une séance
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl mb-8">Les séances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SEANCES.map(s => (
            <div key={s.titre} className="border border-charcoal rounded p-5">
              <h3 className="font-display text-xl text-amber mb-1">{s.titre}</h3>
              <p className="text-paper/70 text-sm">{s.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {PHOTOS.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="font-display text-3xl mb-8">Portfolio</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PHOTOS.map(src => (
              <img key={src} src={src} alt="" loading="lazy"
                className="w-full aspect-[4/5] object-cover rounded" />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <h2 className="font-display text-3xl mb-3">Une idée de séance ?</h2>
        <p className="text-paper/70 mb-6">Envoyez votre demande, je reviens vers vous pour vous proposer une date.</p>
        <Link to="/reserver" className="inline-block bg-amber text-ink font-medium px-6 py-3 rounded">
          Faire une demande
        </Link>
        <div className="flex justify-center gap-6 mt-8 text-sm text-paper/70">
          {EMAIL && <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a>}
          {INSTAGRAM && <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="underline">Instagram</a>}
        </div>
      </section>

      <footer className="border-t border-charcoal py-6 text-center text-xs text-paper/40">
        © {new Date().getFullYear()} {NOM} · <Link to="/login" className="hover:text-amber">Espace pro</Link>
      </footer>
    </div>
  )
}
