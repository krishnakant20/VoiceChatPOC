import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
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
    console.log("Recognized:", event.results[0]?.transcript);
  });

  const startListening = async () => {
    await ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: false,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Chat POC</Text>

      <Button title="Start Listening" onPress={startListening} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
});