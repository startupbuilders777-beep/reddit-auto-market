import Link from 'next/link'
import { MessageSquare, TrendingUp, Zap, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Automate Your Reddit Marketing
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            AI-powered tool that finds relevant posts and generates contextual comments 
            to grow your app&apos;s visibility. Save 20+ hours/week.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/api/auth/signin" 
              className="bg-reddit hover:bg-redditDark text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Start Free Trial
            </Link>
            <Link 
              href="#features" 
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<MessageSquare className="w-8 h-8" />}
              title="Find Posts"
              description="Automatically search Reddit for posts matching your keywords and target subreddits."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Generate Comments"
              description="AI creates contextual, helpful comments that don't feel like spam."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8" />}
              title="Post Automatically"
              description="Schedule and post comments while respecting Reddit's rate limits."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8" />}
              title="Track Results"
              description="Monitor engagement, upvotes, and conversions from your campaigns."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              name="Starter"
              price="$29"
              features={['1 Reddit Account', '3 Campaigns', '100 comments/month', 'Basic Analytics']}
            />
            <PricingCard 
              name="Pro"
              price="$79"
              popular
              features={['5 Reddit Accounts', 'Unlimited Campaigns', '1000 comments/month', 'Advanced Analytics', 'AI Templates']}
            />
            <PricingCard 
              name="Agency"
              price="$199"
              features={['Unlimited Accounts', 'Unlimited Campaigns', 'Unlimited comments', 'White Label', 'Priority Support']}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 RedditAutoMarket. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
      <div className="text-reddit mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function PricingCard({ name, price, features, popular }: { name: string; price: string; features: string[]; popular?: boolean }) {
  return (
    <div className={`bg-white p-8 rounded-xl ${popular ? 'ring-2 ring-reddit shadow-lg' : 'border border-gray-200'} relative`}>
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-reddit text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <div className="text-4xl font-bold mb-6">{price}<span className="text-lg text-gray-500 font-normal">/mo</span></div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="text-gray-600 flex items-center gap-2">
            <span className="text-green-500">✓</span> {feature}
          </li>
        ))}
      </ul>
      <Link href="/api/auth/signin" className={`block text-center py-3 rounded-lg font-semibold ${popular ? 'bg-reddit hover:bg-redditDark text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} transition`}>
        Get Started
      </Link>
    </div>
  )
}
