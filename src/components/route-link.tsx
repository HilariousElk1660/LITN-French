import React from 'react'
import { Link as RRLink, generatePath } from 'react-router-dom'

type Props = React.ComponentProps<typeof RRLink> & {
  params?: Record<string, string | number>
  search?: Record<string, string | number>
}

function buildPath(to: string, params?: Record<string, string | number>) {
  if (!params) return to
  // Replace $param occurrences: /book/$id -> /book/123
  let result = to
  Object.entries(params).forEach(([k, v]) => {
    result = result.replace(new RegExp(`\\$${k}`, 'g'), String(v))
  })
  return result
}

export default function Link({ to, params, search, ...rest }: Props) {
  const path = typeof to === 'string' ? buildPath(to, params) : to
  const searchStr = search ? '?' + new URLSearchParams(Object.entries(search).map(([k,v]) => [k, String(v)])).toString() : ''
  const final = typeof path === 'string' ? path + searchStr : path
  return <RRLink to={final} {...rest} />
}

export { Link as RouterLink }
