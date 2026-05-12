import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const DB = process.env.NOTION_DATABASE_ID

export async function getTasks() {
  const response = await notion.databases.query({
    database_id: DB,
    sorts: [
      { property: 'Due Date', direction: 'ascending' },
    ],
  })

  return response.results.map(pageToTask)
}

export async function getTasksByClass(className) {
  const response = await notion.databases.query({
    database_id: DB,
    filter: {
      property: 'Class',
      select: { equals: className },
    },
    sorts: [{ property: 'Due Date', direction: 'ascending' }],
  })

  return response.results.map(pageToTask)
}

export async function createTask({ name, className, dueDate, priority = 'Medium', notes = '' }) {
  const properties = {
    Name: {
      title: [{ text: { content: name } }],
    },
    Class: {
      select: { name: className },
    },
    Status: {
      select: { name: 'Not started' },
    },
    Priority: {
      select: { name: priority },
    },
  }

  if (dueDate) {
    properties['Due Date'] = {
      date: { start: dueDate },
    }
  }

  if (notes) {
    properties['Notes'] = {
      rich_text: [{ text: { content: notes } }],
    }
  }

  const response = await notion.pages.create({
    parent: { database_id: DB },
    properties,
  })

  return pageToTask(response)
}

export async function updateTaskStatus(pageId, status) {
  const response = await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: { select: { name: status } },
    },
  })
  return pageToTask(response)
}

export async function deleteTask(pageId) {
  await notion.pages.update({
    page_id: pageId,
    archived: true,
  })
}

function pageToTask(page) {
  const props = page.properties
  return {
    id: page.id,
    name: props.Name?.title?.[0]?.text?.content || 'Untitled',
    class: props.Class?.select?.name || null,
    status: props.Status?.select?.name || 'Not Started',
    priority: props.Priority?.select?.name || 'Medium',
    dueDate: props['Due Date']?.date?.start || null,
    notes: props.Notes?.rich_text?.[0]?.text?.content || '',
    createdAt: page.created_time,
  }
}
