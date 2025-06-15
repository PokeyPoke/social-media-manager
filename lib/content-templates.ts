export interface ContentTemplate {
  message: string
  hashtags: string[]
  tone: string
}

export const contentTemplates = {
  promotional: [
    {
      message: "🚀 Exciting news! We're thrilled to announce {theme}. This is a game-changer for {audience}. Learn more about how we're revolutionizing {industry}!",
      hashtags: ["Innovation", "TechNews", "FutureIsNow"],
      tone: "exciting and professional"
    },
    {
      message: "⭐ Special offer alert! {theme} is now available for {audience}. Don't miss out on this opportunity to transform your {industry} experience.",
      hashtags: ["SpecialOffer", "LimitedTime", "Innovation"],
      tone: "urgent and engaging"
    },
    {
      message: "🎯 Ready to take your {industry} to the next level? Discover how {theme} can help {audience} achieve extraordinary results.",
      hashtags: ["Success", "Growth", "Innovation"],
      tone: "motivational and professional"
    }
  ],
  educational: [
    {
      message: "💡 Did you know? {theme} is transforming how {audience} approach {industry}. Here are 3 key insights you need to know...",
      hashtags: ["DidYouKnow", "Learning", "Insights"],
      tone: "informative and friendly"
    },
    {
      message: "📚 Quick tip for {audience}: When it comes to {theme}, remember these essential best practices in {industry}...",
      hashtags: ["TipTuesday", "BestPractices", "Learning"],
      tone: "helpful and authoritative"
    },
    {
      message: "🔍 Understanding {theme}: A comprehensive guide for {audience} looking to excel in {industry}. Here's what you need to know...",
      hashtags: ["Education", "Guide", "KnowledgeSharing"],
      tone: "educational and comprehensive"
    }
  ],
  engaging: [
    {
      message: "🤔 What's your biggest challenge with {theme}? Share your experience and let's discuss how {audience} can overcome obstacles in {industry}!",
      hashtags: ["Community", "Discussion", "ShareYourStory"],
      tone: "conversational and inclusive"
    },
    {
      message: "🎉 We love seeing how {audience} are using {theme} to innovate in {industry}! Tag us in your success stories!",
      hashtags: ["CommunityLove", "SuccessStories", "Innovation"],
      tone: "celebratory and encouraging"
    },
    {
      message: "💬 Poll time! How has {theme} impacted your work in {industry}? React with: 👍 Significantly | ❤️ Moderately | 🤔 Still learning",
      hashtags: ["Poll", "CommunityEngagement", "YourOpinion"],
      tone: "interactive and friendly"
    }
  ],
  announcement: [
    {
      message: "📢 Big announcement! We're excited to share {theme} with {audience}. This marks a new chapter in {industry}. Read more...",
      hashtags: ["Announcement", "News", "Milestone"],
      tone: "formal and exciting"
    },
    {
      message: "🎊 It's official! {theme} is here for {audience}. Thank you for being part of our journey in {industry}.",
      hashtags: ["LaunchDay", "ThankYou", "NewBeginnings"],
      tone: "grateful and professional"
    },
    {
      message: "⚡ Breaking: {theme} is now live! {audience} can now experience the future of {industry}. Get started today!",
      hashtags: ["Breaking", "NowLive", "GetStarted"],
      tone: "urgent and enthusiastic"
    }
  ]
}

export function generateFallbackContent(
  postType: 'promotional' | 'educational' | 'engaging' | 'announcement',
  theme: string,
  targetAudience: string,
  companyName: string,
  includeEmojis: boolean = true,
  includeHashtags: boolean = true
): ContentTemplate {
  const templates = contentTemplates[postType]
  const template = templates[Math.floor(Math.random() * templates.length)]
  
  // Replace placeholders
  let message = template.message
    .replace(/{theme}/g, theme)
    .replace(/{audience}/g, targetAudience)
    .replace(/{industry}/g, 'industry') // You could make this dynamic
    .replace(/{company}/g, companyName)
  
  // Remove emojis if not wanted
  if (!includeEmojis) {
    message = message.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()
  }
  
  // Add company-specific hashtags
  const hashtags = includeHashtags 
    ? [...template.hashtags, companyName.replace(/\s+/g, '')]
    : []
  
  return {
    message,
    hashtags,
    tone: template.tone
  }
}

export function generateMultipleFallbackContent(
  postType: 'promotional' | 'educational' | 'engaging' | 'announcement',
  theme: string,
  targetAudience: string,
  companyName: string,
  count: number = 3,
  includeEmojis: boolean = true,
  includeHashtags: boolean = true
): ContentTemplate[] {
  const results: ContentTemplate[] = []
  const usedTemplates = new Set<string>()
  
  for (let i = 0; i < count; i++) {
    let content: ContentTemplate
    let attempts = 0
    
    // Try to get unique templates
    do {
      content = generateFallbackContent(
        postType,
        theme,
        targetAudience,
        companyName,
        includeEmojis,
        includeHashtags
      )
      attempts++
    } while (usedTemplates.has(content.message) && attempts < 10)
    
    usedTemplates.add(content.message)
    results.push(content)
  }
  
  return results
}