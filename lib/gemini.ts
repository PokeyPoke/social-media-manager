import { GoogleGenAI } from '@google/genai'
import { generateFallbackContent, generateMultipleFallbackContent } from './content-templates'

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
  generationMethod?: 'ai' | 'fallback' | 'template'
}

export class GeminiAI {
  private client: GoogleGenAI | null = null
  private useFallback: boolean = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    try {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY
      
      if (!apiKey || apiKey === 'your-api-key-here' || apiKey.length < 30) {
        console.warn('Valid Gemini API key not found, using fallback content generation')
        console.warn('To enable AI content generation:')
        console.warn('1. Get API key from: https://makersuite.google.com/app/apikey')
        console.warn('2. Set GOOGLE_GEMINI_API_KEY in Railway environment variables')
        this.useFallback = true
        return
      }

      this.client = new GoogleGenAI({ apiKey })
      console.log('Gemini AI initialized successfully with @google/genai')
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error)
      this.useFallback = true
    }
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    // Use fallback if Gemini is not available
    if (this.useFallback || !this.client) {
      return this.generateFallbackContent(request)
    }

    const prompt = this.buildPrompt(request)
    
    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      })
      
      const text = response.text || ''
      const content = this.parseResponse(text, request)
      return { ...content, generationMethod: 'ai' }
    } catch (error: any) {
      console.error('Gemini AI generation error:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      })
      
      // Check if it's a quota or rate limit error
      if (error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('limit')) {
        console.warn('Gemini API quota exceeded, using fallback content')
        return this.generateFallbackContent(request)
      }
      
      // Check for API key issues
      if (error.message?.includes('API key not valid') || error.message?.includes('API_KEY_INVALID')) {
        console.error('Gemini API key is invalid!')
        console.error('Please check your GOOGLE_GEMINI_API_KEY in Railway')
        this.useFallback = true
        return this.generateFallbackContent(request)
      }
      
      // For other errors, try fallback
      console.warn(`Gemini API error (${error.message}), using fallback content`)
      return this.generateFallbackContent(request)
    }
  }

  async generateMultipleVariations(
    request: ContentGenerationRequest, 
    count: number = 3
  ): Promise<GeneratedContent[]> {
    if (this.useFallback) {
      return this.generateMultipleFallbackContent(request, count)
    }

    try {
      const variations = await Promise.all(
        Array(count).fill(0).map(() => this.generateContent(request))
      )
      return variations
    } catch (error) {
      console.error('Failed to generate multiple variations:', error)
      return this.generateMultipleFallbackContent(request, count)
    }
  }

  async improveContent(
    originalContent: string,
    improvements: string[],
    brandContext: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    if (this.useFallback || !this.client) {
      // Simple improvement - just return the original with minor changes
      return {
        message: originalContent + '\n\n' + improvements.join(' '),
        hashtags: ['improved', 'content'],
        tone: brandContext.brandVoice,
        suggestedImagePrompt: `Image for ${brandContext.companyName}`,
        estimatedEngagement: 'medium',
        generationMethod: 'fallback'
      }
    }

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
      const response = await this.client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      })
      
      const text = response.text || ''
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
      console.warn('Failed to parse JSON response, using fallback parsing')
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
    if (this.useFallback) {
      return true // Fallback is always available
    }

    if (!this.client) {
      return false
    }

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'Test prompt: Say "Hello, API is working!"'
      })
      const text = response.text || ''
      return text.includes('Hello') || text.includes('working')
    } catch (error) {
      console.error('Gemini AI connection test failed:', error)
      return false
    }
  }

  private generateFallbackContent(request: ContentGenerationRequest): GeneratedContent {
    const template = generateFallbackContent(
      request.postType,
      request.contentTheme,
      request.targetAudience,
      request.companyName,
      request.includeEmojis,
      request.includeHashtags
    )

    // Apply custom instructions if provided
    let message = template.message
    if (request.customInstructions) {
      message += `\n\n${request.customInstructions}`
    }

    // Trim to max length if specified
    if (request.maxLength && message.length > request.maxLength) {
      message = message.substring(0, request.maxLength - 3) + '...'
    }

    return {
      message,
      hashtags: template.hashtags,
      suggestedImagePrompt: `Professional image for ${request.companyName} about ${request.contentTheme}`,
      tone: template.tone,
      estimatedEngagement: 'medium',
      generationMethod: 'fallback'
    }
  }

  private generateMultipleFallbackContent(
    request: ContentGenerationRequest,
    count: number
  ): GeneratedContent[] {
    const templates = generateMultipleFallbackContent(
      request.postType,
      request.contentTheme,
      request.targetAudience,
      request.companyName,
      count,
      request.includeEmojis,
      request.includeHashtags
    )

    return templates.map(template => {
      let message = template.message
      if (request.customInstructions) {
        message += `\n\n${request.customInstructions}`
      }

      if (request.maxLength && message.length > request.maxLength) {
        message = message.substring(0, request.maxLength - 3) + '...'
      }

      return {
        message,
        hashtags: template.hashtags,
        suggestedImagePrompt: `Professional image for ${request.companyName} about ${request.contentTheme}`,
        tone: template.tone,
        estimatedEngagement: 'medium' as const,
        generationMethod: 'fallback' as const
      }
    })
  }
}

export const geminiAI = new GeminiAI()