import { Link } from 'react-router-dom'

// TODO: diseñar un 404 con la temática (el profe sugirió hacerlo interesante).
export default function NotFoundPage() {
  return (
    <main className="p-6 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="my-4">Esta isla no existe en el mapa.</p>
      <Link className="underline" to="/dashboard">Volver al dashboard</Link>
    </main>
  )
}
