
const transformer = (ctx) => {
  return (code, _id, _path, _query) => {
    // ctx.searchGlob()
    console.log(ctx);
    
    let _idx = 0
    const head: string[] = []
    const imgVariavleRE = /_ctx\.([A-Z][a-zA-Z0-9]*)/g

    const transformed = code.replace(imgVariavleRE, (match, name) => {
      if (name) {
        name = pascalCase(name)
        const path = ctx.findPathFromCache(name)
        if (path) {
          const varName = `__vite_images_${_idx}`
          head.push(stringifyImageImport(path, varName))
          _idx++
          return varName
        }
      }
      return match
    })

    return `${head.join('\n')}\n${transformed}`
  }
}

export default transformer

export function stringifyImageImport(path: string, name: string) {
  return `import ${name} from '${path}'`
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

export function pascalCase(str: string): string {
  const camel = camelCase(str)
  return camel[0].toUpperCase() + camel.slice(1)
}

export function camelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

export function isEmpty(value: any): boolean {
  return (!value || value === null || value === undefined || (Array.isArray(value) && Object.keys(value).length <= 0))
}
