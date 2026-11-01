import { isAdmin, json, type Env, type RsvpRow } from '../../_lib'

const csvCell = (v: unknown) => {
  let s = v === null || v === undefined ? '' : String(v)
  // neutralise spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

const IST = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: 'unauthorized' }, 401, { 'WWW-Authenticate': 'Bearer' })

  const { results } = await env.DB.prepare(
    'SELECT id, name, attending, guests, message, lang, revision, created_at, updated_at FROM rsvps ORDER BY updated_at DESC',
  ).all<RsvpRow>()

  const rows = results ?? []
  const summary = {
    responses: rows.length,
    attending: rows.filter((r) => r.attending === 1).length,
    declined: rows.filter((r) => r.attending === 0).length,
    guests: rows.reduce((n, r) => n + (r.attending === 1 ? r.guests : 0), 0),
  }

  const format = new URL(request.url).searchParams.get('format')
  if (format === 'csv') {
    const header = ['Name', 'Attending', 'Guests', 'Message', 'Language', 'Times updated', 'First response (IST)', 'Last updated (IST)']
    const lines = [header.map(csvCell).join(',')]
    for (const r of rows) {
      lines.push(
        [r.name, r.attending ? 'Yes' : 'No', r.guests, r.message ?? '', r.lang === 'hi' ? 'Hindi' : 'English', r.revision - 1, IST(r.created_at), IST(r.updated_at)]
          .map(csvCell)
          .join(','),
      )
    }
    // BOM so Excel opens Devanagari correctly
    return new Response('﻿' + lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rsvps-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
      },
    })
  }

  return json({ ok: true, summary, rows })
}
