import Fuse from 'fuse.js'
import { fas } from '@fortawesome/free-solid-svg-icons'

const store = { state: {} } as any

function readFromLocalStorage():void {
  let storedData
  try {
    storedData = localStorage.getItem('IconSearch')
    store.state = JSON.parse(storedData ?? '{}')
  } catch (ex) {
    const error = ex as Error
    console.warn('Icon Search data in local storage is corrupted; resetting.', { storedData })
    updateLocalStorage() 
  }
}

function updateLocalStorage():void {
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

  findIcon (searchString:string): string {
    const existing = store?.state?.icons?.[searchString]
    if (existing) {
      return existing
    }
    let bestMatch = fuse.search(searchString)?.[0]
    if (!bestMatch) {
      const alts = searchString.split(' ').map(part => {
        const partMatch = fuse.search(part)?.[0]
        return partMatch
      }).filter(n => n)
      bestMatch = alts[0]
    }
    const newMatch = bestMatch?.item?.iconName
    store.state.icons = store.state.icons ?? {}
    store.state.icons[searchString] = newMatch
    updateLocalStorage()
    return newMatch
  }
}