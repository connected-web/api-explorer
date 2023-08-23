const acronyms = ['API', 'DB']

export default function sentenceCase (camelCase: string): string {
  return camelCase.replaceAll('-', ' ')
    .replace(/([A-Z]+)/g, ' $1')
    .replace(/([A-Z][a-z])/g, ' $1')
    .replaceAll(/\s+/g, ' ').trim()
    .split(' ')
    .map(part => capitalizeFirstLetter(part))
    .map(part => acronyms.includes(part.toUpperCase()) ? part.toUpperCase() : part)
    .join(' ')
}

function capitalizeFirstLetter (input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1)
}
