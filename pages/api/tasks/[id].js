import { updateTaskStatus, deleteTask } from '../../../lib/notion'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PATCH') {
    const { status } = req.body
    if (!status) return res.status(400).json({ error: 'Status required' })
    try {
      const updated = await updateTaskStatus(id, status)
      return res.status(200).json(updated)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update task' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteTask(id)
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete task' })
    }
  }

  res.setHeader('Allow', ['PATCH', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
