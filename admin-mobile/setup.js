/**
 * Run this once before starting the app:
 *   node setup.js
 *
 * Downloads required asset files and checks configuration.
 */
const https = require('https')
const fs    = require('fs')
const path  = require('path')

const ASSETS = [
  ['icon.png',          'https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png'],
  ['splash.png',        'https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/splash.png'],
  ['adaptive-icon.png', 'https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/adaptive-icon.png'],
  ['favicon.png',       'https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/favicon.png'],
]

const dir = path.join(__dirname, 'assets')
if (!fs.existsSync(dir)) fs.mkdirSync(dir)

let done = 0
ASSETS.forEach(([name, url]) => {
  const dest = path.join(dir, name)
  if (fs.existsSync(dest)) { console.log('  exists:', name); done++; if (done === ASSETS.length) console.log('
Done! Run: npx expo start --tunnel'); return }
  const file = fs.createWriteStream(dest)
  https.get(url, res => {
    res.pipe(file)
    file.on('finish', () => { file.close(); console.log('  downloaded:', name); done++; if (done === ASSETS.length) console.log('
Done! Run: npx expo start --tunnel') })
  }).on('error', err => { console.error('  failed:', name, err.message) })
})
