# FGSG Student Grant Portal

Competition prototype for a Nigerian student grant portal, black and white with Nigerian green outlines.

Demo only. Not an official Federal Government portal. No official FGSG programme was found; the real student grant is the Student Venture Capital Grant at svcg.education.gov.ng.

Flow: landing, auth (login / signup / forgot password), dashboard, 6-step application (personal details, institution, JAMB letter and optional fees receipt, NIN, real on-device liveness check, Paystack verification, payout via Site Wallet or Bank Account).

Payments: Paystack test mode only, with a test public key. No real money moves. Use the Paystack test card in test mode. Do not enter real passwords, NINs or bank details.

Liveness: runs on-device with the camera, centre, turn left, turn right, tilt up, tilt down, then blink. No video is recorded or sent.

## Structure

- `index.html` — markup only
- `assets/styles.css` — all styles
- `assets/app.js` — routing, auth, dock nav, application form
- `assets/liveness.js` — MediaPipe face scan
- `assets/payment.js` — Paystack Step 5, payout and submission

Open index.html to view the site.
