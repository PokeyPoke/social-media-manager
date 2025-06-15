import axios from 'axios'

const BASE_URL = 'https://social-media-manager-production.up.railway.app'
const TEST_EMAIL = `test-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'

async function testContentGeneration() {
  try {
    console.log('1. Registering user...')
    const regResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: 'Test User'
    })
    const cookies = regResponse.headers['set-cookie']
    console.log('✅ User registered')

    console.log('\n2. Creating company...')
    const companyResponse = await axios.post(`${BASE_URL}/api/companies`, {
      name: 'Test Company for Content',
      timezone: 'UTC',
      brandSettings: {
        voice: 'professional',
        tone: 'friendly',
        targetAudience: 'Tech professionals',
        contentThemes: ['innovation', 'technology'],
        postingGuidelines: 'Be helpful'
      }
    }, {
      headers: { Cookie: cookies.join('; ') }
    })
    const companyId = companyResponse.data.company.id
    console.log('✅ Company created:', companyId)

    console.log('\n3. Creating campaign...')
    const campaignResponse = await axios.post(`${BASE_URL}/api/campaigns`, {
      name: 'Test Campaign',
      companyId: companyId,
      description: 'Testing content generation',
      theme: 'Technology',
      contentStrategy: {
        postFrequency: 'daily',
        postTimes: ['09:00'],
        contentTypes: ['educational'],
        includeHashtags: true,
        includeEmojis: true,
        maxLength: 280
      },
      scheduleSettings: {
        timezone: 'UTC',
        activeDays: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '17:00'
      }
    }, {
      headers: { Cookie: cookies.join('; ') }
    })
    const campaignId = campaignResponse.data.campaign.id
    console.log('✅ Campaign created:', campaignId)

    console.log('\n4. Generating content...')
    const contentResponse = await axios.post(`${BASE_URL}/api/content/generate`, {
      campaignId: campaignId,
      postType: 'educational',
      contentTheme: 'AI and Technology Benefits',
      customInstructions: 'Create a post about AI benefits',
      count: 2
    }, {
      headers: { Cookie: cookies.join('; ') }
    })
    
    console.log('✅ Content generated successfully!')
    console.log('Generated posts:', contentResponse.data.posts.length)
    console.log('\nFirst post preview:')
    const firstPost = contentResponse.data.posts[0]
    console.log('- Status:', firstPost.status)
    console.log('- Content:', firstPost.aiGeneratedContent.message)
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.response?.status, error.response?.statusText)
    console.error('Response:', error.response?.data)
  }
}

testContentGeneration()