'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Shield, Bell, Key, Save } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface SettingsClientProps {
  user: User
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    role: user.role
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState({
    emailOnApproval: true,
    emailOnPosted: false,
    emailOnFailed: true,
    weeklyDigest: true
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'api', name: 'API Keys', icon: Key }
  ]

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real app, this would call /api/user/profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    setLoading(true)

    try {
      // In a real app, this would call /api/user/password
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Password updated successfully!')
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real app, this would call /api/user/notifications
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Notification preferences updated!')
    } catch (error) {
      console.error('Error updating notifications:', error)
      alert('Failed to update notification preferences')
    } finally {
      setLoading(false)
    }
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
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account and platform preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          activeTab === tab.id
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.name}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        id="role"
                        value={profileData.role}
                        disabled
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">Contact an administrator to change your role</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit} className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <form onSubmit={handleNotificationSubmit} className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="emailOnApproval" className="text-sm font-medium text-gray-700">
                          Email when posts need approval
                        </label>
                        <p className="text-sm text-gray-500">Get notified when posts are pending your approval</p>
                      </div>
                      <input
                        type="checkbox"
                        name="emailOnApproval"
                        id="emailOnApproval"
                        checked={notifications.emailOnApproval}
                        onChange={(e) => setNotifications(prev => ({ ...prev, emailOnApproval: e.target.checked }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="emailOnPosted" className="text-sm font-medium text-gray-700">
                          Email when posts are published
                        </label>
                        <p className="text-sm text-gray-500">Get notified when posts go live on social media</p>
                      </div>
                      <input
                        type="checkbox"
                        name="emailOnPosted"
                        id="emailOnPosted"
                        checked={notifications.emailOnPosted}
                        onChange={(e) => setNotifications(prev => ({ ...prev, emailOnPosted: e.target.checked }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="emailOnFailed" className="text-sm font-medium text-gray-700">
                          Email when posts fail
                        </label>
                        <p className="text-sm text-gray-500">Get notified when scheduled posts fail to publish</p>
                      </div>
                      <input
                        type="checkbox"
                        name="emailOnFailed"
                        id="emailOnFailed"
                        checked={notifications.emailOnFailed}
                        onChange={(e) => setNotifications(prev => ({ ...prev, emailOnFailed: e.target.checked }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="weeklyDigest" className="text-sm font-medium text-gray-700">
                          Weekly performance digest
                        </label>
                        <p className="text-sm text-gray-500">Receive a weekly summary of all activity</p>
                      </div>
                      <input
                        type="checkbox"
                        name="weeklyDigest"
                        id="weeklyDigest"
                        checked={notifications.weeklyDigest}
                        onChange={(e) => setNotifications(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">API Configuration</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Key className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            API Keys Management
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              API key management is currently handled through environment variables. 
                              Contact your system administrator to update:
                            </p>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                              <li>Facebook App credentials</li>
                              <li>Google Gemini AI API key</li>
                              <li>Database connection strings</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Current Integration Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Facebook Integration</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Connected
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Google Gemini AI</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Connected
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Database</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Connected
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}