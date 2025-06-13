'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Save, Target } from 'lucide-react'

interface Company {
  id: string
  name: string
  timezone: string
}

export default function CreateCampaignForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme: '',
    companyId: '',
    contentStrategy: {
      postFrequency: 'daily',
      postTimes: ['09:00'],
      contentTypes: ['promotional'],
      includeHashtags: true,
      includeEmojis: true,
      maxLength: 280
    },
    scheduleSettings: {
      timezone: 'UTC',
      activeDays: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: '09:00',
      endTime: '17:00'
    }
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create campaign')
      }

      const campaign = await response.json()
      router.push(`/campaigns/${campaign.campaign.id}`)
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert(error instanceof Error ? error.message : 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name.startsWith('contentStrategy.')) {
      const strategyKey = name.split('.')[1]
      if (strategyKey === 'postTimes') {
        setFormData(prev => ({
          ...prev,
          contentStrategy: {
            ...prev.contentStrategy,
            postTimes: value.split(',').map(t => t.trim())
          }
        }))
      } else if (strategyKey === 'contentTypes') {
        setFormData(prev => ({
          ...prev,
          contentStrategy: {
            ...prev.contentStrategy,
            contentTypes: value.split(',').map(t => t.trim())
          }
        }))
      } else if (type === 'checkbox') {
        const target = e.target as HTMLInputElement
        setFormData(prev => ({
          ...prev,
          contentStrategy: {
            ...prev.contentStrategy,
            [strategyKey]: target.checked
          }
        }))
      } else if (type === 'number') {
        setFormData(prev => ({
          ...prev,
          contentStrategy: {
            ...prev.contentStrategy,
            [strategyKey]: parseInt(value)
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          contentStrategy: {
            ...prev.contentStrategy,
            [strategyKey]: value
          }
        }))
      }
    } else if (name.startsWith('scheduleSettings.')) {
      const scheduleKey = name.split('.')[1]
      if (scheduleKey === 'activeDays') {
        // Handle multiple checkbox values for days
        const dayValue = parseInt(value)
        const target = e.target as HTMLInputElement
        setFormData(prev => ({
          ...prev,
          scheduleSettings: {
            ...prev.scheduleSettings,
            activeDays: target.checked 
              ? [...prev.scheduleSettings.activeDays, dayValue]
              : prev.scheduleSettings.activeDays.filter(d => d !== dayValue)
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          scheduleSettings: {
            ...prev.scheduleSettings,
            [scheduleKey]: value
          }
        }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value
    const selectedCompany = companies.find(c => c.id === companyId)
    
    setFormData(prev => ({
      ...prev,
      companyId,
      scheduleSettings: {
        ...prev.scheduleSettings,
        timezone: selectedCompany?.timezone || 'UTC'
      }
    }))
  }

  const days = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' }
  ]

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-gray-400 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Campaign Information</h2>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Holiday Season 2024"
                />
              </div>

              <div>
                <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
                  Company *
                </label>
                <select
                  name="companyId"
                  id="companyId"
                  required
                  value={formData.companyId}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe the campaign goals and approach"
              />
            </div>

            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                Campaign Theme
              </label>
              <input
                type="text"
                name="theme"
                id="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Product Launch, Brand Awareness, Customer Stories"
              />
            </div>
          </div>
        </div>

        {/* Content Strategy */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Content Strategy</h3>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contentStrategy.postFrequency" className="block text-sm font-medium text-gray-700">
                  Post Frequency
                </label>
                <select
                  name="contentStrategy.postFrequency"
                  id="contentStrategy.postFrequency"
                  value={formData.contentStrategy.postFrequency}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="contentStrategy.maxLength" className="block text-sm font-medium text-gray-700">
                  Max Post Length
                </label>
                <input
                  type="number"
                  name="contentStrategy.maxLength"
                  id="contentStrategy.maxLength"
                  min="100"
                  max="500"
                  value={formData.contentStrategy.maxLength}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contentStrategy.postTimes" className="block text-sm font-medium text-gray-700">
                Preferred Post Times
              </label>
              <input
                type="text"
                name="contentStrategy.postTimes"
                id="contentStrategy.postTimes"
                value={formData.contentStrategy.postTimes.join(', ')}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="09:00, 13:00, 17:00 (comma-separated)"
              />
            </div>

            <div>
              <label htmlFor="contentStrategy.contentTypes" className="block text-sm font-medium text-gray-700">
                Content Types
              </label>
              <input
                type="text"
                name="contentStrategy.contentTypes"
                id="contentStrategy.contentTypes"
                value={formData.contentStrategy.contentTypes.join(', ')}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="promotional, educational, engaging, announcement (comma-separated)"
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="contentStrategy.includeHashtags"
                  id="contentStrategy.includeHashtags"
                  checked={formData.contentStrategy.includeHashtags}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="contentStrategy.includeHashtags" className="ml-2 block text-sm text-gray-900">
                  Include hashtags
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="contentStrategy.includeEmojis"
                  id="contentStrategy.includeEmojis"
                  checked={formData.contentStrategy.includeEmojis}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="contentStrategy.includeEmojis" className="ml-2 block text-sm text-gray-900">
                  Include emojis
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Schedule Settings</h3>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="scheduleSettings.timezone" className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <input
                  type="text"
                  name="scheduleSettings.timezone"
                  id="scheduleSettings.timezone"
                  value={formData.scheduleSettings.timezone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="UTC"
                />
              </div>

              <div>
                <label htmlFor="scheduleSettings.startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  name="scheduleSettings.startTime"
                  id="scheduleSettings.startTime"
                  value={formData.scheduleSettings.startTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="scheduleSettings.endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  name="scheduleSettings.endTime"
                  id="scheduleSettings.endTime"
                  value={formData.scheduleSettings.endTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Active Days
              </label>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => (
                  <label key={day.value} className="flex items-center">
                    <input
                      type="checkbox"
                      name="scheduleSettings.activeDays"
                      value={day.value}
                      checked={formData.scheduleSettings.activeDays.includes(day.value)}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{day.label.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 flex justify-end space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}