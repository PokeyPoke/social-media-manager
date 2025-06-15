import { GeneratedContent } from './gemini'

interface SimpleContentRequest {
  companyName: string
  contentTheme: string
  targetAudience: string
  postType: string
  includeHashtags: boolean
  customInstructions?: string
}

// Direct API call without SDK
export async function generateWithGeminiAPI(
  apiKey: string, 
  request: SimpleContentRequest
): Promise<GeneratedContent> {
  const prompt = `Create a ${request.postType} social media post for Facebook.

Company: ${request.companyName}
Topic: ${request.contentTheme}
Target Audience: ${request.targetAudience}
${request.customInstructions ? `Instructions: ${request.customInstructions}` : ''}
${request.includeHashtags ? 'Include 3-5 relevant hashtags' : 'Do not include hashtags'}

Requirements:
- Keep it under 280 characters
- Be engaging and professional
- Format as JSON with these fields:
{
  "message": "the post content",
  "hashtags": ["tag1", "tag2"],
  "tone": "describe the tone"
}`

  // Try multiple models in order
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro']
  let lastError: any = null
  
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        lastError = new Error(`${model}: ${error.error?.message || response.statusText}`)
        console.warn(`Model ${model} failed:`, lastError.message)
        continue // Try next model
      }

      // Success! Process the response
      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      console.log(`Successfully used model: ${model}`)
    
    // Try to parse JSON from response
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          message: parsed.message || generatedText,
          hashtags: parsed.hashtags || [],
          tone: parsed.tone || 'professional',
          suggestedImagePrompt: `Image for ${request.companyName} about ${request.contentTheme}`,
          estimatedEngagement: 'medium',
          generationMethod: 'ai'
        }
      }
    } catch (e) {
      // Fallback if JSON parsing fails
    }

      // Fallback parsing
      return {
        message: generatedText.substring(0, 280),
        hashtags: request.includeHashtags ? ['SocialMedia', 'Business', 'Innovation'] : [],
        tone: 'professional',
        suggestedImagePrompt: `Image for ${request.companyName} about ${request.contentTheme}`,
        estimatedEngagement: 'medium',
        generationMethod: 'ai'
      }
      
    } catch (error: any) {
      lastError = error
      console.warn(`Model ${model} error:`, error.message)
      // Continue to next model
    }
  }
  
  // All models failed
  console.error('All Gemini models failed:', lastError?.message)
  throw lastError || new Error('Failed to generate content with any Gemini model')
}