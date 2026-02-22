import { NextAuthOptions } from 'next-auth'
import RedditProvider from 'next-auth/providers/reddit'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    RedditProvider({
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isValid = await compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Store user id on initial sign in
      if (user) {
        token.id = user.id
      }
      
      // Persist Reddit OAuth tokens to token
      if (account?.provider === 'reddit') {
        token.redditAccessToken = account.access_token
        token.redditRefreshToken = account.refresh_token
        token.redditTokenExpiry = account.expires_at
        token.redditUsername = profile?.name || profile?.sub
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // Add Reddit tokens to session
        session.redditAccessToken = token.redditAccessToken as string | undefined
        session.redditRefreshToken = token.redditRefreshToken as string | undefined
        session.redditUsername = token.redditUsername as string | undefined
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Store Reddit account tokens when signing in with Reddit
      if (account?.provider === 'reddit' && account.access_token) {
        const redditUsername = profile?.name || profile?.sub || 'unknown'
        
        // Check if Reddit account already exists for this user
        const existingAccount = await prisma.redditAccount.findFirst({
          where: {
            userId: user.id,
            redditId: account.providerAccountId,
          },
        })
        
        if (!existingAccount) {
          // Create new Reddit account entry
          await prisma.redditAccount.create({
            data: {
              userId: user.id,
              redditId: account.providerAccountId,
              username: redditUsername,
              accessToken: account.access_token,
              refreshToken: account.refresh_token || '',
              isActive: true,
            },
          })
        } else {
          // Update existing Reddit account tokens
          await prisma.redditAccount.update({
            where: { id: existingAccount.id },
            data: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token || existingAccount.refreshToken,
            },
          })
        }
      }
      return true
    },
  },
}
