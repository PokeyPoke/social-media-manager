import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  }
  
  try {
    // Test 1: Check environment variable
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    results.tests.apiKeyExists = !!apiKey
    results.tests.apiKeyLength = apiKey?.length || 0
    results.tests.apiKeyPreview = apiKey ? `${apiKey.substring(0, 10)}...` : 'missing'
    
    if (!apiKey) {
      results.tests.error = 'API key not found in environment'
      return NextResponse.json(results)
    }
    
    // Test 2: Initialize client
    try {
      const client = new GoogleGenAI({ apiKey })
      results.tests.clientInitialized = true
      
      // Test 3: Make a simple request
      try {
        const response = await client.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: 'Say hello in exactly 3 words'
        })
        
        results.tests.requestSuccess = true
        results.tests.responseText = response.text || 'no text'
        results.tests.responseLength = response.text ? response.text.length : 0
      } catch (requestError: any) {
        results.tests.requestError = {
          message: requestError.message,
          name: requestError.name,
          status: requestError.status,
          statusText: requestError.statusText
        }
      }
    } catch (clientError: any) {
      results.tests.clientError = {
        message: clientError.message,
        name: clientError.name
      }
    }
  } catch (error: any) {
    results.tests.generalError = {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3)
    }
  }
  
  return NextResponse.json(results)
}