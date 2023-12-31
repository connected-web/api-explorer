const fnRegex = /(async\s)?([A-z][A-z0-9_]+)\((.*)\)/
function paramsForFunction (signature: Function): string[] {
  const funcString = signature.toString()
  const match = funcString.match(/\(([^)]*)\)/)

  if (match != null) {
    const params = match[1].split(/\s*,\s*/)
    return params.filter(Boolean)
  }

  return []
}

export interface ObjectDescription {
  prop: string
  type: string
  signature: string
  params: string[]
  description: string
  value: any
}

const ignorable = ['constructor', 'length', 'name', 'arguments', 'caller', 'apply', 'bind', 'call', 'toString'].sort()

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
  const ignoreList = ['constructor', '__defineGetter__', '__defineSetter__']
  const keys = Object.keys(obj)
  const meta = Object.getOwnPropertyNames(obj).sort()
  let properties
  if (JSON.stringify(ignorable) === JSON.stringify(meta)) {
    console.log('Object matches pattern for wrapped object, switching to keys:', { keys, meta })
    properties = keys
  } else {
    properties = meta
  }
  return properties.map(prop => {
    if (ignoreList.includes(prop)) {
      return null
    }
    let value, type, signature, params, description
    try {
      value = obj[prop]
      // console.log('Value for:', { obj, prop, value: obj[prop] })
      type = typeof value
      signature = (signatures[type] ?? signatures.default)(value)
      params = type === 'function' ? paramsForFunction(value) : null
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
