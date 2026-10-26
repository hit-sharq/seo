import dynamic from 'next/dynamic'

const KeywordsClient = dynamic(
  () => import('./_keywords-client'),
  { ssr: false, loading: () => <div className="p-6 animate-pulse h-64 bg-gray-100 rounded-lg" /> }
)

export default function KeywordsPage() {
  return <KeywordsClient />
}
