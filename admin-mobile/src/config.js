import Constants from 'expo-constants'

// Values come from app.json → expo.extra
// Edit app.json to change API_URL and APP_KEY before building
const extra = Constants.expoConfig?.extra || {}

export const API_URL = extra.apiUrl || 'http://localhost:5000/api'
export const APP_KEY = extra.appKey || ''
export const BRAND   = ' '
export const COLORS  = {
  primary:   '#f8f8f4',
  secondary: '#f98512',
  bg:        '#f7f7f7',
  surface:   '#ffffff',
  border:    '#eeeeee',
  text:      '#1a1a1a',
  muted:     '#888888',
  danger:    '#ef4444',
  success:   '#22c55e',
  warning:   '#f59e0b',
  info:      '#3b82f6',
}
