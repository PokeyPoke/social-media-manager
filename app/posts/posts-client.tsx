'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Filter, Search, Calendar, AlertCircle, CheckCircle, Clock, X } from 'lucide-react'

interface Post {
  id: string
  status: string
  createdAt: string
  scheduledTime?: string
  aiGeneratedContent: {
    text: string
    hashtags?: string[]
  }
  campaign: {
    name: string
    company: {
      name: string
    }
  }
  approvals: Array<{
    action: string
    notes?: string
    user: {
      name: string
    }
    timestamp: string
  }>
}

export default function PostsClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [statusFilter])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/posts?${params}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      setPosts(data.data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'APPROVED':
      case 'SCHEDULED':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'POSTED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'POSTED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleApprove = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'APPROVED' })
      })

      if (!response.ok) {
        throw new Error('Failed to approve post')
      }

      // Refresh posts
      fetchPosts()
    } catch (error) {
      console.error('Error approving post:', error)
      alert('Failed to approve post')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.campaign.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.aiGeneratedContent.text.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Review and manage all social media posts
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="POSTED">Posted</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'all' 
                  ? 'No posts have been created yet.' 
                  : `No posts with status "${statusFilter.replace('_', ' ').toLowerCase()}".`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(post.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                          {post.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {post.campaign.company.name} • {post.campaign.name}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-900 whitespace-pre-wrap">{post.aiGeneratedContent.text}</p>
                        {post.aiGeneratedContent.hashtags && post.aiGeneratedContent.hashtags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {post.aiGeneratedContent.hashtags.map((hashtag, index) => (
                              <span key={index} className="text-blue-600 text-sm">#{hashtag}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Created {new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.scheduledTime && (
                          <span>Scheduled for {new Date(post.scheduledTime).toLocaleString()}</span>
                        )}
                      </div>

                      {post.approvals.length > 0 && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Approvals</h4>
                          <div className="space-y-2">
                            {post.approvals.map((approval, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">{approval.user.name}</span>
                                <span className={`ml-2 ${approval.action === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {approval.action.toLowerCase()}
                                </span>
                                <span className="ml-2 text-gray-500">
                                  {new Date(approval.timestamp).toLocaleDateString()}
                                </span>
                                {approval.notes && (
                                  <p className="mt-1 text-gray-600 italic">{approval.notes}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <Link
                        href={`/posts/${post.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                      
                      {post.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => handleApprove(post.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}