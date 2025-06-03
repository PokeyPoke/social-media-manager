import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ContentGenerationRequest {
  companyName: string
  brandVoice: string
  contentTheme: string
  targetAudience: string
  postType: 'promotional' | 'educational' | 'engaging' | 'announcement'
  includeHashtags: boolean
  includeEmojis: boolean
  maxLength?: number
  customInstructions?: string
}

export interface GeneratedContent {
  message: string
  hashtags: string[]
  suggestedImagePrompt?: string
  tone: string
  estimatedEngagement: 'low' | 'medium' | 'high'
}

export class GeminiAI {
  private client: GoogleGenerativeAI
  private model: any

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
    this.model = this.client.getGenerativeModel({ model: 'gemini-pro' })
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(request)
    
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return this.parseResponse(text, request)
    } catch (error) {
      console.error('Gemini AI generation error:', error)
      throw new Error('Failed to generate content')
    }
  }

  async generateMultipleVariations(
    request: ContentGenerationRequest, 
    count: number = 3
  ): Promise<GeneratedContent[]> {
    const variations = await Promise.all(
      Array(count).fill(0).map(() => this.generateContent(request))
    )
    
    return variations
  }

  async improveContent(
    originalContent: string,
    improvements: string[],
    brandContext: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    const prompt = `
    Improve the following social media post based on these specific requests:
    
    Original post: "${originalContent}"
    
    Improvement requests:
    ${improvements.map(imp => `- ${imp}`).join('\n')}
    
    Brand context:
    - Company: ${brandContext.companyName}
    - Brand voice: ${brandContext.brandVoice}
    - Target audience: ${brandContext.targetAudience}
    
    Please provide an improved version that addresses all the requests while maintaining the brand voice and appeal to the target audience.
    
    Format your response as JSON with these fields:
    {
      "message": "improved post content",
      "hashtags": ["relevant", "hashtags"],
      "suggestedImagePrompt": "description for image generation",
      "tone": "description of tone used",
      "estimatedEngagement": "low/medium/high"
    }
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return this.parseResponse(text, brandContext)
    } catch (error) {
      console.error('Content improvement error:', error)
      throw new Error('Failed to improve content')
    }
  }

  private buildPrompt(request: ContentGenerationRequest): string {
    return `
    Create a ${request.postType} social media post for Facebook with the following requirements:

    Company: ${request.companyName}
    Brand Voice: ${request.brandVoice}
    Content Theme: ${request.contentTheme}
    Target Audience: ${request.targetAudience}
    
    Requirements:
    - ${request.includeHashtags ? 'Include' : 'Do not include'} relevant hashtags
    - ${request.includeEmojis ? 'Include' : 'Do not include'} appropriate emojis
    - Maximum length: ${request.maxLength || 280} characters
    - Post type: ${request.postType}
    
    Additional instructions: ${request.customInstructions || 'None'}
    
    The post should be engaging, authentic, and drive meaningful interaction with the target audience.
    Ensure the content aligns perfectly with the brand voice and company values.
    
    Format your response as JSON with these exact fields:
    {
      "message": "the main post content",
      "hashtags": ["array", "of", "relevant", "hashtags"],
      "suggestedImagePrompt": "detailed description for image generation",
      "tone": "description of the tone used",
      "estimatedEngagement": "low/medium/high based on content quality"
    }
    
    Make sure the JSON is valid and complete.
    `
  }

  private parseResponse(text: string, request: ContentGenerationRequest): GeneratedContent {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          message: parsed.message || text,
          hashtags: parsed.hashtags || [],
          suggestedImagePrompt: parsed.suggestedImagePrompt,
          tone: parsed.tone || request.brandVoice,
          estimatedEngagement: parsed.estimatedEngagement || 'medium'
        }
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, using fallback')
    }

    // Fallback parsing if JSON extraction fails
    const lines = text.split('\n').filter(line => line.trim())
    const hashtags = lines
      .join(' ')
      .match(/#\w+/g) || []

    return {
      message: text.replace(/#\w+/g, '').trim(),
      hashtags: hashtags.map(tag => tag.substring(1)),
      suggestedImagePrompt: `Professional image for ${request.companyName} representing ${request.contentTheme}`,
      tone: request.brandVoice,
      estimatedEngagement: 'medium'
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Test prompt: Say "Hello, API is working!"')
      const response = await result.response
      const text = response.text()
      return text.includes('Hello') || text.includes('working')
    } catch (error) {
      console.error('Gemini AI connection test failed:', error)
      return false
    }
  }
}

export const geminiAI = new GeminiAI()