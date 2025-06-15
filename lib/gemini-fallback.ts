import { GeneratedContent, ContentGenerationRequest } from './gemini'
import { generateFallbackContent, generateMultipleFallbackContent } from './content-templates'

export class GeminiFallback {
  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    console.log('Using fallback content generation (Gemini unavailable)')
    return this.generateFallbackContent(request)
  }

  async generateMultipleVariations(
    request: ContentGenerationRequest, 
    count: number = 3
  ): Promise<GeneratedContent[]> {
    console.log(`Generating ${count} fallback content variations`)
    return this.generateMultipleFallbackContent(request, count)
  }

  async improveContent(
    originalContent: string,
    improvements: string[],
    brandContext: ContentGenerationRequest
  ): Promise<GeneratedContent> {
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

  async testConnection(): Promise<boolean> {
    return true // Fallback is always available
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

export const geminiFallback = new GeminiFallback()