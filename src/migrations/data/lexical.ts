/** Basit blok listesini (h2/h3/p/ul/ol/quote) Payload'un Lexical biçimine çevirir */
type Block = { type: 'h2' | 'h3' | 'p' | 'quote'; text: string } | { type: 'ul' | 'ol'; items: string[] }

const text = (t: string, format = 0) => ({ type: 'text', text: t, format, style: '', mode: 'normal', detail: 0, version: 1 })

/** **kalın** ve [metin](adres) işler */
function inline(src: string): unknown[] {
  const out: unknown[] = []
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(text(src.slice(last, m.index)))
    if (m[1]) out.push(text(m[1], 1))
    else {
      const url = m[3]
      out.push({
        type: 'link',
        version: 3,
        format: '',
        indent: 0,
        direction: 'ltr',
        fields: { linkType: 'custom', url, newTab: /^https?:/.test(url) },
        children: [text(m[2])],
      })
    }
    last = re.lastIndex
  }
  if (last < src.length) out.push(text(src.slice(last)))
  return out
}

const el = (type: string, children: unknown[], extra: Record<string, unknown> = {}) => ({ type, format: '', indent: 0, version: 1, direction: 'ltr', children, ...extra })

export function toLexical(blocks: Block[]) {
  const children = blocks.map((b) => {
    if (b.type === 'h2' || b.type === 'h3') return el('heading', inline(b.text), { tag: b.type })
    if (b.type === 'quote') return el('quote', inline(b.text))
    if (b.type === 'p') return el('paragraph', inline(b.text), { textFormat: 0, textStyle: '' })
    if (b.type !== 'ul' && b.type !== 'ol') return el('paragraph', [])
    const number = b.type === 'ol'
    return el(
      'list',
      b.items.map((it, i) => el('listitem', inline(it), { value: i + 1 })),
      { listType: number ? 'number' : 'bullet', tag: b.type, start: 1 },
    )
  })
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }
}
