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
  const [messages, setMessages] = useState<string[]>([]);

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

    if (transcript) {
      setMessages((prev) => [...prev, transcript]);
    }
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
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{item}</Text>
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
    backgroundColor: "#222",
    padding: 16,
    alignItems: "center",
    margin: 16,
    borderRadius: 30,
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
});