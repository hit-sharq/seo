import dynamic from 'next/dynamic'

const DashboardClient = dynamic(
  () => import('./_dashboard-client'),
  { ssr: false, loading: () => <div className="p-6 animate-pulse h-64 bg-gray-100 rounded-lg" /> }
)

export default function Dashboard() {
  return <DashboardClient />
}
