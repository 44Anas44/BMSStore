# Admin Mobile — Configuration

## Local IP (already configured)
The studio pre-filled app.json with your local IP and APP_KEY.
Open admin-mobile/app.json and check the "extra" section:

  "extra": {
    "apiUrl": "http://YOUR_PC_IP:5000/api",
    "appKey": "auto-generated-key"
  }

If your IP changed (different Wi-Fi), update apiUrl to match.
Find your current IP: Windows → ipconfig | Mac/Linux → ifconfig

## For production deployment
Change apiUrl to your deployed server URL:
  "apiUrl": "https://yourstore.onrender.com/api"

Then rebuild the APK:
  eas build --platform android --profile preview

## Reload after changes
In the Expo terminal press: r
