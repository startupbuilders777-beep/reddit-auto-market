import Link from 'next/link'
import { MessageSquare, TrendingUp, Zap, BarChart3, Shield, Clock, Users, Rocket } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-reddit focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800" aria-label="Main navigation">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-reddit">
            RedditAutoMarket
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-reddit transition">Features</Link>
            <Link href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-reddit transition">Pricing</Link>
            <Link 
              href="/api/auth/signin" 
              className="text-gray-600 dark:text-gray-300 hover:text-reddit transition"
            >
              Sign In
            </Link>
            <Link 
              href="/api/auth/signin" 
              className="bg-reddit hover:bg-redditDark text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-24" aria-labelledby="hero-heading">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">Now with GPT-4 powered responses</span>
          </div>
          <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Automate Your Reddit<br className="hidden md:block" /> Marketing with AI
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Find relevant posts, generate contextual comments, and grow your app&apos;s visibility. 
            Save 20+ hours every week while getting real results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/api/auth/signin" 
              className="bg-reddit hover:bg-redditDark text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link 
              href="#features" 
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200"
            >
              See How It Works
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Trusted by 500+ indie hackers and SaaS founders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Product Hunt</div>
            <div className="text-2xl font-bold text-gray-400">Indie Hackers</div>
            <div className="text-2xl font-bold text-gray-400">YC Alumni</div>
            <div className="text-2xl font-bold text-gray-400">10K+ Users</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white dark:bg-gray-950" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Scale Your Reddit Marketing
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Stop manually searching for posts and writing individual comments. 
              Let AI handle the heavy lifting while you focus on building your product.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageSquare className="w-8 h-8" />}
              title="Smart Post Discovery"
              description="Our AI scans Reddit for posts matching your keywords, target subreddits, and niche. Find the perfect opportunities automatically."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="AI Comment Generation"
              description="Generate contextual, helpful comments that don't feel like spam. Choose from multiple tones: helpful, casual, or professional."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8" />}
              title="Automatic Posting"
              description="Schedule and post comments while respecting Reddit's rate limits. Stay safe and avoid account bans."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8" />}
              title="Advanced Analytics"
              description="Track engagement, upvotes, clicks, and conversions. Know exactly what's working and optimize accordingly."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8" />}
              title="Account Protection"
              description="Built-in rate limiting, proxy rotation, and safe posting schedules keep your Reddit accounts in good standing."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Multi-Account Management"
              description="Manage unlimited Reddit accounts from one dashboard. Scale your outreach without lifting a finger."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50" aria-labelledby="how-it-works-heading">
        <div className="container mx-auto px-4">
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard 
              number="1"
              title="Connect Reddit"
              description="Link your Reddit account with OAuth. We'll never ask for your password."
            />
            <StepCard 
              number="2"
              title="Create Campaign"
              description="Set your target keywords, subreddits, and daily comment limits."
            />
            <StepCard 
              number="3"
              title="AI Does the Work"
              description="Our AI finds relevant posts and generates contextual comments for your approval."
            />
            <StepCard 
              number="4"
              title="Watch Results"
              description="See real-time analytics on engagement, traffic, and conversions."
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Indie Hackers Love RedditAutoMarket
              </h2>
              <div className="space-y-6">
                <BenefitItem 
                  icon={<Clock className="w-6 h-6" />}
                  title="Save 20+ Hours Per Week"
                  description="Automate the tedious task of finding posts and writing comments manually."
                />
                <BenefitItem 
                  icon={<Rocket className="w-6 h-6" />}
                  title="Get Real Traffic"
                  description="Contextual comments on relevant posts drive quality traffic to your product."
                />
                <BenefitItem 
                  icon={<Shield className="w-6 h-6" />}
                  title="Stay Safe"
                  description="Our smart algorithms ensure you never violate Reddit's rules or get banned."
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
              <div className="bg-white dark:bg-gray-950 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-reddit/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-reddit" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">This Month</div>
                    <div className="text-2xl font-bold">1,247 Comments Posted</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-500">+892</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Upvotes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">+234</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Clicks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">+47</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Signups</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900/50" aria-labelledby="pricing-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Start free, upgrade when you&apos;re ready. All plans include a 14-day free trial.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              name="Starter"
              price="$29"
              description="Perfect for testing the waters"
              features={[
                '1 Reddit Account',
                '3 Campaigns',
                '100 comments/month',
                'Basic Analytics',
                'Email Support'
              ]}
              cta="Start Free Trial"
              popular={false}
            />
            <PricingCard 
              name="Pro"
              price="$79"
              description="For serious marketers"
              features={[
                '5 Reddit Accounts',
                'Unlimited Campaigns',
                '1000 comments/month',
                'Advanced Analytics',
                'AI Templates',
                'Priority Support'
              ]}
              cta="Start Free Trial"
              popular={true}
            />
            <PricingCard 
              name="Agency"
              price="$199"
              description="For teams and agencies"
              features={[
                'Unlimited Accounts',
                'Unlimited Campaigns',
                'Unlimited comments',
                'White Label',
                'API Access',
                '24/7 Priority Support'
              ]}
              cta="Start Free Trial"
              popular={false}
            />
          </div>
          
          <p className="text-center mt-8 text-gray-500 dark:text-gray-400">
            All plans include: SSL security, 99.9% uptime, regular updates
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-reddit to-redditDark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Scale Your Reddit Marketing?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join 500+ founders who are already using AI to grow their audience on Reddit.
          </p>
          <Link 
            href="/api/auth/signin" 
            className="inline-block bg-white text-reddit hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Your Free Trial
          </Link>
          <p className="mt-4 text-sm text-white/70">
            No credit card required • 14 days free • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold text-white mb-4">RedditAutoMarket</div>
              <p className="text-gray-400 text-sm">
                AI-powered Reddit marketing tool for indie hackers and SaaS founders.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-reddit transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-reddit transition">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-reddit transition">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-reddit transition">Documentation</a></li>
                <li><a href="#" className="hover:text-reddit transition">Blog</a></li>
                <li><a href="#" className="hover:text-reddit transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-reddit transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-reddit transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © 2026 RedditAutoMarket. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-reddit dark:hover:border-reddit transition-colors">
      <div className="text-reddit mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-reddit text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  )
}

function BenefitItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-reddit/10 rounded-lg flex items-center justify-center text-reddit">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  )
}

function PricingCard({ 
  name, 
  price, 
  description,
  features, 
  cta,
  popular 
}: { 
  name: string; 
  price: string; 
  description: string;
  features: string[]; 
  cta: string;
  popular?: boolean 
}) {
  return (
    <div className={`bg-white dark:bg-gray-950 p-8 rounded-2xl ${popular ? 'ring-2 ring-reddit shadow-xl relative' : 'border border-gray-200 dark:border-gray-800'} transition-all hover:shadow-lg`}>
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-reddit text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-500 dark:text-gray-400">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link 
        href="/api/auth/signin" 
        className={`block text-center py-3 rounded-lg font-semibold transition-all ${popular ? 'bg-reddit hover:bg-redditDark text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'}`}
      >
        {cta}
      </Link>
    </div>
  )
}
