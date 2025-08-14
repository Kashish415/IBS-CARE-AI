import React, { useState } from 'react'
import { User, Mail, Clock, Shield, Download, Trash2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { useLogs } from '../hooks/useLogs'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  timezone: z.string()
})

type ProfileForm = z.infer<typeof profileSchema>

const timezones = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney'
]

export function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth()
  const { logs } = useLogs()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      timezone: profile?.timezone || 'Asia/Kolkata'
    }
  })

  const onSubmit = async (data: ProfileForm) => {
    setIsUpdating(true)
    try {
      await updateProfile(data)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExportData = () => {
    const exportData = {
      profile: {
        email: user?.email,
        full_name: profile?.full_name,
        timezone: profile?.timezone,
        created_at: profile?.created_at
      },
      logs: logs.map(log => ({
        date: log.log_date,
        mood: log.mood,
        energy: log.energy,
        symptom_severity: log.symptom_severity,
        symptoms: log.symptoms,
        sleep_hours: log.sleep_hours,
        water_ml: log.water_ml,
        meals: log.meals,
        notes: log.notes,
        created_at: log.created_at
      })),
      exported_at: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ibs-care-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDeleteAccount = async () => {
    if (showDeleteConfirm) {
      try {
        // In a real app, you would call an API to delete the account
        // For now, we'll just sign out
        await signOut()
        alert('Account deletion requested. You have been signed out.')
      } catch (error) {
        console.error('Error during account deletion:', error)
        alert('There was an error processing your request. Please try again.')
      }
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 10000) // Reset after 10 seconds
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account information, privacy settings, and data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      {...register('full_name')}
                      aria-invalid={errors.full_name ? 'true' : 'false'}
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-600">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      {...register('timezone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  <Button type="submit" disabled={isUpdating}>
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy & Data
                </CardTitle>
                <CardDescription>
                  Manage your data and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Data Usage</h4>
                  <p className="text-sm text-blue-800">
                    Your health data is used to provide personalized AI insights. We never share your personal 
                    health information with third parties. All data is encrypted and stored securely.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-900 mb-2">AI Processing</h4>
                  <p className="text-sm text-green-800">
                    Your logs are processed by our AI to provide personalized recommendations. 
                    This processing happens securely and your data remains private.
                  </p>
                </div>

                <Button onClick={handleExportData} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export All My Data
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <Trash2 className="h-5 w-5 mr-2" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that will permanently affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-800 mb-3">
                    This will permanently delete your account and all associated data. 
                    This action cannot be undone.
                  </p>
                  <Button
                    onClick={handleDeleteAccount}
                    variant="destructive"
                    size="sm"
                  >
                    {showDeleteConfirm ? 'Click Again to Confirm' : 'Delete Account'}
                  </Button>
                  {showDeleteConfirm && (
                    <p className="text-xs text-red-600 mt-2">
                      Click the button again within 10 seconds to confirm deletion.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {profile?.created_at 
                        ? new Date(profile.created_at).toLocaleDateString()
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Total Logs</p>
                    <p className="text-sm text-gray-600">{logs.length} entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/logs'}>
                  Add New Log
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/chat'}>
                  Chat with AI
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/history'}>
                  View History
                </Button>
                <Button variant="outline" className="w-full" onClick={signOut}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}