const fnRegex = /(async\s)?([A-z][A-z0-9_]+)\((.*)\)/
function paramsForFunction (signature: string): string[] {
  const parts = signature.match(fnRegex) ?? []
  const middle = parts.pop() ?? ''
  const params = middle.split(',').map(n => n.trim()).filter(n => n)
  return params
}

export interface ObjectDescription {
  prop: string
  type: string
  signature: string
  params: string[]
  description: string
  value: any
}

export default function describeObject (obj: any): ObjectDescription[] {
  const signatures = {
    object: (objProp: string) => objProp,
    function: (objProp: string) => {
      const parts = (objProp + '').match(fnRegex)
      return parts?.[0] ?? (objProp + '')
    },
    string: (objProp: string) => objProp,
    number: (objProp: string) => objProp,
    bigint: (objProp: string) => objProp,
    boolean: (objProp: string) => objProp,
    symbol: (objProp: string) => objProp,
    undefined: (objProp: string) => objProp,
    default: (objProp: string) => objProp + ''
  }
  const ignoreList = ['__defineGetter__', '__defineSetter__']
  const properties = Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(n => n !== 'constructor')
  return properties.map(prop => {
    if (ignoreList.includes(prop)) {
      return null
    }
    let value, type, signature, params, description
    try {
      value = obj[prop]
      type = typeof value
      signature = (signatures[type] ?? signatures.default)(value)
      params = type === 'function' ? paramsForFunction(signature) : null
      description = ((signature + '').includes(prop)) ? signature : `${type} ${prop}`
    } catch (ex) {
      const error = ex as Error
      description = `Key: "${prop}", Error: "${error.message}"`
      console.warn('Object property not describable:', { prop, obj })
    }
    return {
      prop,
      type,
      signature,
      params,
      description,
      value
    }
  }).filter(n => n) as ObjectDescription[]
}
