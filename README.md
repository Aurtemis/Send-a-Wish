# ClapWish — An Interactive Birthday Experience

A browser-based birthday experience: a 3D candle-lit cake that the recipient
blows out by clapping five times (via webcam hand tracking), followed by
confetti, balloons, music, and a personalized message inside an animated
envelope. Built from the ClapWish PRD with Next.js + React Three Fiber.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Hand tracking needs a secure context, so
`localhost` works for dev, but a deployed site needs `https://` (Vercel
gives you that automatically).

## Add your cake model

Drop your Blender export at `public/cake.glb`. Until it's there, the app
shows a procedural placeholder cake so everything still runs end-to-end.
The candle digits are anchored at `y = 0.66` in `src/components/Scene.tsx` —
adjust that once the real model is in, to match where its top platform sits.

## Create a wish

Visit the homepage and click "Create a Birthday Wish" to fill out the form
and generate a shareable link. Open that link (or add `?debug=1` to it) to
see a live panel with hand-tracking status and clap-threshold sliders you
can tune in real time — same idea as the standalone clap-detector test
harness, just built into the app this time.

## Two changes from the original PRD, and why

1. **Music: "direct audio upload" → "link to already-hosted audio."**
   The app has zero backend, so there's nowhere to store an uploaded file
   that a *different* browser could later fetch from a shared link. The
   form now accepts a YouTube link or a direct URL to an audio file you've
   already hosted somewhere (Dropbox/Drive direct link, S3, etc.) — same
   "paste a link" UX, but it actually works without a server.
2. **flame.png / smoke.png / balloon.png → generated in code.**
   Flame, smoke, and confetti textures are drawn on a `<canvas>` at runtime
   instead of shipped as image assets, so there's nothing extra to export
   from Blender. `cake.glb` is still the one real asset you need to supply.

## Tech stack

Next.js (App Router) · TypeScript · React Three Fiber / drei / three.js ·
MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`) · Framer Motion ·
Tailwind CSS v4. Deploys to Vercel with no environment variables and no
database.

## Project structure

```
src/
  app/                 # Next.js App Router entry (layout, page, globals.css)
  components/
    AppRoot, Homepage, RecipientExperience   # mode routing + top-level screens
    Scene, Cake, PlaceholderCake             # 3D scene + cake
    NumberCandle, CandleDigit, Flame, Smoke  # procedural candles
    Balloons, Confetti                       # celebration effects
    Envelope, GreetingCard, BirthdayMessage  # message reveal (HTML/CSS overlay)
    WishForm, AudioPlayer, DebugPanel
  hooks/
    useHandTracking      # webcam + MediaPipe HandLandmarker
    useClapDetection      # palm-distance -> discrete clap events
    useGameState          # the PRD's state machine
  utils/
    parseURL, generateWishURL, textures
  types/
```
    
  
