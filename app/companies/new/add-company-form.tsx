'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Save } from 'lucide-react'

export default function AddCompanyForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    facebookPageId: '',
    defaultInstructions: '',
    timezone: 'UTC',
    brandSettings: {
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
      tone: 'professional',
      targetAudience: '',
      keywords: ''
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          brandSettings: {
            ...formData.brandSettings,
            keywords: formData.brandSettings.keywords.split(',').map(k => k.trim()).filter(Boolean)
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create company')
      }

      const company = await response.json()
      router.push(`/companies/${company.id}`)
    } catch (error) {
      console.error('Error creating company:', error)
      alert(error instanceof Error ? error.message : 'Failed to create company')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('brandSettings.')) {
      const brandKey = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        brandSettings: {
          ...prev.brandSettings,
          [brandKey]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

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
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Company Information</h2>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <select
                name="timezone"
                id="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
          </div>

          {/* Facebook Integration */}
          <div>
            <label htmlFor="facebookPageId" className="block text-sm font-medium text-gray-700">
              Facebook Page ID
            </label>
            <input
              type="text"
              name="facebookPageId"
              id="facebookPageId"
              value={formData.facebookPageId}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Optional - can be configured later"
            />
            <p className="mt-1 text-sm text-gray-500">
              The Facebook Page ID for automated posting (optional)
            </p>
          </div>

          {/* Brand Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="brandSettings.tone" className="block text-sm font-medium text-gray-700">
                  Brand Tone
                </label>
                <select
                  name="brandSettings.tone"
                  id="brandSettings.tone"
                  value={formData.brandSettings.tone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="playful">Playful</option>
                </select>
              </div>

              <div>
                <label htmlFor="brandSettings.targetAudience" className="block text-sm font-medium text-gray-700">
                  Target Audience
                </label>
                <input
                  type="text"
                  name="brandSettings.targetAudience"
                  id="brandSettings.targetAudience"
                  value={formData.brandSettings.targetAudience}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Young professionals, Parents, Tech enthusiasts"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="brandSettings.keywords" className="block text-sm font-medium text-gray-700">
                Brand Keywords
              </label>
              <input
                type="text"
                name="brandSettings.keywords"
                id="brandSettings.keywords"
                value={formData.brandSettings.keywords}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="innovation, quality, sustainability (comma-separated)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Comma-separated keywords that represent the brand
              </p>
            </div>
          </div>

          {/* Default Instructions */}
          <div>
            <label htmlFor="defaultInstructions" className="block text-sm font-medium text-gray-700">
              Default Content Instructions
            </label>
            <textarea
              name="defaultInstructions"
              id="defaultInstructions"
              rows={4}
              value={formData.defaultInstructions}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Default instructions for AI content generation (e.g., always include a call-to-action, mention brand values, etc.)"
            />
            <p className="mt-1 text-sm text-gray-500">
              These instructions will be used for all AI content generation for this company
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-end space-x-3">
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
              {loading ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}