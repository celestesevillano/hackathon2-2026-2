import type { NewsItem } from '../types/api'

interface NewsCardProps {
  news: NewsItem
}

function NewsCard({ news }: NewsCardProps) {
  return (
    <li className="rounded border p-3">
      <p className="font-semibold">{news.title}</p>
      <p className="text-sm text-slate-600">{news.summary}</p>
      <p className="text-sm text-slate-500">{news.island} · {news.status}</p>
    </li>
  )
}

export default NewsCard
