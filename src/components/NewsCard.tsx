import type { NewsItem } from '../types/api'

interface NewsCardProps {
  news: NewsItem
}

function NewsCard({ news }: NewsCardProps) {
  return <li className="rounded border p-3">{news.title}</li>
}

export default NewsCard
