import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import AddCompanyForm from './add-company-form'

export default async function AddCompanyPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Add Company</h1>
              <p className="mt-1 text-sm text-gray-500">
                Connect a new client company to manage their social media
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <AddCompanyForm />
      </main>
    </div>
  )
}