import { GoogleGenerativeAI } from '@google/generative-ai'

async function testGeminiKey(apiKey: string) {
  console.log('🧪 Testing Gemini API Key...\n')
  
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.log('❌ Please provide a valid API key')
    console.log('Usage: GEMINI_KEY=AIza... npx tsx test-gemini-key.ts')
    return
  }
  
  console.log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`)
  console.log(`Length: ${apiKey.length} characters\n`)
  
  try {
    // Test with gemini-2.0-flash (latest model)
    console.log('Testing gemini-2.0-flash model...')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    })
    
    // Test 1: Simple generation
    console.log('\n1. Testing simple generation...')
    const result1 = await model.generateContent('Say "Hello, API is working!"')
    const response1 = await result1.response
    console.log('✅ Response:', response1.text().substring(0, 50) + '...')
    
    // Test 2: Social media content
    console.log('\n2. Testing social media content generation...')
    const prompt = `Create a professional social media post for Facebook with these requirements:
    - Company: TechCorp
    - Topic: Benefits of AI for small businesses
    - Include 3 relevant hashtags
    - Tone: Professional but friendly
    - Length: Under 280 characters
    
    Format as JSON with fields: message, hashtags (array), tone`
    
    const result2 = await model.generateContent(prompt)
    const response2 = await result2.response
    const text = response2.text()
    
    console.log('✅ Generated content:')
    console.log(text.substring(0, 200) + '...')
    
    // Try to parse JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        console.log('\n✅ Parsed successfully:')
        console.log('Message:', parsed.message)
        console.log('Hashtags:', parsed.hashtags)
      }
    } catch (e) {
      console.log('\nℹ️ Response was not JSON, but generation worked!')
    }
    
    console.log('\n✅ SUCCESS! Your API key is working correctly.')
    console.log('\n📋 Next steps:')
    console.log('1. Add this key to Railway: GOOGLE_GEMINI_API_KEY=' + apiKey)
    console.log('2. Redeploy your application')
    console.log('3. Content generation will use real AI!')
    
  } catch (error: any) {
    console.log('\n❌ API Key Test Failed')
    console.log('Error:', error.message)
    
    if (error.message.includes('API key not valid')) {
      console.log('\n🔧 Fix: This API key is invalid. Please:')
      console.log('1. Go to https://makersuite.google.com/app/apikey')
      console.log('2. Create a new API key')
      console.log('3. Make sure to copy the entire key')
    } else if (error.message.includes('429')) {
      console.log('\n🔧 Fix: Rate limit exceeded. The key works but you\'ve hit limits.')
      console.log('This is actually good news - your key is valid!')
    }
  }
}

// Get API key from environment or command line
const apiKey = process.env.GEMINI_KEY || process.argv[2] || ''
testGeminiKey(apiKey)