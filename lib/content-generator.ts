// Simple content generator that always works
import { GeneratedContent, ContentGenerationRequest } from './gemini'
import { generateFallbackContent, generateMultipleFallbackContent } from './content-templates'

class ContentGenerator {
  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    // Always use templates for now
    console.log('Generating content using templates')
    
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
      message = message + '\n\n' + request.customInstructions
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
      generationMethod: 'template'
    }
  }

  async generateMultipleVariations(
    request: ContentGenerationRequest,
    count: number = 3
  ): Promise<GeneratedContent[]> {
    console.log(`Generating ${count} content variations using templates`)
    
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
        message = message + '\n\n' + request.customInstructions
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
        generationMethod: 'template'
      }
    })
  }

  async testConnection(): Promise<boolean> {
    return true // Always available
  }
}

export const contentGenerator = new ContentGenerator()