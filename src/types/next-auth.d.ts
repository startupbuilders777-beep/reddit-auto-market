import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
    redditAccessToken?: string | undefined
    redditRefreshToken?: string | undefined
    redditUsername?: string | undefined
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    redditAccessToken?: string
    redditRefreshToken?: string
    redditTokenExpiry?: number
    redditUsername?: string
  }
}
