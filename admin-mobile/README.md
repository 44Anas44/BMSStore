#   Admin — Mobile App

React Native + Expo admin panel for  .
Send the built .apk (Android) or .ipa (iOS) directly to your client.

## Setup

### 1. Install dependencies and download assets
```bash
npm install -g eas-cli
npm install
node setup.js
```

### 2. Configure app.json
```
API_URL=https://your-deployed-server.com/api
APP_KEY=${APP_KEY}
```

### 3. Run on device (development)
```bash
npx expo start
```
Scan the QR code with Expo Go app on your phone.

## Build for distribution

### Android APK (send directly to client)
```bash
eas build --platform android --profile preview
```
Downloads a .apk file the client installs directly.

### iOS (requires Apple Developer account)
```bash
eas build --platform ios --profile preview
```

## Security
- API key is embedded in the build at compile time
- Stored via expo-secure-store (OS-level encryption) for runtime use
- No login screen — app possession = admin access
- Rotate key: generate new key, update .env, rebuild, resend

## Push Notifications
The app automatically requests notification permission on first launch and registers the device with the server. You will receive push alerts for:
- 🛒 **New orders** — instantly when a customer places an order
- ⚠️ **Low stock** — when a product stock drops to or below the threshold
- 🚨 **Out of stock** — when a product reaches 0 units
- ✅ **Repair confirmed** — when a customer confirms a repair price (Diagnostics feature)

Push tokens are stored in `server/.env` as `PUSH_TOKENS`. Multiple devices can be registered.
For production, replace the .env-based token storage with a database collection.

## Screens
- **Dashboard** — stats, revenue charts, best sellers
- **Products** — list, search, add/edit/delete with image upload
- **Orders** — list by status, expand for details, change status inline
- **Categories** — add/delete, nested subcategories
- **Brands** — add/delete brands
- **Slides** — manage hero slider slides (add/edit/delete, toggle active)
- **Second Hand** — view and remove second-hand product flags
- **Diagnostics** — full repair tracker: create orders, set status, record problem and price, track customer confirmation
