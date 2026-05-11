import { getTasks, createTask } from '../../lib/notion'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const tasks = await getTasks()
      return res.status(200).json(tasks)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch tasks' })
    }
  }

  if (req.method === 'POST') {
    const { name, class: className, dueDate, priority, notes } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required' })
    try {
      const task = await createTask({ name, className, dueDate, priority, notes })
      return res.status(201).json(task)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create task' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
