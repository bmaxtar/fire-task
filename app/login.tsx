import { useState } from "react";
import { router } from "expo-router";
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Firebase";
import Toast from "react-native-toast-message";
import { FirebaseError } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Champs manquants",
        text2: "Veuillez remplir tous les champs.",
      });
      return;
    }

    // Validation simple de l'email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Toast.show({
        type: "error",
        text1: "Email invalide",
        text2: "Veuillez entrer un email valide.",
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Connexion réussie :", userCredential.user);
      Toast.show({
        type: "success",
        text1: "Connexion réussie",
        text2: "Bienvenue!",
      });

      // Stockage de l'email dans AsyncStorage
      await AsyncStorage.setItem("lastEmail", email);
      router.navigate("/taskList");
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Erreur lors de la connexion :", firebaseError);
      let message = "Erreur de connexion.";
      switch (firebaseError.code) {
        case "auth/invalid-email":
          message = "Email invalide.";
          break;
        case "auth/wrong-password":
          message = "Mot de passe incorrect.";
          break;
        case "auth/user-not-found":
          message = "Aucun utilisateur trouvé avec cet email.";
          break;
        case "auth/user-disabled":
          message = "L'utilisateur a été désactivé.";
          break;
        case "auth/invalid-credential":
          message = "Les informations d'identification sont invalides.";
          break;
        default:
          message = "Une erreur est survenue. Veuillez réessayer.";
          break;
      }
      Toast.show({
        type: "error",
        text1: "Erreur de connexion",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#1c1b43", paddingHorizontal: 10 }}
    >
      <Toast />
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginVertical: 20,
        }}
      >
        <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
          Connexion
        </Text>
      </View>

      <View style={{ marginVertical: 20 }}>
        <TextInput
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            color: "#000",
          }}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
            color: "#000",
          }}
          placeholder="Mot de passe"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            padding: 15,
            backgroundColor: "#41C9E2",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text
              style={{
                fontWeight: "600",
                textTransform: "uppercase",
                color: "white",
              }}
            >
              Connexion
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginVertical: 20,
        }}
      >
        <TouchableOpacity onPress={() => router.navigate("/register")}>
          <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
            Inscription
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
