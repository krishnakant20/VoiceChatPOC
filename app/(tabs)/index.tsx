import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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

export default function HomeScreen() {
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "assistant" }[]
  >([]);
  const [isListening, setIsListening] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  const startListening = async () => {
    setIsListening(true);

    await ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: false,
      continuous: false,
    });
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Chat</Text>
      </View> */}

      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn}>
          <Feather name="menu" size={34} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>ChatGPT</Text>
          <Text style={{ color: "#9ca3af" }}> Voice</Text>
        </Text>

        <TouchableOpacity style={styles.circleBtn}>
          <Ionicons
            name="ellipsis-horizontal"
            size={30}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

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
          </View>
        )}
      />

      <TouchableOpacity
        style={[
          styles.micButton,
          { backgroundColor: isListening ? "#EF4444" : "#111827" },
        ]}
        onPress={startListening}>
        <Text style={styles.micText}>
          {isListening ? "🎙️" : "🎤"}
        </Text>
      </TouchableOpacity>
      <View style={styles.bottomContainer}>
        <View style={styles.inputBox}>
          <TouchableOpacity>
            <Feather name="plus" size={32} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.placeholder}>Type</Text>
        </View>

        <TouchableOpacity
          style={styles.voiceButton}
          onPress={startListening}
        >
          <MaterialCommunityIcons
            name="microphone-outline"
            size={34}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton}>
          <Ionicons name="close" size={42} color="#000" />
        </TouchableOpacity>
      </View>
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
  // header: {
  //   height: 70,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   borderBottomWidth: 1,
  //   borderBottomColor: "#ddd",
  // },

  // headerTitle: {
  //   fontSize: 22,
  //   fontWeight: "bold",
  // },
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
  header: {
    marginTop: 55,
    marginHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 18,
    fontSize: 24,
  },

  circleBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#1f1f1f",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3b3b3b",
  },

  voiceOrb: {
    alignSelf: "center",
    marginBottom: 35,
  },

  voiceGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#3B82F6",
  },

  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 30,
  },

  inputBox: {
    flex: 1,
    height: 72,
    backgroundColor: "#1f1f1f",
    borderRadius: 36,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  placeholder: {
    color: "#9ca3af",
    fontSize: 20,
    marginLeft: 18,
  },

  voiceButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1f1f1f",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
  },

  closeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
  },
});