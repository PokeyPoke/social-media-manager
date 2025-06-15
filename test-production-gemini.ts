import axios from 'axios'

const PROD_URL = 'https://social-media-manager-production.up.railway.app'

async function testProductionGemini() {
  console.log('🔍 Testing Gemini API in Production...\n')
  
  try {
    // First check environment
    console.log('1. Checking environment variables...')
    const envResponse = await axios.get(`${PROD_URL}/api/debug/companies`)
    const env = envResponse.data.environment
    console.log('   Gemini Key Present:', env.hasGeminiKey ? '✅' : '❌')
    console.log('   Encryption Key:', env.hasEncryptionKey ? '✅' : '❌')
    
    // Create test user
    console.log('\n2. Creating test user...')
    const testEmail = `gemini-test-${Date.now()}@example.com`
    const regResponse = await axios.post(`${PROD_URL}/api/auth/register`, {
      email: testEmail,
      password: 'TestPassword123!',
      name: 'Gemini Test'
    })
    const cookies = regResponse.headers['set-cookie']
    console.log('   ✅ User created')
    
    // Create company
    console.log('\n3. Creating test company...')
    const companyResponse = await axios.post(`${PROD_URL}/api/companies`, {
      name: 'Gemini Test Company',
      timezone: 'UTC',
      brandSettings: {
        voice: 'professional',
        tone: 'friendly',
        targetAudience: 'Business professionals',
        contentThemes: ['technology', 'innovation'],
        postingGuidelines: 'Be informative and engaging'
      }
    }, {
      headers: { Cookie: cookies.join('; ') }
    })
    console.log('   ✅ Company created:', companyResponse.data.company.id)
    
    // Create campaign
    console.log('\n4. Creating test campaign...')
    const campaignResponse = await axios.post(`${PROD_URL}/api/campaigns`, {
      name: 'Gemini Test Campaign',
      companyId: companyResponse.data.company.id,
      description: 'Testing Gemini AI content generation',
      theme: 'Technology Innovation',
      contentStrategy: {
        postFrequency: 'daily',
        postTimes: ['09:00', '15:00'],
        contentTypes: ['educational', 'promotional'],
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
    console.log('   ✅ Campaign created:', campaignResponse.data.campaign.id)
    
    // Test content generation
    console.log('\n5. Testing content generation...')
    console.log('   Sending request to generate content...')
    
    const contentResponse = await axios.post(`${PROD_URL}/api/content/generate`, {
      campaignId: campaignResponse.data.campaign.id,
      postType: 'educational',
      contentTheme: 'How AI is transforming business operations',
      customInstructions: 'Focus on practical benefits and real-world examples',
      count: 1
    }, {
      headers: { Cookie: cookies.join('; ') },
      timeout: 30000 // 30 second timeout
    })
    
    console.log('\n✅ SUCCESS! Content generated:')
    const post = contentResponse.data.posts[0]
    console.log('   Method:', post.aiGeneratedContent.generationMethod || 'ai')
    console.log('   Message:', post.aiGeneratedContent.message)
    console.log('   Hashtags:', post.aiGeneratedContent.hashtags)
    
    if (post.aiGeneratedContent.generationMethod === 'fallback') {
      console.log('\n⚠️  Using fallback templates (not AI)')
      console.log('   This means Gemini API is not working')
    } else {
      console.log('\n🎉 Using real AI generation!')
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.response?.status, error.response?.statusText)
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.error('Error:', error.message)
    }
    
    if (error.code === 'ECONNABORTED') {
      console.log('\n⏱️  Request timed out. The server might be processing but taking too long.')
    }
  }
}

testProductionGemini()