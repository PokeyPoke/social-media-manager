import axios from 'axios'

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const TEST_EMAIL = `test-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'

interface TestResult {
  feature: string
  status: 'PASS' | 'FAIL'
  message: string
  error?: any
}

const results: TestResult[] = []

async function logResult(feature: string, status: 'PASS' | 'FAIL', message: string, error?: any) {
  const result = { feature, status, message, error }
  results.push(result)
  console.log(`${status === 'PASS' ? '✅' : '❌'} ${feature}: ${message}`)
  if (error) {
    console.error(`   Error: ${error.message || error}`)
  }
}

async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`)
    if (response.data.status === 'healthy') {
      await logResult('Health Check', 'PASS', 'API is healthy')
    } else {
      await logResult('Health Check', 'FAIL', 'API unhealthy', response.data)
    }
  } catch (error) {
    await logResult('Health Check', 'FAIL', 'Failed to reach API', error)
  }
}

async function testUserRegistration() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: 'Test User'
    })
    
    if (response.data.user) {
      await logResult('User Registration', 'PASS', 'User registered successfully')
      return response.headers['set-cookie']
    } else {
      await logResult('User Registration', 'FAIL', 'No user data returned')
    }
  } catch (error: any) {
    await logResult('User Registration', 'FAIL', 'Registration failed', error.response?.data || error)
  }
}

async function testUserLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
    
    if (response.data.user) {
      await logResult('User Login', 'PASS', 'Login successful')
      return response.headers['set-cookie']
    } else {
      await logResult('User Login', 'FAIL', 'No user data returned')
    }
  } catch (error: any) {
    await logResult('User Login', 'FAIL', 'Login failed', error.response?.data || error)
  }
}

async function testAuthenticatedEndpoint(cookies: string[]) {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Cookie: cookies.join('; ')
      }
    })
    
    if (response.data.user) {
      await logResult('Auth Check', 'PASS', 'Authentication working')
    } else {
      await logResult('Auth Check', 'FAIL', 'No user data in auth check')
    }
  } catch (error: any) {
    await logResult('Auth Check', 'FAIL', 'Auth check failed', error.response?.data || error)
  }
}

async function testCompanyCreation(cookies: string[]) {
  try {
    const response = await axios.post(`${BASE_URL}/api/companies`, {
      name: 'Test Company',
      timezone: 'UTC',
      brandSettings: {
        voice: 'professional',
        tone: 'friendly',
        targetAudience: 'Tech professionals aged 25-45',
        contentThemes: ['innovation', 'technology', 'productivity'],
        postingGuidelines: 'Always be helpful and informative'
      },
      defaultInstructions: 'Create engaging tech content'
    }, {
      headers: {
        Cookie: cookies.join('; ')
      }
    })
    
    if (response.data.company) {
      await logResult('Company Creation', 'PASS', 'Company created successfully')
      return response.data.company.id
    } else {
      await logResult('Company Creation', 'FAIL', 'No company data returned')
    }
  } catch (error: any) {
    await logResult('Company Creation', 'FAIL', 'Company creation failed', error.response?.data || error)
  }
}

async function testCompanyList(cookies: string[]) {
  try {
    const response = await axios.get(`${BASE_URL}/api/companies`, {
      headers: {
        Cookie: cookies.join('; ')
      }
    })
    
    if (response.data.companies && Array.isArray(response.data.companies)) {
      await logResult('Company List', 'PASS', `Found ${response.data.companies.length} companies`)
    } else {
      await logResult('Company List', 'FAIL', 'Invalid companies data')
    }
  } catch (error: any) {
    await logResult('Company List', 'FAIL', 'Failed to list companies', error.response?.data || error)
  }
}

async function testCampaignCreation(cookies: string[], companyId: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/campaigns`, {
      name: 'Test Campaign',
      companyId: companyId,
      description: 'Test campaign for automated testing',
      theme: 'Product Launch',
      contentStrategy: {
        postFrequency: 'daily',
        postTimes: ['09:00', '15:00'],
        contentTypes: ['promotional', 'educational'],
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
      headers: {
        Cookie: cookies.join('; ')
      }
    })
    
    if (response.data.campaign) {
      await logResult('Campaign Creation', 'PASS', 'Campaign created successfully')
      return response.data.campaign.id
    } else {
      await logResult('Campaign Creation', 'FAIL', 'No campaign data returned')
    }
  } catch (error: any) {
    await logResult('Campaign Creation', 'FAIL', 'Campaign creation failed', error.response?.data || error)
  }
}

async function testContentGeneration(cookies: string[], campaignId: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/content/generate`, {
      campaignId: campaignId,
      postType: 'educational',
      contentTheme: 'Technology and Innovation',
      customInstructions: 'Create a post about the benefits of automation',
      count: 1
    }, {
      headers: {
        Cookie: cookies.join('; ')
      }
    })
    
    if (response.data.posts && response.data.posts.length > 0) {
      await logResult('Content Generation', 'PASS', `Generated ${response.data.posts.length} posts`)
      return response.data.posts[0].id
    } else {
      await logResult('Content Generation', 'FAIL', 'No posts generated')
    }
  } catch (error: any) {
    await logResult('Content Generation', 'FAIL', 'Content generation failed', error.response?.data || error)
  }
}

async function testPostList(cookies: string[]) {
  try {
    const response = await axios.get(`${BASE_URL}/api/posts`, {
      headers: {
        Cookie: cookies.join('; ')
      }
    })
    
    if (response.data.data && Array.isArray(response.data.data)) {
      await logResult('Post List', 'PASS', `Found ${response.data.data.length} posts`)
    } else {
      await logResult('Post List', 'FAIL', 'Invalid posts data')
    }
  } catch (error: any) {
    await logResult('Post List', 'FAIL', 'Failed to list posts', error.response?.data || error)
  }
}

async function testPostApproval(cookies: string[], postId: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/posts/${postId}/approve`, {
      action: 'approve'
    }, {
      headers: {
        Cookie: cookies.join('; ')
      }
    })
    
    if (response.data.post && response.data.post.status === 'APPROVED') {
      await logResult('Post Approval', 'PASS', 'Post approved successfully')
    } else {
      await logResult('Post Approval', 'FAIL', 'Post not approved correctly')
    }
  } catch (error: any) {
    await logResult('Post Approval', 'FAIL', 'Post approval failed', error.response?.data || error)
  }
}

async function testAnalytics(cookies: string[]) {
  try {
    const response = await axios.get(`${BASE_URL}/api/analytics?days=30`, {
      headers: {
        Cookie: cookies.join('; ')
      }
    })
    
    if (response.data.totalPosts !== undefined && response.data.recentMetrics) {
      await logResult('Analytics', 'PASS', 'Analytics data retrieved successfully')
    } else {
      await logResult('Analytics', 'FAIL', 'Invalid analytics data')
    }
  } catch (error: any) {
    await logResult('Analytics', 'FAIL', 'Analytics retrieval failed', error.response?.data || error)
  }
}

async function testDebugEndpoint() {
  try {
    const response = await axios.get(`${BASE_URL}/api/debug/companies`)
    
    if (response.data.status === 'ok') {
      await logResult('Debug Endpoint', 'PASS', 'Environment configured correctly')
      console.log('   Environment check:', response.data.environment)
    } else {
      await logResult('Debug Endpoint', 'FAIL', 'Environment issues detected', response.data)
    }
  } catch (error: any) {
    await logResult('Debug Endpoint', 'FAIL', 'Debug endpoint failed', error.response?.data || error)
  }
}

async function testLogout(cookies: string[]) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
      headers: {
        Cookie: cookies.join('; ')
      }
    })
    
    if (response.data.message === 'Logged out successfully') {
      await logResult('Logout', 'PASS', 'Logout successful')
    } else {
      await logResult('Logout', 'FAIL', 'Unexpected logout response')
    }
  } catch (error: any) {
    await logResult('Logout', 'FAIL', 'Logout failed', error.response?.data || error)
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive feature tests...\n')
  console.log(`Testing URL: ${BASE_URL}`)
  console.log(`Test Email: ${TEST_EMAIL}\n`)
  
  // Basic health check
  await testHealthCheck()
  await testDebugEndpoint()
  
  // Authentication flow
  const registrationCookies = await testUserRegistration()
  const loginCookies = await testUserLogin()
  
  if (!loginCookies) {
    console.log('\n❌ Cannot continue tests without authentication')
    return
  }
  
  await testAuthenticatedEndpoint(loginCookies)
  
  // Company management
  const companyId = await testCompanyCreation(loginCookies)
  await testCompanyList(loginCookies)
  
  if (!companyId) {
    console.log('\n❌ Cannot continue tests without company')
    return
  }
  
  // Campaign and content
  const campaignId = await testCampaignCreation(loginCookies, companyId)
  
  if (!campaignId) {
    console.log('\n❌ Cannot continue tests without campaign')
    return
  }
  
  const postId = await testContentGeneration(loginCookies, campaignId)
  await testPostList(loginCookies)
  
  if (postId) {
    await testPostApproval(loginCookies, postId)
  }
  
  // Analytics
  await testAnalytics(loginCookies)
  
  // Cleanup
  await testLogout(loginCookies)
  
  // Summary
  console.log('\n📊 Test Summary:')
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`)
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.feature}: ${r.message}`)
    })
  }
}

// Run tests
runAllTests().catch(console.error)