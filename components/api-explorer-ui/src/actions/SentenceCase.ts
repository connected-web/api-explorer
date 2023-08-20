export default function sentenceCase (camelCase:string) {
  return capitalizeFirstLetter(camelCase + '').replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1').replaceAll(/\s+/g, ' ').trim()
}

function capitalizeFirstLetter (input:string) {
  return input.charAt(0).toUpperCase() + input.slice(1)
}