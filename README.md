# Outlyride in Expo Go

This companion project lets an iPhone or Android phone open the current Outlyride app through Expo Go.

## Run on a phone

1. Start Expo from the main project with `npm run expo:start`.
2. Install Expo Go on the phone and scan the QR code shown by Expo.

The start command rebuilds Outlyride and packages its web interface directly into the Expo update. Expo's tunnel lets physical phones download that update without depending on local Wi-Fi routing.

## Notes

- Expo Go is for development and device testing; the existing Capacitor projects remain the native-store build path.
- The Mac must keep the Expo server running while the phone downloads and tests changes.
