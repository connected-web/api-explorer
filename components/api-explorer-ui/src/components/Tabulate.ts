export default function tabulate (item: any, filter: string[] = []): ({ key: string, value: unknown })[] {
  item = item ?? {}
  return Object.entries(item).map(([key, value]) => {
    return { key, value }
  }).filter(item => !filter.includes(item.key))
}
