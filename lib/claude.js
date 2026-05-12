import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CLASS_NAMES = ['Chem', 'Honors Algebra II', 'Marketing', 'HELA 10', 'APUSH']

export async function parseTask(text) {
  const today = new Date().toISOString().split('T')[0]

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Today is ${today}. Parse this task description into structured fields.

Task: "${text}"

Return ONLY a valid JSON object with these fields:
- name: the task name (string, required)
- class: one of [${CLASS_NAMES.join(', ')}] or null if unclear
- dueDate: ISO date string (YYYY-MM-DD) or null if not mentioned
- priority: "Low", "Medium", or "High" (default "Medium")
- notes: any extra context (string, can be empty)

Examples:
"chem lab report due thursday" → {"name":"Lab Report","class":"Chem","dueDate":"${getNextWeekday(4)}","priority":"Medium","notes":""}
"finish apush leq by friday high priority" → {"name":"APUSH LEQ","class":"APUSH","dueDate":"${getNextWeekday(5)}","priority":"High","notes":""}
"math homework" → {"name":"Math Homework","class":"Math","dueDate":null,"priority":"Medium","notes":""}

Respond with only the JSON, no other text.`,
      },
    ],
  })

  const raw = message.content[0].text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  const parsed = JSON.parse(raw)

  return {
    name: parsed.name || text,
    class: CLASS_NAMES.includes(parsed.class) ? parsed.class : null,
    dueDate: parsed.dueDate || null,
    priority: ['Low', 'Medium', 'High'].includes(parsed.priority) ? parsed.priority : 'Medium',
    notes: parsed.notes || '',
  }
}

function getNextWeekday(targetDay) {
  const today = new Date()
  const current = today.getDay()
  let diff = targetDay - current
  if (diff <= 0) diff += 7
  const result = new Date(today)
  result.setDate(today.getDate() + diff)
  return result.toISOString().split('T')[0]
}
