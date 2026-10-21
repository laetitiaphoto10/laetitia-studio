import { Link } from 'react-router-dom'

// =================== À PERSONNALISER ===================
const NOM = 'Laetitia'
const NOM_FAMILLE = 'Fey'
const ACCROCHE = 'Photographe'
const INTRO = 'Grossesse, naissance, mariage, couple : des souvenirs photographiés avec sincérité, pour les retrouver et les partager longtemps.'

// Quelques phrases de présentation (laisser '' pour masquer la section)
const A_PROPOS = ''

// Photo de chaque séance : dans le dossier public/photos, nommer le fichier comme indiqué
const SEANCES = [
  { titre: 'Grossesse', texte: 'Célébrer l\'attente avant l\'arrivée de bébé.', photo: '/photos/grossesse.jpg' },
  { titre: 'Naissance', texte: 'Les tout premiers jours, à la maison, en douceur.', photo: '/photos/naissance.jpg' },
  { titre: 'Mariage', texte: 'Une journée entière racontée en images.', photo: '/photos/mariage.jpg' },
  { titre: 'Couple', texte: 'Une séance naturelle, à votre image.', photo: '/photos/couple.jpg' }
]

// Portfolio : lister les photos ajoutées dans public/photos, ex : ['/photos/1.jpg', '/photos/2.jpg']
const PHOTOS = []

const PHOTO_PORTRAIT = '/photos/laetitia.jpg' // portrait de Laetitia (section "à propos")
const EMAIL = 'laetitiafey@gmail.com'
const INSTAGRAM = '' // ex : 'https://instagram.com/mon_compte'
// ========================================================

const cacher = (e) => { e.currentTarget.style.display = 'none' }

// Bande de perforations façon pellicule
function Perforation() {
  return (
    <div
      aria-hidden="true"
      className="h-4 text-paper/30"
      style={{
        backgroundImage: 'radial-gradient(circle, currentColor 3px, transparent 3.5px)',
        backgroundSize: '24px 16px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center'
      }}
    />
  )
}

export default function Accueil() {
  return (
    <div className="bg-ink text-paper min-h-screen">
      {/* ---------- Bandeau d'accueil ---------- */}
      <header className="relative min-h-[88vh] flex flex-col overflow-hidden">
        <img
          src="/photos/accueil.jpg"
          alt={`${NOM} ${NOM_FAMILLE}, ${ACCROCHE.toLowerCase()}`}
          onError={cacher}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />

        <nav className="relative w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="font-display text-lg">{NOM} {NOM_FAMILLE}</span>
          <Link to="/reserver" className="text-sm border border-paper/40 rounded-full px-4 py-1.5 hover:bg-paper hover:text-ink transition-colors">
            Réserver
          </Link>
        </nav>

        <div className="relative w-full max-w-5xl mx-auto px-6 mt-auto pb-16 pt-24">
          <p className="text-amber text-xs tracking-[0.3em] uppercase mb-4">{ACCROCHE}</p>
          <h1 className="font-display text-6xl md:text-8xl leading-none mb-6">
            {NOM} <span className="italic text-amber">{NOM_FAMILLE}</span>
          </h1>
          <p className="text-paper/80 text-lg md:text-xl max-w-xl mb-10">{INTRO}</p>
          <Link to="/reserver" className="inline-block bg-amber text-ink font-medium px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity">
            Réserver une séance
          </Link>
        </div>
      </header>

      {/* ---------- Les séances ---------- */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-display text-4xl mb-10">Les séances</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SEANCES.map(s => (
            <Link key={s.titre} to="/reserver"
              className="group relative aspect-[3/4] rounded overflow-hidden bg-charcoal block">
              <img src={s.photo} alt={`Séance ${s.titre.toLowerCase()}`} onError={cacher} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
              <div className="absolute bottom-0 p-4">
                <h3 className="font-display text-2xl">{s.titre}</h3>
                <p className="text-paper/70 text-xs mt-1">{s.texte}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- À propos ---------- */}
      {A_PROPOS && (
        <section className="max-w-5xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-10 items-center">
          <img src={PHOTO_PORTRAIT} alt={`Portrait de ${NOM}`} onError={cacher}
            className="w-full aspect-[4/5] object-cover rounded" />
          <div>
            <h2 className="font-display text-4xl mb-5">À propos</h2>
            <p className="text-paper/80 text-lg leading-relaxed whitespace-pre-line">{A_PROPOS}</p>
          </div>
        </section>
      )}

      {/* ---------- Portfolio en planche contact ---------- */}
      {PHOTOS.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="font-display text-4xl mb-10">Portfolio</h2>
          <div className="bg-black/40 rounded">
            <Perforation />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 px-3 py-2">
              {PHOTOS.map((src, i) => (
                <figure key={src} className="relative">
                  <img src={src} alt="" loading="lazy" className="w-full aspect-[4/5] object-cover" />
                  <figcaption className="absolute bottom-2 left-2 text-xs font-display text-amber">
                    {String(i + 1).padStart(2, '0')}
                  </figcaption>
                </figure>
              ))}
            </div>
            <Perforation />
          </div>
        </section>
      )}

      {/* ---------- Comment ça se passe ---------- */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="font-display text-4xl mb-10">Comment ça se passe</h2>
        <ol className="grid md:grid-cols-3 gap-6">
          {[
            ['Vous envoyez votre demande', 'Type de séance, lieu souhaité, un mot sur votre projet.'],
            ['Je vous propose une date', 'Je reviens vers vous par email pour fixer le jour et l\'heure.'],
            ['Vous signez en ligne', 'Le contrat se signe depuis votre téléphone, sans rien imprimer.']
          ].map(([titre, texte], i) => (
            <li key={titre} className="border-t border-charcoal pt-4">
              <span className="font-display text-amber text-sm">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-display text-xl mt-1 mb-1">{titre}</h3>
              <p className="text-paper/70 text-sm">{texte}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Contact ---------- */}
      <section className="bg-paper text-ink">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-4xl mb-3">Une idée de séance ?</h2>
          <p className="text-charcoal/70 mb-8">Envoyez votre demande, je reviens vers vous pour vous proposer une date.</p>
          <Link to="/reserver" className="inline-block bg-ink text-paper font-medium px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity">
            Faire une demande
          </Link>
          <div className="flex justify-center gap-6 mt-8 text-sm text-charcoal/70">
            {EMAIL && <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a>}
            {INSTAGRAM && <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="underline">Instagram</a>}
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-paper/40">
        © {new Date().getFullYear()} {NOM} {NOM_FAMILLE} · <Link to="/login" className="hover:text-amber">Espace pro</Link>
      </footer>
    </div>
  )
}
