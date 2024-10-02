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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../Firebase";
import Toast from "react-native-toast-message";
import { FirebaseError } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Champs manquants",
        text2: "Veuillez remplir tous les champs.",
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Utilisateur inscrit avec succès:", userCredential.user);
      await setDoc(doc(database, "users", userCredential.user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
      });

      Toast.show({
        type: "success",
        text1: "Inscription réussie",
        text2: "Bienvenue!",
      });
      router.navigate("/taskList");
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Erreur lors de l'inscription :", firebaseError);
      let message = "Erreur lors de l'inscription.";
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          message = "L'email est déjà utilisé.";
          break;
        case "auth/invalid-email":
          message = "Email invalide.";
          break;
        case "auth/weak-password":
          message = "Mot de passe trop faible.";
          break;
        default:
          message = "Une erreur est survenue. Veuillez réessayer.";
          break;
      }
      Toast.show({
        type: "error",
        text1: "Erreur d'inscription",
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
          Inscription
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
          placeholder="Prénom"
          placeholderTextColor="#666"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            color: "#000",
          }}
          placeholder="Nom"
          placeholderTextColor="#666"
          value={lastName}
          onChangeText={setLastName}
        />
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
            marginBottom: 10,
            color: "#000",
          }}
          placeholder="Mot de passe"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
            color: "#000",
          }}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor="#666"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            padding: 15,
            backgroundColor: "#41C9E2",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            marginVertical: 20,
          }}
          onPress={handleRegister}
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
              Inscription
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.navigate("/login")}>
          <Text
            style={{
              fontWeight: "600",
              textTransform: "uppercase",
              color: "white",
            }}
          >
            Connexion
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
