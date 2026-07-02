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

  // orb
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200 }),
        withTiming(0.94, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
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
                  <Ionicons name="share" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      />

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
      <View style={styles.bottomContainer}>
        <View style={styles.inputBox}>
          <TouchableOpacity>
            <Feather name="plus" size={34} color="#111" />
          </TouchableOpacity>

          <Text style={styles.placeholder}>Type</Text>
        </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#F3F3F3", // ChatGPT light green
    padding: 12,
    borderRadius: 22,
    borderBottomRightRadius: 6,
    marginBottom: 10,
    maxWidth: "82%",
  },
  userText: {
    color: "#111",
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
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "80%",
  },

  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    marginBottom: 10,
    maxWidth: "82%",
  },

  assistantText: {
    color: "#111",
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
    fontSize: 23,
    fontWeight: "600",
  },
  circleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },
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
  voiceGradient: {
    width: 118,
    height: 118,
    borderRadius: 59,
    overflow: "hidden",
  },

  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 28,
  },

  inputBox: {
    flex: 1,
    height: 72,
    backgroundColor: "#F7F7F7",
    borderRadius: 36,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  placeholder: {
    color: "#888",
    fontSize: 20,
    marginLeft: 16,
  },

  voiceButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
  },
  closeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 18,
  },
});