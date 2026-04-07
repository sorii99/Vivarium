const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || ''
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || ''
const FACEBOOK_URL = import.meta.env.VITE_FACEBOOK_URL || ''
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || ''

export default function Footer() {
  const year = new Date().getFullYear()
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%2C%20me%20interesa%20consultar%20sobre%20el%20catalogo!`

  return (
    <footer className="bg-botanica-900 dark:bg-botanica-950 text-botanica-400 border-t border-botanica-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🌿</span>
              <span className="font-display text-lg text-botanica-100">Alta Planta</span>
            </div>
            <p className="text-xs leading-relaxed text-botanica-500 dark:text-botanica-500 mb-4">
              Todo lo que necesitas para tu jardin.
            </p>
            <div className="flex items-center gap-3">
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-botanica-800 hover:bg-green-600 flex items-center justify-center transition-colors"
                aria-label="WhatsApp">
                <svg className="w-4 h-4 text-botanica-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-botanica-800 hover:bg-pink-600 flex items-center justify-center transition-colors"
                aria-label="Instagram">
                <svg className="w-4 h-4 text-botanica-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {FACEBOOK_URL && (
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-botanica-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                  aria-label="Facebook">
                  <svg className="w-4 h-4 text-botanica-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-botanica-200 text-sm font-display mb-3"></h3>
          </div>

          <div>
            <h3 className="text-botanica-200 text-sm font-display mb-3">Contacto</h3>
            <ul className="space-y-2 text-xs text-botanica-500">
              <li className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>Temperley, Buenos Aires</span>
              </li>
              {CONTACT_EMAIL && (
                <li className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <a href={`mailto:${CONTACT_EMAIL}`}
                    className="hover:text-botanica-200 transition-colors break-all">
                    {CONTACT_EMAIL}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-botanica-200 text-sm font-display mb-3">Horarios</h3>
            <ul className="space-y-1.5 text-xs text-botanica-500">
              <li className="flex justify-between gap-4">
                <span>Lunes a Viernes</span>
                <span className="text-botanica-400">9:00 – 18:00</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sábados</span>
                <span className="text-botanica-400">9:00 – 15:00</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Domingos</span>
                <span className="text-botanica-400">9:00 – 15:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-botanica-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-botanica-600">
          <p>© {year} fzdev. Todos los derechos reservados.</p>
          <p>
            Desarrollado por y para los amantes de las plantas. 🌱
          </p>
        </div>
      </div>
    </footer>
  )
}
