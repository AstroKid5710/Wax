import { parseTask } from '../../lib/claude'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'Text is required' })

  try {
    const parsed = await parseTask(text)
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Parse error:', err)
    return res.status(500).json({ error: 'Failed to parse task' })
  }
}
