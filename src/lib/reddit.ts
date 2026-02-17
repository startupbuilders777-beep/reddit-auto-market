import snoowrap from 'snoowrap'

export const RedditService = class RedditClient {
  private client: any

  constructor(config: any) {
    this.client = new snoowrap(config)
  }

  async getUser() {
    return await this.client.getUser().fetch()
  }

  async searchPosts(query: string, subreddits: string[], limit: number = 25) {
    const posts = []
    for (const subreddit of subreddits) {
      try {
        const results = await this.client.getSubreddit(subreddit).search({
          query,
          sort: 'relevance',
          time: 'month',
        })
        const arr = Array.isArray(results) ? results.slice(0, limit) : []
        for (const post of arr) {
          posts.push({
            id: post.id,
            title: post.title,
            selftext: post.selftext || '',
            author: post.author?.name || '[deleted]',
            subreddit: post.subreddit?.display_name || subreddit,
            url: post.url,
            score: post.score,
            numComments: post.num_comments,
            createdAt: new Date((post.created_utc || 0) * 1000),
            permalink: post.permalink,
          })
        }
      } catch (e) {
        console.error('Error searching', subreddit, e)
      }
    }
    return posts
  }

  async getPostComments(postId: string) {
    try {
      const post = await this.client.getSubmission(postId).fetch()
      const comments = await post.comments.fetchAll({ limit: 100 })
      return (comments || []).map((c: any) => ({
        id: c.id,
        body: c.body || '',
        author: c.author?.name || '[deleted]',
        score: c.score || 0,
        parentId: c.parent_id || '',
        createdAt: new Date(),
      }))
    } catch (e) {
      console.error('Error fetching comments', e)
      return []
    }
  }

  async postComment(postId: string, text: string) {
    const post = await this.client.getSubmission(postId).fetch()
    return await post.reply(text)
  }
}

export function createRedditClient(config: any) {
  return new RedditService(config)
}
