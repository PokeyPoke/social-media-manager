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

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
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
    console.error('Direct Gemini API call failed:', error.message)
    throw error
  }
}