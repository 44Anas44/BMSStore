/**
 * Generates a secure random APP_KEY for key rotation.
 * The key was already auto-generated and saved in all .env files by the studio.
 * Run this ONLY if you need to rotate the key after deployment.
 * Usage: node generate-key.js
 * Then update APP_KEY in: server/.env, admin-desktop/.env, admin-mobile/app.json
 */
const crypto = require('crypto')
const key = crypto.randomBytes(48).toString('hex')
console.log('New APP_KEY:')
console.log('APP_KEY=' + key)
