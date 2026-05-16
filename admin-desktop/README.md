#   Admin — Desktop App

## Development

```bash
npm install
npm run dev
```

## Build for distribution

```bash
npm run build
```

Output goes to `dist-electron/`:
- Windows: `  Admin Setup.exe`
- Mac: `  Admin.dmg`

## Setup

1. Set VITE_APP_KEY in `.env` to the same key as server/.env APP_KEY
2. Set VITE_API_URL to your deployed server URL
3. Run `npm run build` to create the installer
4. Send the installer directly to your client

## Security

The API key is embedded in the binary at build time.
Possession of the app = admin access.
If the key needs to be rotated: generate a new key, update both server/.env and admin-desktop/.env, rebuild and resend.
