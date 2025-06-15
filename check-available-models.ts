// Check which Gemini models are available
async function checkAvailableModels() {
  console.log('Checking available Gemini models...\n')
  
  const models = [
    'gemini-2.0-flash',
    'gemini-1.5-flash', 
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-pro-vision'
  ]
  
  console.log('Testing model endpoints (without API key):')
  console.log('This will show which models exist\n')
  
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'test' }]
            }]
          })
        }
      )
      
      if (response.status === 400) {
        // API key error means model exists
        console.log(`✅ ${model} - Model exists (API key required)`)
      } else if (response.status === 404) {
        console.log(`❌ ${model} - Model not found`)
      } else {
        console.log(`❓ ${model} - Status: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ ${model} - Network error`)
    }
  }
  
  console.log('\nBased on Google\'s documentation:')
  console.log('- gemini-pro: Available (60 QPM free tier)')
  console.log('- gemini-1.5-flash: Available (15 QPM free tier, 1M tokens/minute)')
  console.log('- gemini-2.0-flash: May require waitlist or specific access')
  console.log('\nRecommendation: Use gemini-1.5-flash for best free tier limits')
}

checkAvailableModels()