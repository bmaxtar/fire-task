import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StartScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#1c1b43", paddingHorizontal: 10 }}
    >
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Image
          source={require("../assets/img2.png")}
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
          By completing your tasks, you unlock your potential and achieve
          success.
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
          onPress={() => router.navigate("/login")}
        >
          <Text
            style={{
              fontWeight: "700",
              textTransform: "uppercase",
            }}
          >
            next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
