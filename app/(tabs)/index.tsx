import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export default function HomeScreen() {
  // STATE MANAGEMENT
  // messages: Stores the chat conversation history with sender (user or assistant) and text content
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "assistant" }[]
  >([]);
  // isListening: Tracks whether speech recognition is currently active
  const [isListening, setIsListening] = useState(false);
  // flatListRef: Reference to the FlatList component to control scrolling programmatically
  const flatListRef = useRef<FlatList>(null);

  // PERMISSION REQUEST
  // Runs once when component mounts to request microphone permission
  // Required for speech recognition to work on mobile devices
  useEffect(() => {
    (async () => {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!result.granted) {
        Alert.alert("Microphone permission denied");
      }
    })();
  }, []);

  // SPEECH RECOGNITION EVENT HANDLERS
  // "result" event: Triggered when speech recognition returns transcribed text
  // Adds user message to chat, then simulates assistant response after 700ms delay
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript;

    if (!transcript) return;

    setMessages((prev) => [
      ...prev,
      { text: transcript, sender: "user" },
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "I heard: " + transcript,
          sender: "assistant",
        },
      ]);
    }, 700);
  });

  // "end" event: Triggered when speech recognition stops listening
  // Updates isListening state to false
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  // START LISTENING FUNCTION
  // Initiates speech recognition with English language
  // Sets isListening to true and configures recognition settings
  const startListening = async () => {
    setIsListening(true);

    await ExpoSpeechRecognitionModule.start({
      lang: "en-US", // Language for speech recognition
      interimResults: false, // Don't show partial results
      continuous: false, // Stop after one utterance
    });
  };

  // VOICE ORB ANIMATION
  // Creates a pulsing animation effect for the voice orb
  // scale: Shared value that controls the orb's size (starts at 1)
  const scale = useSharedValue(1);

  // Animation sequence: Scale up to 1.08, then down to 0.94, repeat infinitely
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200 }), // Scale up over 1.2s
        withTiming(0.94, { duration: 1200 }) // Scale down over 1.2s
      ),
      -1, // Repeat infinitely
      true // Reverse animation on each repeat
    );
  }, []);

  // Converts the shared value into an animated style for the orb
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      {/* Top navigation bar with menu button, app title, and options button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn}>
          <Feather name="menu" size={34} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          <Text style={{ color: "#111", fontWeight: "700" }}>
            ChatGPT
          </Text>
          <Text style={{ color: "#555" }}> Voice</Text>
        </Text>

        <TouchableOpacity style={styles.circleBtn}>
          <Ionicons
            name="ellipsis-horizontal"
            size={30}
            color="#111"
          />
        </TouchableOpacity>
      </View>

      {/* CHAT MESSAGE LIST */}
      {/* Displays all messages in the conversation */}
      {/* Auto-scrolls to bottom when new messages are added */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "user"
                ? styles.userBubble
                : styles.assistantBubble,
            ]}
          >
            <Text
              style={
                item.sender === "user"
                  ? styles.userText
                  : styles.assistantText
              }
            >
              {item.text}
            </Text>

            {/* ACTION BUTTONS FOR ASSISTANT MESSAGES */}
            {/* Only shown for assistant messages: copy, thumbs up/down, volume, share, more options */}
            {item.sender === "assistant" && (
              <View style={styles.actionRow}>
                <TouchableOpacity>
                  <Ionicons
                    name="copy-outline"
                    size={18}
                    color="#666"
                  />
                </TouchableOpacity>

                <TouchableOpacity>
                  <Feather
                    name="thumbs-up"
                    size={18}
                    color="#666"
                  />
                </TouchableOpacity>

                <TouchableOpacity>
                  <Feather
                    name="thumbs-down"
                    size={18}
                    color="#666"
                  />
                </TouchableOpacity>

                <TouchableOpacity>
                  <Ionicons
                    name="volume-medium-outline"
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>

                <TouchableOpacity>
                  <Ionicons name="share-social-outline" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      />

      {/* VOICE ORB BUTTON */}
      {/* Animated circular button with gradient that triggers speech recognition when pressed */}
      {/* Positioned absolutely at bottom center with pulsing animation */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={startListening}
      >
        <Animated.View style={[styles.voiceOrb, orbStyle]}>
          <LinearGradient
            colors={[
              "#F9FAF6",
              "#D9F4FF",
              "#77C8FF",
              "#1976FF",
            ]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.voiceGradient}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* BOTTOM INPUT CONTAINER */}
      {/* Contains text input box, microphone button, and close button */}
      <View style={styles.bottomContainer}>
        <View style={styles.inputBox}>
          <TouchableOpacity>
            <Feather name="plus" size={34} color="#111" />
          </TouchableOpacity>

          <Text style={styles.placeholder}>Type</Text>
        </View>

        {/* Microphone button for alternative voice input (currently commented out) */}
        <TouchableOpacity
          style={styles.voiceButton}
        // onPress={startListening}
        >
          <MaterialCommunityIcons
            name="microphone-outline"
            size={36}
            color="#111"
          />
        </TouchableOpacity>

        {/* Close button to dismiss or clear input */}
        <TouchableOpacity style={styles.closeButton}>
          <Ionicons
            name="close"
            size={42}
            color="#fff"
          />        </TouchableOpacity>
      </View>
    </View>
  );
}

// STYLESHEET
// Contains all styling definitions for the UI components
const styles = StyleSheet.create({
  // Main container: Full screen with white background
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // User message bubble: Aligned right, light gray background
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#F3F3F3", // ChatGPT light green
    padding: 12,
    borderRadius: 22,
    borderBottomRightRadius: 6,
    marginBottom: 10,
    maxWidth: "82%",
  },

  // User message text color and size
  userText: {
    color: "#111",
    fontSize: 16,
  },

  // Microphone button style (unused in current implementation)
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 25,

    elevation: 5, // Android shadow
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  // Microphone button text style
  micText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  // Base bubble style (overridden by userBubble/assistantBubble)
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "80%",
  },

  // Assistant message bubble: Aligned left, white background
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    marginBottom: 10,
    maxWidth: "82%",
  },

  // Assistant message text color and size
  assistantText: {
    color: "#111",
    fontSize: 16,
  },

  // Header container: Top bar with menu and options buttons
  header: {
    marginTop: 55,
    marginHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Header title: App name styling
  headerTitle: {
    flex: 1,
    marginLeft: 18,
    fontSize: 23,
    fontWeight: "600",
  },

  // Circular button style for menu and options
  circleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Voice orb: Animated circular button positioned at bottom center
  voiceOrb: {
    alignSelf: "center",
    // marginBottom: 32,
    position: "absolute",
    bottom: 32,

    // shadowColor: "#2F80ED",
    // shadowOpacity: 0.35,
    // shadowRadius: 30,
    // shadowOffset: {
    //   width: 0,
    //   height: 12,
    // },
  },

  // Voice orb gradient container
  voiceGradient: {
    width: 118,
    height: 118,
    borderRadius: 59,
    overflow: "hidden",
  },

  // Bottom container: Holds input box and action buttons
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 28,
  },

  // Input box: Text input area with plus button
  inputBox: {
    flex: 1,
    height: 72,
    backgroundColor: "#F7F7F7",
    borderRadius: 36,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  // Placeholder text styling
  placeholder: {
    color: "#888",
    fontSize: 20,
    marginLeft: 16,
  },

  // Voice button: Alternative microphone input button
  voiceButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
  },

  // Close button: Black circular button to dismiss input
  closeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
  },

  // Action row: Horizontal layout for assistant message action buttons
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 18,
  },
});