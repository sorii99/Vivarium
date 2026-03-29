import { Link } from 'react-router-dom'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000'

export default function ReservaSuccess() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%2C%20me%20interesa%20consultar%20sobre%20sus%20productos.`

  return (
    <div className="max-w-lg mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="text-6xl mb-6">🌿</div>
      <h1 className="font-display text-2xl sm:text-3xl text-botanica-900 dark:text-botanica-100 mb-3">
        ¡Reserva exitosa!
      </h1>
      <p className="text-botanica-500 dark:text-botanica-400 font-body mb-2 text-sm sm:text-base">
        Tu pedido fue reservado.
      </p>
      <p className="text-botanica-500 dark:text-botanica-400 font-body mb-2 text-sm sm:text-base">
        Alias:
      </p>
      <p className="text-botanica-400 text-xs sm:text-sm mb-8">
        Podés enviarnos por <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-botanica-200 transition-colors">Whatsapp</a> el comprobante <br />para continuar con la compra.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/productos" className="btn-primary">Ver más productos</Link>
        <Link to="/" className="btn-outline border-botanica-300 dark:border-botanica-600 text-botanica-600 dark:text-botanica-300">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
