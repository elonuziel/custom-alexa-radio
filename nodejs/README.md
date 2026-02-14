# Custom Alexa Radio - Node.js

This is the Node.js version of the Multi-Stream Radio Player Alexa Skill. Deploy it as a **personal skill** through the Alexa Developer Console — no publication or certification needed.

## Project Structure

```
nodejs/
├── lambda/
│   ├── index.js          # Lambda function handler
│   └── package.json      # Node.js dependencies
├── interaction_model.json # Alexa interaction model
└── README.md
```

Everything you need is inside this `nodejs/` folder.

## Setup (Personal Skill via Alexa Developer Console)

### Step 1 — Create the Skill

1. Go to the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).
2. Sign in with the **same Amazon account** linked to your Alexa device.
3. Click **Create Skill**.
4. Enter a skill name (e.g. *My Radio*).
5. Choose **Custom** as the model and **Alexa-hosted (Node.js)** as the hosting method.
6. Click **Create Skill**, then pick **Start from Scratch** as the template.

### Step 2 — Set Up the Interaction Model

1. In the left sidebar, go to **Build > Interaction Model > JSON Editor**.
2. Delete everything in the editor.
3. Copy the entire contents of `interaction_model.json` (from this folder) and paste it in.
4. Click **Save** at the top, then click **Build Skill** and wait for it to complete.

### Step 3 — Deploy the Lambda Code

1. In the top menu, click the **Code** tab.
2. You will see an inline code editor with a file tree on the left.
3. Open `index.js` in the editor — select all and replace it with the contents of `lambda/index.js` from this folder.
4. Open `package.json` in the editor — select all and replace it with the contents of `lambda/package.json` from this folder.
5. Click **Save**, then click **Deploy** and wait for the deployment to finish.

### Step 4 — Test the Skill

1. Click the **Test** tab in the top menu.
2. Change the dropdown from **Off** to **Development**.
3. Type or say *"open my radio"* to launch the skill.
4. The skill is now available on any Alexa device signed into the same Amazon account — no need to publish.

### Step 5 — Enable on Your Alexa Device

Since the skill is in **Development** mode and tied to your Amazon account, it is automatically available on all your Alexa-enabled devices. Just say:

> *"Alexa, open my radio"*

No separate enabling step is required.

## Customizing Stations

| # | Station          | URL |
|---|------------------|-----|
| 1 | CNN              | `https://tunein.streamguys1.com/CNNi` |
| 2 | BBC              | `https://stream.live.vc.bbcmedia.co.uk/bbc_world_service_americas` |
| 3 | Classical Music  | `https://ice-sov.musicradio.com/ClassicFMMP3` |
| 4 | Station 4        | Placeholder — replace with a real stream URL |
| 5 | Station 5        | Placeholder — replace with a real stream URL |

To change stations, edit the `STATIONS` and `STATION_NAMES` objects at the top of `lambda/index.js`. Stream URLs must be direct audio streams (MP3, AAC, or HLS) and HTTPS. After editing, re-deploy from the **Code** tab.

## Voice Commands

| Command | What it does |
|---------|-------------|
| *"Alexa, open my radio"* | Launch the skill |
| *"Play station 2"* | Play a specific station (1–5) |
| *"Next"* / *"Previous"* | Switch to the next or previous station |
| *"Pause"* / *"Resume"* | Pause or resume playback |
| *"Stop"* / *"Cancel"* | Stop playback and exit |
| *"Help"* | Get usage instructions |

## Troubleshooting

- **"There was a problem with the requested skill's response"** — Make sure you clicked both **Save** and **Deploy** in the Code tab, and that the **Build** succeeded in the Build tab.
- **Playback stops immediately** — The stream URL may be invalid or not a direct audio stream. Test the URL in a browser or media player first.
- **Skill not found on device** — Ensure your Alexa device and the Developer Console use the same Amazon account, and the Test tab is set to **Development**.
