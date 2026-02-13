# Custom Alexa Radio - Node.js

This is the Node.js version of the Multi-Stream Radio Player Alexa Skill.

## Project Structure

```
nodejs/
├── lambda/
│   ├── index.js          # Lambda function handler
│   └── package.json      # Node.js dependencies
├── interaction_model.json # Alexa interaction model
└── README.md
```

## Setup

1. Navigate to the `lambda/` directory:
   ```bash
   cd lambda
   npm install
   ```

2. Deploy to AWS Lambda with **Node.js 18.x** (or later) runtime.

3. Upload the `interaction_model.json` to the Alexa Developer Console under **Build > Interaction Model > JSON Editor**.

## Stations

| # | Station          | URL |
|---|------------------|-----|
| 1 | CNN              | `http://tunein.streamguys1.com/CNNi` |
| 2 | BBC              | `https://stream.live.vc.bbcmedia.co.uk/bbc_world_service_americas` |
| 3 | Classical Music  | `https://ice-sov.musicradio.com/ClassicFMMP3` |
| 4 | Station 4        | Placeholder |
| 5 | Station 5        | Placeholder |

Edit the `STATIONS` and `STATION_NAMES` objects in `lambda/index.js` to customize.

## Voice Commands

- *"Alexa, open my radio"* — Launch the skill
- *"Play station 2"* — Play a specific station
- *"Next"* / *"Previous"* — Switch stations
- *"Pause"* / *"Resume"* — Control playback
- *"Stop"* / *"Cancel"* — End the skill
- *"Help"* — Get usage instructions
