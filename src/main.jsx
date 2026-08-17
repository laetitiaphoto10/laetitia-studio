import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// On empêche le navigateur d'afficher tout seul un bandeau "Installer l'appli".
// Les clients qui cliquent sur le lien de réservation ne doivent voir qu'une
// page web classique. Laetitia, elle, pourra toujours installer la PWA
// manuellement depuis le menu de son navigateur si elle le souhaite.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
