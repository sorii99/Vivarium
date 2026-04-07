import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-5xl sm:text-7xl mb-4 sm:mb-6 animate-leaf-sway inline-block">🌿</span>
      <h1 className="font-display text-4xl sm:text-5xl text-botanica-800 dark:text-botanica-200 mb-2 sm:mb-3">404</h1>
      <p className="text-botanica-500 dark:text-botanica-400 text-sm sm:text-lg mb-6 sm:mb-8">Esta página no existe… o se cayó como una hoja.</p>
    </div>
  )
}
