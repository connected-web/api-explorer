import Fuse from 'fuse.js'
import { fas } from '@fortawesome/free-solid-svg-icons'

const store = { state: {} } as any

function readFromLocalStorage (): void {
  let storedData
  try {
    storedData = localStorage.getItem('IconSearch')
    store.state = JSON.parse(storedData ?? '{}')
  } catch (ex) {
    const error = ex as Error
    console.warn('Icon Search data in local storage is corrupted; resetting.', { storedData, error: error.message })
    updateLocalStorage()
  }
}

function updateLocalStorage (): void {
  localStorage.setItem('IconSearch', JSON.stringify(store.state ?? {}))
}

const icons = Object.values(fas)
const fuse = new Fuse(icons, {
  keys: [
    'icon',
    'iconName'
  ]
})

export default class IconSearch {
  constructor () {
    readFromLocalStorage()
  }

  findIcon (searchString: string): string {
    if (typeof searchString !== 'string') {
      throw new Error('Can only search for icons using string')
    }
    const sanitizedString = searchString.replaceAll('__', '')
    const existing = store?.state?.icons?.[sanitizedString]
    if (existing !== undefined) {
      return existing
    }
    let bestMatch = fuse.search(searchString)?.[0]
    if (bestMatch === undefined) {
      const alts = sanitizedString.split(' ').map(part => {
        const partMatch = fuse.search(part)?.[0]
        return partMatch
      }).filter(n => n)
      bestMatch = alts[0]
    }
    const newMatch = bestMatch?.item?.iconName
    store.state.icons = store.state.icons ?? {}
    store.state.icons[sanitizedString] = newMatch
    updateLocalStorage()
    return newMatch
  }
}
