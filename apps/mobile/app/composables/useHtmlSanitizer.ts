import createDOMPurify from 'dompurify'

let domPurify: ReturnType<typeof createDOMPurify> | null = null

function getDOMPurify() {
  if (!import.meta.client) return null
  if (!domPurify) {
    domPurify = createDOMPurify(window)
  }
  return domPurify
}

export function sanitizeRichHtml(html: string): string {
  const sanitizer = getDOMPurify()
  return sanitizer ? sanitizer.sanitize(html) : html
}
