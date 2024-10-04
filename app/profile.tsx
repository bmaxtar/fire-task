import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { database, storage } from "@/Firebase";
import { getAuth, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EditProfile = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(
    user?.photoURL ||
      "https://gravatar.com/avatar/93ff5d2fb05c5c11986911e9f7f264f3?s=400&d=robohash&r=x"
  );
  const [bgImage, setBgImage] = useState(
    "https://picsum.photos/seed/picsum/600/200"
  );
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userDocRef = doc(database, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.bgImage) {
            setBgImage(userData.bgImage);
          }
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (user) {
      setLoading(true);
      try {
        await updateProfile(user, {
          displayName: name,
          photoURL: avatar,
        });
        const userDocRef = doc(database, "users", user.uid);
        await setDoc(
          userDocRef,
          {
            email: email,
            displayName: name,
            photoURL: avatar,
            bgImage: bgImage,
          },
          { merge: true }
        );
        Toast.show({
          type: "success",
          text1: "Profil mis à jour",
          text2: `Nom: ${name}, Email: ${email}, Avatar mis à jour`,
        });
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Erreur lors de la mise à jour du profil.",
        });
        console.error("Erreur lors de la mise à jour du profil :", error);
      } finally {
        setLoading(false);
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Utilisateur non connecté.",
      });
    }
  };

  const uploadImageToStorage = async (imageUri: string): Promise<string> => {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const imageRef = ref(storage, `images/${user?.uid}/${Date.now()}.jpg`);
    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  const pickImage = async (setImage: (imageUri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const imageUrl = await uploadImageToStorage(result.assets[0].uri);
      setImage(imageUrl);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => pickImage(setBgImage)}>
        <View style={styles.headerBackgroundContainer}>
          <Image source={{ uri: bgImage }} style={styles.headerBackground} />
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => pickImage(setAvatar)}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.profileInfoContainer}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nom complet"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveButtonText}>Sauvegarder</Text>
        {isLoading && <ActivityIndicator size="small" color="#fff" />}
      </TouchableOpacity>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerBackgroundContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#cccccc",
    position: "relative",
  },
  headerBackground: {
    width: "100%",
    height: "100%",
  },
  avatarContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#ffffff",
    overflow: "hidden",
    backgroundColor: "#1E1B3C",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
  },
  iconContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#1DA1F2",
    borderRadius: 15,
    padding: 5,
  },
  profileInfoContainer: {
    marginTop: 60,
    paddingHorizontal: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    fontSize: 16,
    paddingVertical: 8,
    marginVertical: 10,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#1DA1F2",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignSelf: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
});
