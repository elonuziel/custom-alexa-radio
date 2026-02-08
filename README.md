# Multi-Stream Radio Player - Alexa Skill

A robust Alexa skill for streaming multiple radio stations with full playback control.

## Features

✅ **Multiple Station Support** - Switch between 5+ radio stations
✅ **Voice Control** - Play by number, next/previous navigation
✅ **Playback Controls** - Pause, resume, stop
✅ **Session Management** - Remembers last played station
✅ **Error Handling** - Graceful handling of invalid stations
✅ **Metadata Support** - Displays station names in the Alexa app

## Station Configuration

The skill comes pre-configured with these stations:

1. **CNN** - `http://tunein.streamguys1.com/CNNi`
2. **BBC** - `https://stream.live.vc.bbcmedia.co.uk/bbc_world_service_americas`
3. **classical music** - `https://ice-sov.musicradio.com/ClassicFMMP3`
4. **Station 4** - Placeholder URL
5. **Station 5** - Placeholder URL

### Adding/Modifying Stations

Edit the `STATIONS` dictionary in `lambda_function.py`:

```python
STATIONS = {
    1: "https://your-stream-url-1.mp3",
    2: "https://your-stream-url-2.mp3",
    # Add more stations as needed
}

# Optional: Add friendly names
STATION_NAMES = {
    1: "Your Station Name 1",
    2: "Your Station Name 2",
}
```

## Setup Instructions

### 1. Create an Alexa-Hosted Skill

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Click **Create Skill**
3. Enter skill name: "My Radio"
4. Choose **Custom** model
5. Choose **Alexa-Hosted (Python)** as the hosting method
6. Click **Create Skill**

### 2. Upload the Lambda Function

1. In the Alexa Developer Console, go to the **Code** tab
2. Replace the contents of `lambda_function.py` with the provided code
3. Click **Save** then **Deploy**

### 3. Configure the Interaction Model

1. Go to the **Build** tab
2. Click on **Interaction Model** → **JSON Editor**
3. Paste the contents of `interaction_model.json`
4. Click **Save Model**
5. Click **Build Model** (wait for completion)

### 4. Configure Interfaces

1. In the **Build** tab, click **Interfaces**
2. Enable **Audio Player** interface
3. Click **Save Interfaces**

### 5. Test the Skill

1. Go to the **Test** tab
2. Enable testing: "Development"
3. Try the sample interactions below

## Sample Interactions

### Launch and Play
```
User: "Alexa, open my radio"
Alexa: "Welcome to My Radio. I have 5 stations available. Choose a station number to start listening."
User: "Station 1"
Alexa: "Playing station 1, cnn." [music starts]
```

### Switch Stations
```
User: "Alexa, next"
Alexa: "Playing station 2, bbc." [switches to next station]

User: "Alexa, previous"
Alexa: "Playing station 1, cnn." [switches to previous station]

User: "Alexa, play station 3"
Alexa: "Playing station 3, classical music." [switches to station 3]
```

### Playback Control
```
User: "Alexa, pause"
[Music stops]

User: "Alexa, resume"
Alexa: "Resuming station 3, classical music." [resumes last station]

User: "Alexa, stop"
Alexa: "Stopping playback. Goodbye!" [stops and exits]
```

### Invalid Station
```
User: "Alexa, play station 99"
Alexa: "I do not have station 99. Please say another one, from 1 to 5."
```

## Intent Reference

### Custom Intents

**PlayStationIntent**
- Slot: `stationNumber` (AMAZON.NUMBER)
- Purpose: Play a specific station by number
- Samples: "play station {stationNumber}", "station {stationNumber}"

### Built-in Intents

- **AMAZON.NextIntent** - Skip to next station
- **AMAZON.PreviousIntent** - Skip to previous station
- **AMAZON.PauseIntent** - Pause playback
- **AMAZON.ResumeIntent** - Resume playback
- **AMAZON.StopIntent** - Stop and exit
- **AMAZON.CancelIntent** - Cancel and exit
- **AMAZON.HelpIntent** - Get help

## Code Architecture

### Key Components

1. **Station Dictionary** - Maps station numbers to URLs
2. **Session Management** - Tracks current station across requests
3. **Helper Functions** - Station navigation and URL retrieval
4. **Request Handlers** - Process each type of user request
5. **Exception Handlers** - Graceful error handling

### Flow Diagram

```
LaunchRequest → Greet user, ask for station
     ↓
PlayStationIntent → Validate → Play audio
     ↓
NextIntent/PreviousIntent → Navigate stations
     ↓
PauseIntent/ResumeIntent → Control playback
     ↓
StopIntent → Exit skill
```

## Troubleshooting

### Audio Not Playing

1. **Check Stream URLs** - Ensure URLs are valid and accessible
2. **Verify Interfaces** - Audio Player interface must be enabled
3. **Test URLs** - Try URLs in a browser or media player first
4. **Check Logs** - View CloudWatch logs in the Code tab

### Station Not Found

- Verify the station number exists in the `STATIONS` dictionary
- Check that the user is saying a number (not a name)

### Skill Not Responding

1. Check if the skill is deployed (Code tab → Deploy)
2. Rebuild the interaction model (Build tab → Build Model)
3. Check CloudWatch logs for errors

## Advanced Customization

### Add More Stations

```python
STATIONS = {
    1: "url1",
    2: "url2",
    # ... up to 100+ stations
    50: "url50"
}
```

### Custom Welcome Message

Edit the `LaunchRequestHandler`:

```python
speak_output = (
    "Welcome to [Your Custom Name]. "
    f"Choose from {len(STATIONS)} amazing stations!"
)
```

### Add Station Details

Enhance the `STATION_NAMES` dictionary:

```python
STATION_NAMES = {
    1: "Classic Rock Radio",
    2: "Jazz 24/7",
    3: "News and Talk"
}
```

## Requirements

- Python 3.8+
- ask-sdk-core (included in Alexa-Hosted skills)
- Valid streaming URLs (MP3, AAC, HLS streams)

## License

This code is provided as-is for educational purposes.

## Support

For Alexa skill development help:
- [Alexa Skills Kit Documentation](https://developer.amazon.com/docs/ask-overviews/build-skills-with-the-alexa-skills-kit.html)
- [ASK SDK for Python Documentation](https://alexa-skills-kit-python-sdk.readthedocs.io/)
