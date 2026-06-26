import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

type HealthResponse = {
  status: 'ok' | 'error'
  timestamp: string
  supabase?: 'connected' | 'disconnected'
  message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )
    // Simple query to verify connection
    const { error } = await supabase.from('profiles').select('id').limit(1)
    const dbStatus = error ? 'disconnected' : 'connected'
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase: dbStatus,
    })
  } catch (e) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: e instanceof Error ? e.message : 'Unknown error',
    })
  }
}
