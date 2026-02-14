/**
 * Multi-Stream Radio Player - Alexa Skill (Node.js)
 * A robust radio streaming skill with multiple station support
 */

const Alexa = require('ask-sdk-core');

// ============================================================================
// STATION CONFIGURATION
// ============================================================================

const STATIONS = {
    1: 'https://tunein.streamguys1.com/CNNi',
    2: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service_americas',
    3: 'https://ice-sov.musicradio.com/ClassicFMMP3',
    4: 'https://radioplaceholder1.example.com/stream',  // Placeholder
    5: 'https://radioplaceholder2.example.com/stream'   // Placeholder
};

const STATION_NAMES = {
    1: 'CNN',
    2: 'BBC',
    3: 'classical music',
    4: 'Station 4',
    5: 'Station 5'
};

const STATION_COUNT = Object.keys(STATIONS).length;
const STATION_NUMBERS = Object.keys(STATIONS).map(Number).sort((a, b) => a - b);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCurrentStation(handlerInput) {
    // First, check the AudioPlayer context for the currently playing token
    try {
        const audioPlayer = handlerInput.requestEnvelope.context.AudioPlayer;
        if (audioPlayer && audioPlayer.token) {
            const token = parseInt(audioPlayer.token, 10);
            if (!isNaN(token)) return token;
        }
    } catch (e) {
        // Ignore errors, fall through to session attributes
    }

    // Fallback to session attributes
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return sessionAttributes.currentStation || 1;
}

function setCurrentStation(handlerInput, stationNumber) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.currentStation = stationNumber;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function getStationUrl(stationNumber) {
    return STATIONS[stationNumber] || null;
}

function getStationName(stationNumber) {
    return STATION_NAMES[stationNumber] || `Station ${stationNumber}`;
}

function getNextStation(currentStation) {
    const idx = STATION_NUMBERS.indexOf(currentStation);
    if (idx === -1) return STATION_NUMBERS[0];
    return STATION_NUMBERS[(idx + 1) % STATION_NUMBERS.length];
}

function getPreviousStation(currentStation) {
    const idx = STATION_NUMBERS.indexOf(currentStation);
    if (idx === -1) return STATION_NUMBERS[0];
    return STATION_NUMBERS[(idx - 1 + STATION_NUMBERS.length) % STATION_NUMBERS.length];
}

function createPlayDirective(stationNumber, offset = 0) {
    const url = getStationUrl(stationNumber);
    if (!url) return null;

    return {
        type: 'AudioPlayer.Play',
        playBehavior: 'REPLACE_ALL',
        audioItem: {
            stream: {
                token: String(stationNumber),
                url: url,
                offsetInMilliseconds: offset
            },
            metadata: {
                title: getStationName(stationNumber),
                subtitle: 'My Radio Player'
            }
        }
    };
}

// ============================================================================
// REQUEST HANDLERS
// ============================================================================

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        console.log('LaunchRequest received');

        setCurrentStation(handlerInput, 1);

        const speakOutput = `Welcome to My Radio. I have ${STATION_COUNT} stations available. Choose a station number to start listening.`;
        const reprompt = `Say a station number from 1 to ${STATION_COUNT}.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
};

const PlayStationIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayStationIntent';
    },
    handle(handlerInput) {
        console.log('PlayStationIntent received');

        const stationSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'stationNumber');

        if (!stationSlot) {
            const speakOutput = 'Please say a station number.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }

        const stationNumber = parseInt(stationSlot, 10);

        if (isNaN(stationNumber)) {
            const speakOutput = "I didn't understand that number. Please say a valid station number.";
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }

        if (!STATIONS[stationNumber]) {
            const speakOutput = `I do not have station ${stationNumber}. Please say another one, from 1 to ${STATION_COUNT}.`;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }

        // Station found - play it
        setCurrentStation(handlerInput, stationNumber);
        const playDirective = createPlayDirective(stationNumber);
        const speakOutput = `Playing ${getStationName(stationNumber)}.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective(playDirective)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const NextIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent';
    },
    handle(handlerInput) {
        console.log('AMAZON.NextIntent received');

        const currentStation = getCurrentStation(handlerInput);
        const nextStation = getNextStation(currentStation);

        setCurrentStation(handlerInput, nextStation);
        const playDirective = createPlayDirective(nextStation);
        const speakOutput = `Playing ${getStationName(nextStation)}.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective(playDirective)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const PreviousIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent';
    },
    handle(handlerInput) {
        console.log('AMAZON.PreviousIntent received');

        const currentStation = getCurrentStation(handlerInput);
        const previousStation = getPreviousStation(currentStation);

        setCurrentStation(handlerInput, previousStation);
        const playDirective = createPlayDirective(previousStation);
        const speakOutput = `Playing ${getStationName(previousStation)}.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective(playDirective)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const PauseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent';
    },
    handle(handlerInput) {
        console.log('AMAZON.PauseIntent received');

        return handlerInput.responseBuilder
            .addDirective({ type: 'AudioPlayer.Stop' })
            .withShouldEndSession(true)
            .getResponse();
    }
};

const StopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        console.log('AMAZON.StopIntent received');

        const speakOutput = 'Stopping playback. Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({ type: 'AudioPlayer.Stop' })
            .withShouldEndSession(true)
            .getResponse();
    }
};

const ResumeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent';
    },
    handle(handlerInput) {
        console.log('AMAZON.ResumeIntent received');

        const currentStation = getCurrentStation(handlerInput);
        const playDirective = createPlayDirective(currentStation);
        const speakOutput = `Resuming ${getStationName(currentStation)}.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective(playDirective)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const CancelIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {
        console.log('AMAZON.CancelIntent received');

        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({ type: 'AudioPlayer.Stop' })
            .withShouldEndSession(true)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        console.log('AMAZON.HelpIntent received');

        const speakOutput = `This is My Radio Player. You can choose from ${STATION_COUNT} stations by saying a number from 1 to ${STATION_COUNT}. You can also say next, previous, pause, or resume. What would you like to do?`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log('SessionEndedRequest received');
        return handlerInput.responseBuilder.getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        console.log('AMAZON.FallbackIntent received');

        const speakOutput = `I didn't catch that. You can say a station number from 1 to ${STATION_COUNT}, or say next, previous, pause, or resume.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// ============================================================================
// AUDIOPLAYER & PLAYBACKCONTROLLER HANDLERS
// ============================================================================

const AudioPlayerEventHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
    },
    handle(handlerInput) {
        const eventName = handlerInput.requestEnvelope.request.type;
        console.log(`AudioPlayer event: ${eventName}`);

        // On PlaybackFailed, log the error details
        if (eventName === 'AudioPlayer.PlaybackFailed') {
            const error = handlerInput.requestEnvelope.request.error;
            console.error(`Playback failed: ${JSON.stringify(error)}`);
        }

        return handlerInput.responseBuilder.getResponse();
    }
};

const PlaybackControllerHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type.startsWith('PlaybackController.');
    },
    handle(handlerInput) {
        const eventName = handlerInput.requestEnvelope.request.type;
        console.log(`PlaybackController event: ${eventName}`);

        // Pause — stop playback (no speech allowed in PlaybackController responses)
        if (eventName === 'PlaybackController.PauseCommandIssued') {
            return handlerInput.responseBuilder
                .addDirective({ type: 'AudioPlayer.Stop' })
                .withShouldEndSession(true)
                .getResponse();
        }

        // Play / Next / Previous — determine which station to play
        const currentStation = getCurrentStation(handlerInput);
        let stationToPlay = currentStation;

        if (eventName === 'PlaybackController.NextCommandIssued') {
            stationToPlay = getNextStation(currentStation);
        } else if (eventName === 'PlaybackController.PreviousCommandIssued') {
            stationToPlay = getPreviousStation(currentStation);
        }

        const playDirective = createPlayDirective(stationToPlay);

        return handlerInput.responseBuilder
            .addDirective(playDirective)
            .withShouldEndSession(true)
            .getResponse();
    }
};

// ============================================================================
// FALLBACK HANDLER
// ============================================================================

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        console.log(`Unhandled intent: ${intentName}`);

        const speakOutput = "I'm not sure how to help with that. Try saying a station number, or say next, previous, pause, or resume.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// ============================================================================
// EXCEPTION HANDLERS
// ============================================================================

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`Error handled: ${error.message}`, error.stack);

        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// ============================================================================
// SKILL BUILDER
// ============================================================================

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayStationIntentHandler,
        NextIntentHandler,
        PreviousIntentHandler,
        PauseIntentHandler,
        StopIntentHandler,
        ResumeIntentHandler,
        CancelIntentHandler,
        HelpIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        AudioPlayerEventHandler,
        PlaybackControllerHandler,
        IntentReflectorHandler   // Must be last
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
