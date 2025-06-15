import axios from 'axios'

async function testSimpleEndpoints() {
  const BASE_URL = 'https://social-media-manager-production.up.railway.app'
  
  console.log('Testing basic endpoints...\n')
  
  // 1. Health check
  try {
    const health = await axios.get(`${BASE_URL}/api/health/simple`)
    console.log('✅ Health check:', health.data)
  } catch (e: any) {
    console.log('❌ Health check failed:', e.message)
  }
  
  // 2. Environment check
  try {
    const env = await axios.get(`${BASE_URL}/api/debug/companies`)
    console.log('\n✅ Environment check:')
    console.log('   - Gemini Key:', env.data.environment.hasGeminiKey ? 'Present' : 'Missing')
    console.log('   - Encryption Key:', env.data.environment.hasEncryptionKey ? 'Present' : 'Missing')
  } catch (e: any) {
    console.log('\n❌ Environment check failed:', e.message)
  }
  
  // 3. Create user and test manual post
  try {
    console.log('\n3. Testing manual post creation...')
    
    // Register
    const reg = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: `manual-test-${Date.now()}@example.com`,
      password: 'Test123!',
      name: 'Manual Test'
    })
    const cookies = reg.headers['set-cookie']
    
    // Create company
    const company = await axios.post(`${BASE_URL}/api/companies`, {
      name: 'Manual Test Co',
      timezone: 'UTC',
      brandSettings: {
        voice: 'professional',
        tone: 'friendly',
        targetAudience: 'Everyone',
        contentThemes: ['test'],
        postingGuidelines: 'Be nice'
      }
    }, {
      headers: { Cookie: cookies.join('; ') }
    })
    
    // Create campaign
    const campaign = await axios.post(`${BASE_URL}/api/campaigns`, {
      name: 'Manual Campaign',
      companyId: company.data.company.id,
      theme: 'Testing',
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
    
    // Try manual post
    try {
      const manual = await axios.post(`${BASE_URL}/api/posts/manual`, {
        campaignId: campaign.data.campaign.id,
        content: {
          message: 'This is a manually created test post!',
          hashtags: ['test', 'manual'],
          tone: 'friendly'
        }
      }, {
        headers: { Cookie: cookies.join('; ') }
      })
      console.log('✅ Manual post created:', manual.data.message)
    } catch (e: any) {
      console.log('❌ Manual post failed:', e.response?.status, e.response?.data || e.message)
    }
    
  } catch (e: any) {
    console.log('❌ Setup failed:', e.response?.data || e.message)
  }
}

testSimpleEndpoints()