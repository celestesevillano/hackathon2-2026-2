import { Link } from 'react-router-dom'
import type { NewsItem } from '../types/api'
import { NEWS_STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS } from '../lib/newsFilters'

interface NewsCardProps {
  news: NewsItem
  search: string // filtros actuales (?type=...), para que "Volver" los conserve
}

function NewsCard({ news, search }: NewsCardProps) {
  return (
    <li className="rounded border p-3">
      <Link to={`/news/${news.id}`} state={{ search }} className="font-semibold underline">
        {news.title}
      </Link>
      <p className="text-sm text-slate-600">{news.summary}</p>
      <p className="text-sm text-slate-500">
        {news.island} · {TYPE_LABELS[news.type]} · Prioridad {PRIORITY_LABELS[news.priority]} · {NEWS_STATUS_LABELS[news.status]}
      </p>
    </li>
  )
}

export default NewsCard
