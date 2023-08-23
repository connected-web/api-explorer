export default function sentenceCase (camelCase: string): string {
  return camelCase.replaceAll('-', ' ')
    .replace(/([A-Z]+)/g, ' $1')
    .replace(/([A-Z][a-z])/g, ' $1')
    .replaceAll(/\s+/g, ' ').trim()
    .split(' ')
    .map(part => capitalizeFirstLetter(part))
    .map(part => part === 'Api' ? 'API' : part)
    .join(' ')
}

function capitalizeFirstLetter (input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1)
}
