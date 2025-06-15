import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'

async function diagnoseGeminiAPI() {
  console.log('🔍 Diagnosing Gemini API Issues...\n')
  
  // Test with a sample API key format
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 'your-api-key-here'
  
  console.log('1. API Key Check:')
  console.log(`   - Length: ${apiKey.length} characters`)
  console.log(`   - Starts with: ${apiKey.substring(0, 8)}...`)
  console.log(`   - Format: ${apiKey.includes('AIza') ? '✅ Looks like valid Google API key' : '❌ Unusual format'}\n`)
  
  // Test direct API call
  console.log('2. Testing Direct API Call:')
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: 'Say hello'
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    console.log('   ✅ Direct API call successful')
    console.log(`   Response: ${response.data.candidates[0].content.parts[0].text.substring(0, 50)}...`)
  } catch (error: any) {
    console.log('   ❌ Direct API call failed')
    if (error.response) {
      console.log(`   Status: ${error.response.status}`)
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`)
      
      // Analyze specific errors
      if (error.response.status === 400 && error.response.data.error?.message?.includes('API key not valid')) {
        console.log('\n   🔧 Fix: Your API key is invalid. Please:')
        console.log('      1. Go to https://makersuite.google.com/app/apikey')
        console.log('      2. Create a new API key')
        console.log('      3. Update GOOGLE_GEMINI_API_KEY in Railway')
      } else if (error.response.status === 429) {
        console.log('\n   🔧 Fix: Rate limit exceeded. Please:')
        console.log('      1. Wait a few minutes')
        console.log('      2. Check quota at https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas')
      }
    } else {
      console.log(`   Network error: ${error.message}`)
    }
  }
  
  // Test with SDK
  console.log('\n3. Testing Google Generative AI SDK:')
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    console.log('   ✅ SDK initialized')
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    console.log('   ✅ Model loaded')
    
    const result = await model.generateContent('Say hello')
    const response = await result.response
    const text = response.text()
    console.log('   ✅ Content generated')
    console.log(`   Response: ${text.substring(0, 50)}...`)
  } catch (error: any) {
    console.log('   ❌ SDK generation failed')
    console.log(`   Error: ${error.message}`)
    
    // More specific error analysis
    if (error.message?.includes('fetch failed')) {
      console.log('\n   🔧 Fix: Network issue. Check if you can access Google APIs')
    }
  }
  
  // Test quota status
  console.log('\n4. Checking API Quotas:')
  console.log('   Visit: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas')
  console.log('   Check for:')
  console.log('   - Daily quota limit (usually 60 requests/day for free tier)')
  console.log('   - Per-minute limit (usually 60 requests/minute)')
  
  // Provide setup instructions
  console.log('\n📋 Complete Setup Instructions:')
  console.log('1. Get API Key:')
  console.log('   - Go to https://makersuite.google.com/app/apikey')
  console.log('   - Click "Create API key"')
  console.log('   - Copy the key (starts with AIza...)')
  console.log('\n2. Set in Railway:')
  console.log('   - Go to your Railway project')
  console.log('   - Variables tab')
  console.log('   - Set GOOGLE_GEMINI_API_KEY = your-key')
  console.log('   - Redeploy')
  
  console.log('\n5. Alternative: Use Gemini 1.5 Flash (Better limits):')
  console.log('   - Change model from "gemini-pro" to "gemini-1.5-flash"')
  console.log('   - 15,000 requests per day (vs 60)')
  console.log('   - 1,000 requests per minute (vs 60)')
}

// Run diagnostics
diagnoseGeminiAPI().catch(console.error)