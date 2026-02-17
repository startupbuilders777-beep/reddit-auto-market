// Reddit automation worker - stubbed for build
// TODO: Fix after

export async function runCampaignAutomation() {
  console.log('Automation worker stubbed')
  return { success: true, processed: 0 }
}

export interface CampaignTask {
  id: string
  campaignId: string
}
