// Test Gemini 2.0 Flash directly
async function testGemini20Flash() {
  const apiKey = process.env.GEMINI_KEY || process.argv[2]
  
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.log('Please provide API key: GEMINI_KEY=AIza... npx tsx test-gemini-2.0-direct.ts')
    return
  }
  
  console.log('Testing Gemini 2.0 Flash API...\n')
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Write a short social media post about the benefits of AI for small businesses. Include 2-3 hashtags.'
            }]
          }]
        })
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ API Error:', response.status)
      console.error(JSON.stringify(error, null, 2))
      
      if (response.status === 404) {
        console.log('\n🔧 Model not found. Trying other models...')
        
        // Try gemini-1.5-flash
        console.log('\nTrying gemini-1.5-flash...')
        const response15 = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: 'Write a short social media post about AI benefits.'
                }]
              }]
            })
          }
        )
        
        if (response15.ok) {
          const data = await response15.json()
          console.log('✅ gemini-1.5-flash works!')
          console.log('Response:', data.candidates[0].content.parts[0].text.substring(0, 100) + '...')
        }
        
        // Try gemini-pro
        console.log('\nTrying gemini-pro...')
        const responsePro = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: 'Write a short social media post about AI benefits.'
                }]
              }]
            })
          }
        )
        
        if (responsePro.ok) {
          const data = await responsePro.json()
          console.log('✅ gemini-pro works!')
          console.log('Response:', data.candidates[0].content.parts[0].text.substring(0, 100) + '...')
        }
      }
      
      return
    }
    
    const data = await response.json()
    console.log('✅ Gemini 2.0 Flash works!')
    console.log('\nGenerated content:')
    console.log(data.candidates[0].content.parts[0].text)
    
  } catch (error: any) {
    console.error('❌ Request failed:', error.message)
  }
}

testGemini20Flash()