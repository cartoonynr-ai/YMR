import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env', 'utf-8')
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim()
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim()

const supabase = createClient(url, key)

const { data: order, error: orderErr } = await supabase
  .from('orders')
  .select('*')
  .eq('order_number', 'OR-111026-0002')
  .single()

console.log('ORDER:', JSON.stringify(order, null, 2))
if (orderErr) console.log('ORDER ERROR:', orderErr)

if (order) {
  const { data: moves, error: moveErr } = await supabase
    .from('stock_movements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  console.log('RECENT MOVEMENTS:', JSON.stringify(moves, null, 2))
  if (moveErr) console.log('MOVE ERROR:', moveErr)
}
