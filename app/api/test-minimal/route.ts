import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  }
  
  try {
    // Test 1: Check if we can import the module
    results.tests.moduleImport = 'starting'
    const module = await import('@google/genai')
    results.tests.moduleImport = 'success'
    results.tests.moduleExports = Object.keys(module)
    
    // Test 2: Can we create an instance?
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 'test'
    results.tests.apiKeyLength = apiKey.length
    
    try {
      const { GoogleGenAI } = module
      const genAI = new GoogleGenAI({ apiKey })
      results.tests.instanceCreation = 'success'
      
      // Test 3: Can we make a simple request?
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: 'Say hello'
        })
        results.tests.modelCreation = 'success'
        results.tests.responseText = response.text ? response.text.substring(0, 50) : 'no text'
      } catch (modelError: any) {
        results.tests.modelCreation = {
          error: modelError.message,
          name: modelError.name
        }
      }
    } catch (instanceError: any) {
      results.tests.instanceCreation = {
        error: instanceError.message,
        name: instanceError.name
      }
    }
    
  } catch (importError: any) {
    results.tests.moduleImport = {
      error: importError.message,
      name: importError.name,
      stack: importError.stack?.split('\n').slice(0, 3)
    }
  }
  
  // Test 4: Check node version
  results.tests.nodeVersion = process.version
  results.tests.platform = process.platform
  
  return NextResponse.json(results)
}