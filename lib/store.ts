import fs from 'fs'
import path from 'path'
import { Item } from '@/types'

const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'items.json')

function isGitHubConfigured() {
  return !!(
    process.env.GITHUB_TOKEN &&
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_REPO
  )
}

// ── Local filesystem (dev) ──────────────────────────────────────────────────

function readLocal(): Item[] {
  if (!fs.existsSync(LOCAL_DATA_FILE)) {
    fs.mkdirSync(path.dirname(LOCAL_DATA_FILE), { recursive: true })
    fs.writeFileSync(LOCAL_DATA_FILE, '[]')
  }
  return JSON.parse(fs.readFileSync(LOCAL_DATA_FILE, 'utf-8'))
}

function writeLocal(items: Item[]): void {
  fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(items, null, 2))
}

// ── GitHub API (production) ─────────────────────────────────────────────────

const GITHUB_API = 'https://api.github.com'

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

function ghContentsUrl() {
  const { GITHUB_OWNER, GITHUB_REPO } = process.env
  return `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/items.json`
}

async function readGitHub(): Promise<Item[]> {
  const res = await fetch(ghContentsUrl(), {
    headers: ghHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) {
    if (res.status === 404) return []
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`)
  }
  const data = await res.json()
  const decoded = Buffer.from(data.content, 'base64').toString('utf-8')
  return JSON.parse(decoded)
}

async function writeGitHub(items: Item[]): Promise<void> {
  // Need the current file's SHA to update it
  const current = await fetch(ghContentsUrl(), {
    headers: ghHeaders(),
    cache: 'no-store',
  })
  const sha = current.ok ? (await current.json()).sha : undefined

  const content = Buffer.from(JSON.stringify(items, null, 2)).toString('base64')

  const res = await fetch(ghContentsUrl(), {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify({
      message: `Update reading list [${new Date().toISOString()}]`,
      content,
      sha,
    }),
  })

  if (!res.ok) {
    throw new Error(`GitHub write error ${res.status}: ${await res.text()}`)
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function getItems(): Promise<Item[]> {
  if (isGitHubConfigured()) return readGitHub()
  return readLocal()
}

export async function saveItems(items: Item[]): Promise<void> {
  if (isGitHubConfigured()) {
    await writeGitHub(items)
    return
  }
  writeLocal(items)
}
