import { NextResponse } from 'next/server'
import { runCampaignAutomation } from '@/lib/automation-worker'

// This endpoint should be protected by a secret token
// Call with: curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yoursite.com/api/cron/automation

export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Run the automation
    await runCampaignAutomation()

    return NextResponse.json({ success: true, message: 'Automation completed' })
  } catch (error) {
    console.error('Automation error:', error)
    return NextResponse.json(
      { error: 'Automation failed', details: String(error) },
      { status: 500 }
    )
  }
}

// Also allow GET for simple health checks
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Automation endpoint. Use POST to run.',
    lastUpdated: new Date().toISOString()
  })
}
