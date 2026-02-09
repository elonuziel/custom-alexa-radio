"""
Multi-Stream Radio Player - Alexa Skill
A robust radio streaming skill with multiple station support
"""

from ask_sdk_core.skill_builder import SkillBuilder
from ask_sdk_core.dispatch_components import AbstractRequestHandler, AbstractExceptionHandler
from ask_sdk_core.utils import is_request_type, is_intent_name
from ask_sdk_core.handler_input import HandlerInput
from ask_sdk_model import Response
from ask_sdk_model.interfaces.audioplayer import (
    PlayDirective, PlayBehavior, AudioItem, Stream, AudioItemMetadata,
    StopDirective
)
import logging

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# ============================================================================
# STATION CONFIGURATION
# ============================================================================

STATIONS = {
    1: "http://tunein.streamguys1.com/CNNi",
    2: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service_americas",
    3: "https://ice-sov.musicradio.com/ClassicFMMP3",
    4: "https://radioplaceholder1.example.com/stream",  # Placeholder
    5: "https://radioplaceholder2.example.com/stream"   # Placeholder
}

# Station names for better user experience (optional)
STATION_NAMES = {
    1: "CNN",
    2: "BBC",
    3: "classical music",
    4: "Station 4",
    5: "Station 5"
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_current_station(handler_input):
    """Get the current station number from AudioPlayer token, session, or default to 1."""
    # First, check the AudioPlayer context for the currently playing token
    try:
        audio_player = handler_input.request_envelope.context.audio_player
        if audio_player and audio_player.token:
            return int(audio_player.token)
    except (AttributeError, ValueError, TypeError):
        # If AudioPlayer context doesn't exist or token is invalid, continue to fallback
        pass
    
    # Fallback to session attributes
    session_attr = handler_input.attributes_manager.session_attributes
    return session_attr.get('current_station', 1)


def set_current_station(handler_input, station_number):
    """Store the current station number in session attributes."""
    session_attr = handler_input.attributes_manager.session_attributes
    session_attr['current_station'] = station_number


def get_station_url(station_number):
    """Get the URL for a given station number."""
    return STATIONS.get(station_number)


def get_station_name(station_number):
    """Get the friendly name for a given station number."""
    return STATION_NAMES.get(station_number, f"Station {station_number}")


def get_next_station(current_station):
    """Get the next station number in the list (wraps around)."""
    station_numbers = sorted(STATIONS.keys())
    try:
        current_index = station_numbers.index(current_station)
        next_index = (current_index + 1) % len(station_numbers)
        return station_numbers[next_index]
    except ValueError:
        return station_numbers[0] if station_numbers else 1


def get_previous_station(current_station):
    """Get the previous station number in the list (wraps around)."""
    station_numbers = sorted(STATIONS.keys())
    try:
        current_index = station_numbers.index(current_station)
        previous_index = (current_index - 1) % len(station_numbers)
        return station_numbers[previous_index]
    except ValueError:
        return station_numbers[0] if station_numbers else 1


def create_play_directive(station_number, offset=0):
    """Create an AudioPlayer.Play directive for the given station."""
    url = get_station_url(station_number)
    if not url:
        return None
    
    return PlayDirective(
        play_behavior=PlayBehavior.REPLACE_ALL,
        audio_item=AudioItem(
            stream=Stream(
                token=str(station_number),
                url=url,
                offset_in_milliseconds=offset
            ),
            metadata=AudioItemMetadata(
                title=get_station_name(station_number),
                subtitle="My Radio Player"
            )
        )
    )


# ============================================================================
# REQUEST HANDLERS
# ============================================================================

class LaunchRequestHandler(AbstractRequestHandler):
    """Handler for Skill Launch."""
    
    def can_handle(self, handler_input):
        return is_request_type("LaunchRequest")(handler_input)
    
    def handle(self, handler_input):
        logger.info("LaunchRequest received")
        
        # Initialize session with default station
        set_current_station(handler_input, 1)
        
        speak_output = (
            "Welcome to My Radio. "
            f"I have {len(STATIONS)} stations available. "
            "Choose a station number to start listening."
        )
        reprompt = "Say a station number from 1 to {}.".format(len(STATIONS))
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .ask(reprompt)
                .response
        )


class PlayStationIntentHandler(AbstractRequestHandler):
    """Handler for PlayStationIntent - plays a specific station by number."""
    
    def can_handle(self, handler_input):
        return is_intent_name("PlayStationIntent")(handler_input)
    
    def handle(self, handler_input):
        logger.info("PlayStationIntent received")
        
        # Extract the station number from the slot
        slots = handler_input.request_envelope.request.intent.slots
        station_slot = slots.get('stationNumber')
        
        if not station_slot or not station_slot.value:
            speak_output = "Please say a station number."
            return (
                handler_input.response_builder
                    .speak(speak_output)
                    .ask(speak_output)
                    .response
            )
        
        try:
            station_number = int(station_slot.value)
        except ValueError:
            speak_output = "I didn't understand that number. Please say a valid station number."
            return (
                handler_input.response_builder
                    .speak(speak_output)
                    .ask(speak_output)
                    .response
            )
        
        # Check if the station exists
        if station_number not in STATIONS:
            speak_output = (
                f"I do not have station {station_number}. "
                f"Please say another one, from 1 to {len(STATIONS)}."
            )
            return (
                handler_input.response_builder
                    .speak(speak_output)
                    .ask(speak_output)
                    .response
            )
        
        # Station found - play it
        set_current_station(handler_input, station_number)
        play_directive = create_play_directive(station_number)
        
        speak_output = f"Playing {get_station_name(station_number)}."
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .add_directive(play_directive)
                .set_should_end_session(True)
                .response
        )


class NextIntentHandler(AbstractRequestHandler):
    """Handler for AMAZON.NextIntent - skips to the next station."""
    
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.NextIntent")(handler_input)
    
    def handle(self, handler_input):
        logger.info("AMAZON.NextIntent received")
        
        current_station = get_current_station(handler_input)
        next_station = get_next_station(current_station)
        
        set_current_station(handler_input, next_station)
        play_directive = create_play_directive(next_station)
        
        speak_output = f"Playing {get_station_name(next_station)}."
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .add_directive(play_directive)
                .set_should_end_session(True)
                .response
        )


class PreviousIntentHandler(AbstractRequestHandler):
    """Handler for AMAZON.PreviousIntent - skips to the previous station."""
    
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.PreviousIntent")(handler_input)
    
    def handle(self, handler_input):
        logger.info("AMAZON.PreviousIntent received")
        
        current_station = get_current_station(handler_input)
        previous_station = get_previous_station(current_station)
        
        set_current_station(handler_input, previous_station)
        play_directive = create_play_directive(previous_station)
        
        speak_output = f"Playing {get_station_name(previous_station)}."
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .add_directive(play_directive)
                .set_should_end_session(True)
                .response
        )


class PauseIntentHandler(AbstractRequestHandler):
    """Handler for AMAZON.PauseIntent - stops audio playback."""
    
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.PauseIntent")(handler_input)
    
    def handle(self, handler_input):
        logger.info("AMAZON.PauseIntent received")
        
        return (
            handler_input.response_builder
                .add_directive(StopDirective())
                .set_should_end_session(True)
                .response
        )


class StopIntentHandler(AbstractRequestHandler):
    """Handler for AMAZON.StopIntent - stops audio playback."""
    
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.StopIntent")(handler_input)
    
    def handle(self, handler_input):
        logger.info("AMAZON.StopIntent received")
        
        speak_output = "Stopping playback. Goodbye!"
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .add_directive(StopDirective())
                .set_should_end_session(True)
                .response
        )


class ResumeIntentHandler(AbstractRequestHandler):
    """Handler for AMAZON.ResumeIntent - resumes the last station."""
    
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.ResumeIntent")(handler_input)
    
    def handle(self, handler_input):
        logger.info("AMAZON.ResumeIntent received")
        
        # Get the last played station or default to station 1
        current_station = get_current_station(handler_input)
        play_directive = create_play_directive(current_station)
        
        speak_output = f"Resuming {get_station_name(current_station)}."
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .add_directive(play_directive)
                .set_should_end_session(True)
                .response
        )


class CancelIntentHandler(AbstractRequestHandler):
    """Handler for AMAZON.CancelIntent."""
    
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.CancelIntent")(handler_input)
    
    def handle(self, handler_input):
        logger.info("AMAZON.CancelIntent received")
        
        speak_output = "Goodbye!"
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .add_directive(StopDirective())
                .set_should_end_session(True)
                .response
        )


class HelpIntentHandler(AbstractRequestHandler):
    """Handler for AMAZON.HelpIntent."""
    
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.HelpIntent")(handler_input)
    
    def handle(self, handler_input):
        logger.info("AMAZON.HelpIntent received")
        
        speak_output = (
            "This is My Radio Player. "
            f"You can choose from {len(STATIONS)} stations by saying a number from 1 to {len(STATIONS)}. "
            "You can also say next, previous, pause, or resume. "
            "What would you like to do?"
        )
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .ask(speak_output)
                .response
        )


class SessionEndedRequestHandler(AbstractRequestHandler):
    """Handler for SessionEndedRequest."""
    
    def can_handle(self, handler_input):
        return is_request_type("SessionEndedRequest")(handler_input)
    
    def handle(self, handler_input):
        logger.info("SessionEndedRequest received")
        # Cleanup logic here if needed
        return handler_input.response_builder.response


class IntentReflectorHandler(AbstractRequestHandler):
    """Fallback handler for unhandled intents."""
    
    def can_handle(self, handler_input):
        return True
    
    def handle(self, handler_input):
        intent_name = handler_input.request_envelope.request.intent.name
        logger.info(f"Unhandled intent: {intent_name}")
        
        speak_output = (
            "I'm not sure how to help with that. "
            "Try saying a station number, or say next, previous, pause, or resume."
        )
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .ask(speak_output)
                .response
        )


# ============================================================================
# EXCEPTION HANDLERS
# ============================================================================

class CatchAllExceptionHandler(AbstractExceptionHandler):
    """Generic error handler to catch any syntax or routing errors."""
    
    def can_handle(self, handler_input, exception):
        return True
    
    def handle(self, handler_input, exception):
        logger.error(exception, exc_info=True)
        
        speak_output = (
            "Sorry, I had trouble doing what you asked. "
            "Please try again."
        )
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .ask(speak_output)
                .response
        )


# ============================================================================
# SKILL BUILDER
# ============================================================================

# Create the skill builder instance
sb = SkillBuilder()

# Register request handlers
sb.add_request_handler(LaunchRequestHandler())
sb.add_request_handler(PlayStationIntentHandler())
sb.add_request_handler(NextIntentHandler())
sb.add_request_handler(PreviousIntentHandler())
sb.add_request_handler(PauseIntentHandler())
sb.add_request_handler(StopIntentHandler())
sb.add_request_handler(ResumeIntentHandler())
sb.add_request_handler(CancelIntentHandler())
sb.add_request_handler(HelpIntentHandler())
sb.add_request_handler(SessionEndedRequestHandler())
sb.add_request_handler(IntentReflectorHandler())  # Must be last

# Register exception handlers
sb.add_exception_handler(CatchAllExceptionHandler())

# Lambda handler
lambda_handler = sb.lambda_handler()
