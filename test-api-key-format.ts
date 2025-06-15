// Check if API key format is correct
const apiKey = process.env.GOOGLE_GEMINI_API_KEY || ''

console.log('Gemini API Key Check:')
console.log('Length:', apiKey.length)
console.log('Starts with AIza:', apiKey.startsWith('AIza'))
console.log('Contains spaces:', apiKey.includes(' '))
console.log('Contains newlines:', apiKey.includes('\n'))
console.log('First 10 chars:', apiKey.substring(0, 10))
console.log('Last 4 chars:', apiKey.substring(apiKey.length - 4))

// Common issues:
if (apiKey.length !== 39) {
  console.log('\n⚠️  API key should be exactly 39 characters long')
}
if (!apiKey.startsWith('AIza')) {
  console.log('\n⚠️  API key should start with "AIza"')
}
if (apiKey.includes(' ') || apiKey.includes('\n')) {
  console.log('\n⚠️  API key contains whitespace - this will cause issues!')
}