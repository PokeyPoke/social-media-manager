import axios from 'axios'

const BASE_URL = 'https://social-media-manager-production.up.railway.app'
const TEST_EMAIL = `test-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'

async function testManualContent() {
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
      name: 'Manual Test Company',
      timezone: 'UTC',
      brandSettings: {
        voice: 'professional',
        tone: 'friendly',
        targetAudience: 'Tech professionals',
        contentThemes: ['innovation'],
        postingGuidelines: 'Be helpful'
      }
    }, {
      headers: { Cookie: cookies.join('; ') }
    })
    const companyId = companyResponse.data.company.id
    console.log('✅ Company created:', companyId)

    console.log('\n3. Creating campaign...')
    const campaignResponse = await axios.post(`${BASE_URL}/api/campaigns`, {
      name: 'Manual Test Campaign',
      companyId: companyId,
      description: 'Testing manual content',
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

    console.log('\n4. Creating manual post...')
    const manualResponse = await axios.post(`${BASE_URL}/api/posts/manual`, {
      campaignId: campaignId,
      content: {
        message: "🚀 Exciting news! We're revolutionizing how businesses leverage AI for growth. Join us on this journey!",
        hashtags: ['AI', 'Innovation', 'TechNews'],
        tone: 'exciting'
      },
      status: 'DRAFT'
    }, {
      headers: { Cookie: cookies.join('; ') }
    })
    
    console.log('✅ Manual post created successfully!')
    console.log('Post ID:', manualResponse.data.post.id)
    console.log('Status:', manualResponse.data.post.status)
    console.log('Content:', manualResponse.data.post.aiGeneratedContent.message)

    // Test listing posts
    console.log('\n5. Listing posts...')
    const postsResponse = await axios.get(`${BASE_URL}/api/posts`, {
      headers: { Cookie: cookies.join('; ') }
    })
    console.log('✅ Total posts:', postsResponse.data.pagination.total)
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.response?.status, error.response?.statusText)
    console.error('Response:', error.response?.data)
  }
}

testManualContent()