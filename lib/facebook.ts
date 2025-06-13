import axios from 'axios'
import { encrypt, decrypt } from './encryption'

const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v18.0'

export interface FacebookPage {
  id: string
  name: string
  access_token: string
  category: string
  tasks: string[]
}

export interface FacebookPost {
  message: string
  link?: string
  picture?: string
  scheduled_publish_time?: number
  published?: boolean
}

export interface FacebookPostResponse {
  id: string
  post_id?: string
}

export class FacebookAPI {
  private baseURL = FACEBOOK_GRAPH_URL

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await axios.get(`${this.baseURL}/oauth/access_token`, {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code
      }
    })

    return response.data.access_token
  }

  async getUserPages(userToken: string): Promise<FacebookPage[]> {
    const response = await axios.get(`${this.baseURL}/me/accounts`, {
      params: {
        access_token: userToken,
        fields: 'id,name,access_token,category,tasks'
      }
    })

    return response.data.data.filter((page: FacebookPage) => 
      page.tasks.includes('MANAGE') && page.tasks.includes('CREATE_CONTENT')
    )
  }

  async getPageInfo(pageId: string, pageToken: string) {
    const response = await axios.get(`${this.baseURL}/${pageId}`, {
      params: {
        access_token: pageToken,
        fields: 'id,name,category,fan_count,about,website'
      }
    })

    return response.data
  }

  async createPost(pageId: string, pageToken: string, post: FacebookPost): Promise<FacebookPostResponse> {
    const endpoint = post.scheduled_publish_time 
      ? `${this.baseURL}/${pageId}/feed`
      : `${this.baseURL}/${pageId}/feed`

    const data: any = {
      message: post.message,
      access_token: pageToken,
      published: post.published !== false
    }

    if (post.link) data.link = post.link
    if (post.picture) data.picture = post.picture
    if (post.scheduled_publish_time) {
      data.scheduled_publish_time = post.scheduled_publish_time
      data.published = false
    }

    const response = await axios.post(endpoint, data)
    return response.data
  }

  async getPostEngagement(postId: string, pageToken: string) {
    const response = await axios.get(`${this.baseURL}/${postId}`, {
      params: {
        access_token: pageToken,
        fields: 'id,message,created_time,permalink_url,likes.summary(true),comments.summary(true),shares'
      }
    })

    return {
      ...response.data,
      engagement: {
        likes: response.data.likes?.summary?.total_count || 0,
        comments: response.data.comments?.summary?.total_count || 0,
        shares: response.data.shares?.count || 0
      }
    }
  }

  async deletePost(postId: string, pageToken: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseURL}/${postId}`, {
        params: {
          access_token: pageToken
        }
      })
      return true
    } catch (error) {
      console.error('Failed to delete Facebook post:', error)
      return false
    }
  }

  encryptToken(token: string): string {
    return encrypt(token)
  }

  decryptToken(encryptedToken: string): string {
    return decrypt(encryptedToken)
  }

  async testConnection(pageId: string, token: string): Promise<boolean> {
    try {
      const pageInfo = await this.getPageInfo(pageId, token)
      return !!pageInfo.id
    } catch (error) {
      console.error('Facebook connection test failed:', error)
      return false
    }
  }
}

export const facebookAPI = new FacebookAPI()