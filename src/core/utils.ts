import { partial } from 'filesize';

export const size = partial({ base: 2, standard: 'jedec' });

export function camelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}
export function pascalCase(str: string): string {
  const camel = camelCase(str)
  return camel[0].toUpperCase() + camel.slice(1)
}

export function normalizeResolvers(resolvers: any) {
  return toArray(resolvers).flat()
}


export function toArray<T>(array?: any): Array<T> {
  array = array ?? []
  return Array.isArray(array) ? array : [array]
}

export function parseId(id: string) {
  const index = id.indexOf('?')
  if (index < 0) {
    return { path: id, query: {} }
  } else {
    const query = Object.fromEntries(new URLSearchParams(id.slice(index)) as any)
    return {
      path: id.slice(0, index),
      query,
    }
  }
}
export function isEmpty(value: any): boolean {
  return (!value || value === null || value === undefined || (Array.isArray(value) && Object.keys(value).length <= 0))
}

