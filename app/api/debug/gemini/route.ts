import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { withAuthenticatedMiddleware } from '@/lib/middleware'

export const GET = withAuthenticatedMiddleware(async (request: NextRequest, context?: any) => {
  const results = {
    apiKeyStatus: 'unknown',
    apiKeyLength: 0,
    modelStatus: 'unknown',
    testPromptStatus: 'unknown',
    error: null as any,
    timestamp: new Date().toISOString()
  }

  try {
    // Check API key
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      results.apiKeyStatus = 'missing'
      return NextResponse.json(results)
    }

    results.apiKeyStatus = 'present'
    results.apiKeyLength = apiKey.length

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    results.modelStatus = 'initialized'

    // Test with simple prompt
    const testPrompt = 'Respond with exactly: "API is working"'
    const result = await model.generateContent(testPrompt)
    const response = await result.response
    const text = response.text()
    
    results.testPromptStatus = text.includes('working') ? 'success' : 'unexpected_response'
    
    // Test content generation capability
    const contentTest = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: 'Generate a one-sentence social media post about technology.'
        }]
      }]
    })
    const contentResponse = await contentTest.response
    const contentText = contentResponse.text()
    
    return NextResponse.json({
      ...results,
      testResponse: text,
      contentTestResponse: contentText.substring(0, 100) + '...',
      fullStatus: 'operational'
    })

  } catch (error: any) {
    results.error = {
      message: error.message,
      name: error.name,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      details: error.details || error.response?.data
    }

    // Analyze specific error types
    if (error.message?.includes('API key not valid')) {
      results.apiKeyStatus = 'invalid'
    } else if (error.message?.includes('quota')) {
      results.apiKeyStatus = 'quota_exceeded'
    } else if (error.message?.includes('timeout')) {
      results.testPromptStatus = 'timeout'
    }

    return NextResponse.json(results, { status: 500 })
  }
})