import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "assistant" }[]
  >([]);

  useEffect(() => {
    (async () => {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!result.granted) {
        Alert.alert("Microphone permission denied");
      }
    })();
  }, []);

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

  const startListening = async () => {
    await ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: false,
      continuous: false,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Chat</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 16 }}
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
          </View>
        )}
      />

      <TouchableOpacity style={styles.micButton} onPress={startListening}>
        <Text style={styles.micText}>🎤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "80%",
  },
  userText: {
    color: "#fff",
    fontSize: 16,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 25,

    elevation: 5, // Android
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
  micText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "80%",
  },

  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ECECEC",
  },

  assistantText: {
    color: "#000",
    fontSize: 16,
  },
});