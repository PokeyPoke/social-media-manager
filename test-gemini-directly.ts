import { GoogleGenerativeAI } from '@google/generative-ai'

// Test Gemini API directly
async function testGeminiAPI() {
  console.log('Testing Gemini API directly...\n')
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    console.error('❌ GOOGLE_GEMINI_API_KEY not found in environment')
    return
  }
  
  console.log('✅ API Key found, length:', apiKey.length)
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    console.log('\nSending test prompt...')
    const result = await model.generateContent('Say "Hello, API is working!"')
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Gemini API Response:', text)
    
    // Test content generation
    console.log('\nTesting social media content generation...')
    const contentPrompt = `Create a professional social media post about the benefits of AI for businesses. Include 2-3 relevant hashtags.`
    
    const contentResult = await model.generateContent(contentPrompt)
    const contentResponse = await contentResult.response
    const contentText = contentResponse.text()
    
    console.log('✅ Generated Content:')
    console.log(contentText)
    
  } catch (error: any) {
    console.error('❌ Gemini API Error:', error.message)
    if (error.message.includes('API_KEY')) {
      console.error('   Issue: Invalid API key')
    } else if (error.message.includes('quota')) {
      console.error('   Issue: API quota exceeded')
    } else {
      console.error('   Full error:', error)
    }
  }
}

testGeminiAPI()