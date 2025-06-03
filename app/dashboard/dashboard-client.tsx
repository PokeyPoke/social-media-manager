'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Calendar, BarChart3, Settings, LogOut, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Company {
  id: string
  name: string
  status: string
  campaigns: any[]
  _count: { campaigns: number }
}

interface Post {
  id: string
  status: string
  createdAt: string
  scheduledTime?: string
  campaign: {
    name: string
    company: {
      name: string
    }
  }
  approvals: any[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface DashboardClientProps {
  user: User
  companies: Company[]
  recentPosts: Post[]
}

export default function DashboardClient({ user, companies, recentPosts }: DashboardClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'POSTED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'POSTED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/companies/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Link>
              
              <button
                onClick={handleLogout}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {loading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Companies
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {companies.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Campaigns
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {companies.reduce((acc, company) => acc + company._count.campaigns, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Approval
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {recentPosts.filter(post => post.status === 'PENDING_APPROVAL').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Scheduled Posts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {recentPosts.filter(post => post.status === 'SCHEDULED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Companies Overview */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Companies
                </h3>
                <Link
                  href="/companies"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View all
                </Link>
              </div>
              
              {companies.length === 0 ? (
                <div className="text-center py-6">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No companies</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first company.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/companies/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Company
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {company.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {company._count.campaigns} campaigns
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {company.status}
                        </span>
                        <Link
                          href={`/companies/${company.id}`}
                          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Posts
                </h3>
                <Link
                  href="/posts"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View all
                </Link>
              </div>
              
              {recentPosts.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No posts</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create campaigns and generate content to see posts here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStatusIcon(post.status)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {post.campaign.company.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {post.campaign.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status.replace('_', ' ')}
                        </span>
                        <Link
                          href={`/posts/${post.id}`}
                          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/companies/new"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-200 rounded-lg hover:border-gray-300"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                      <Building2 className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">Add Company</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Connect a new client company and set up their social media presence.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/posts?status=PENDING_APPROVAL"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-200 rounded-lg hover:border-gray-300"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                      <AlertCircle className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">Review Posts</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Approve or edit AI-generated content before publishing.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/analytics"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-200 rounded-lg hover:border-gray-300"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                      <BarChart3 className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">View Analytics</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Track performance across all companies and campaigns.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/settings"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-200 rounded-lg hover:border-gray-300"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-gray-50 text-gray-700 ring-4 ring-white">
                      <Settings className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">Settings</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Configure your account and platform preferences.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}