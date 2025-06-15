import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  }
  
  try {
    // Check environment variable
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    results.checks.apiKeyExists = !!apiKey
    results.checks.apiKeyLength = apiKey?.length || 0
    results.checks.apiKeyFormat = apiKey?.startsWith('AIza') || false
    
    // Try direct fetch without SDK
    if (apiKey && apiKey !== 'your-gemini-api-key') {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: 'Say hello' }]
              }]
            })
          }
        )
        
        results.checks.directApiCall = {
          status: response.status,
          ok: response.ok
        }
        
        if (response.ok) {
          const data = await response.json()
          results.checks.directApiCall.success = true
          results.checks.directApiCall.responseLength = JSON.stringify(data).length
        } else {
          const error = await response.json()
          results.checks.directApiCall.error = error.error?.message || 'Unknown error'
        }
      } catch (fetchError: any) {
        results.checks.directApiCall = {
          error: fetchError.message,
          type: 'fetch_error'
        }
      }
    }
    
    // Try SDK import
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      results.checks.sdkImport = 'success'
      
      // Try SDK initialization
      if (apiKey && apiKey !== 'your-gemini-api-key') {
        try {
          const genAI = new GoogleGenerativeAI(apiKey)
          results.checks.sdkInit = 'success'
          
          // Try model creation
          try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
            results.checks.modelCreation = 'success'
            
            // Try generation
            try {
              const result = await model.generateContent('Say hello')
              const response = await result.response
              const text = response.text()
              results.checks.generation = {
                success: true,
                responseLength: text.length
              }
            } catch (genError: any) {
              results.checks.generation = {
                error: genError.message,
                stack: genError.stack?.split('\n').slice(0, 3)
              }
            }
          } catch (modelError: any) {
            results.checks.modelCreation = {
              error: modelError.message
            }
          }
        } catch (initError: any) {
          results.checks.sdkInit = {
            error: initError.message
          }
        }
      }
    } catch (importError: any) {
      results.checks.sdkImport = {
        error: importError.message,
        type: 'import_error'
      }
    }
    
    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({
      ...results,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 })
  }
}