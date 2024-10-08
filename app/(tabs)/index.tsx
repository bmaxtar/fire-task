import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#1c1b43", paddingHorizontal: 20 }}
    >
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Image
          source={require("../../assets/img1.png")}
          style={{ with: 250, height: 400, resizeMode: "contain" }}
        />
        <Text
          style={{
            fontSize: 20,
            color: "white",
            fontWeight: "700",
            paddingVertical: 20,
          }}
        >
          Build the future by completing tasks.
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: "white",
            fontWeight: "600",
            paddingVertical: 20,
          }}
        >
          Your tasks are bridges leading to the future. By completing them,
          reach your potential and your dreams.
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 20,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 15,
            backgroundColor: "#41C9E2",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => router.navigate("/start")}
        >
          <Text
            style={{
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            get started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
