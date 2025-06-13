import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import CreateCampaignForm from './create-campaign-form'

export default async function CreateCampaignPage() {
  const session = await getSession()
  
  if (!session.isLoggedIn) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
              <p className="mt-1 text-sm text-gray-500">
                Set up a new social media campaign for content generation
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <CreateCampaignForm />
      </main>
    </div>
  )
}