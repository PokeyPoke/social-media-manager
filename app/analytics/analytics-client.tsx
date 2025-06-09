'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, TrendingUp, Users, Heart, MessageCircle, Share, Calendar } from 'lucide-react'

interface AnalyticsData {
  totalPosts: number
  totalEngagement: number
  averageEngagement: number
  topPerformingPost?: {
    id: string
    text: string
    engagement: number
    company: string
  }
  recentMetrics: Array<{
    date: string
    posts: number
    engagement: number
  }>
  companyBreakdown: Array<{
    company: string
    posts: number
    engagement: number
  }>
}

export default function AnalyticsClient() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      // Since we don't have real analytics data yet, let's simulate it
      // In a real app, this would fetch from /api/analytics
      
      setTimeout(() => {
        setAnalytics({
          totalPosts: 24,
          totalEngagement: 1847,
          averageEngagement: 76.9,
          topPerformingPost: {
            id: '1',
            text: 'Exciting news about our latest product launch! 🚀',
            engagement: 342,
            company: 'TechCorp'
          },
          recentMetrics: [
            { date: '2024-12-01', posts: 3, engagement: 156 },
            { date: '2024-12-02', posts: 2, engagement: 98 },
            { date: '2024-12-03', posts: 4, engagement: 203 },
            { date: '2024-12-04', posts: 1, engagement: 67 },
            { date: '2024-12-05', posts: 3, engagement: 189 },
            { date: '2024-12-06', posts: 2, engagement: 134 },
            { date: '2024-12-07', posts: 3, engagement: 178 }
          ],
          companyBreakdown: [
            { company: 'TechCorp', posts: 12, engagement: 892 },
            { company: 'RetailPlus', posts: 8, engagement: 634 },
            { company: 'FoodieDelight', posts: 4, engagement: 321 }
          ]
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/dashboard" className="mr-4 text-gray-400 hover:text-gray-600">
                  <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Analytics data will appear here once you have published posts.
            </p>
          </div>
        </main>
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
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track performance across all companies and campaigns
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Posts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {analytics.totalPosts}
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
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Engagement
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {analytics.totalEngagement.toLocaleString()}
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
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg. Engagement
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {analytics.averageEngagement}
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
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Engagement Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {((analytics.totalEngagement / analytics.totalPosts) / 10).toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Performance Over Time
              </h3>
              <div className="space-y-4">
                {analytics.recentMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(metric.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {metric.posts} posts
                        </div>
                        <div className="text-sm text-gray-500">
                          {metric.engagement} engagement
                        </div>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${(metric.engagement / 250) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Company Breakdown */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Performance by Company
              </h3>
              <div className="space-y-4">
                {analytics.companyBreakdown.map((company, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {company.company}
                      </div>
                      <div className="text-sm text-gray-500">
                        {company.posts} posts
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {company.engagement} total
                        </div>
                        <div className="text-sm text-gray-500">
                          {(company.engagement / company.posts).toFixed(1)} avg
                        </div>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(company.engagement / analytics.totalEngagement) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Post */}
        {analytics.topPerformingPost && (
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Top Performing Post
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2">{analytics.topPerformingPost.text}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{analytics.topPerformingPost.company}</span>
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4" />
                        <MessageCircle className="h-4 w-4" />
                        <Share className="h-4 w-4" />
                        <span className="font-medium">
                          {analytics.topPerformingPost.engagement} total engagement
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}