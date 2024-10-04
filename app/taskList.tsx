import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { auth, database } from "../Firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { router, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { setTasks, Task } from "@/store/tasksSlice";

const TaskListScreen = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(
    (state: { tasks: { tasks: Task[] } }) => state.tasks.tasks
  );
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const bottomSheetModalRef = useRef<BottomSheetModal | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const id = Math.random();
    setLoading(true);
    const tasksRef = collection(database, "tasks");
    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        console.log("fetchTasks", id);
        const tasksData: Task[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "",
            completed: data.completed || false,
            favorite: data.favorite || false,
          };
        });
        dispatch(setTasks(tasksData));
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error(
          "Erreur lors de la récupération des tâches en temps réel :",
          error
        );
        setLoading(false);
        setRefreshing(false);
      }
    );
    return () => unsubscribe();
  };

  const toggleCompletion = async (id: string) => {
    const task = tasks.find((task) => task.id === id);
    if (!task) return;
    try {
      const updatedTask = { completed: !task.completed };
      await updateDoc(doc(database, "tasks", id), {
        completed: updatedTask.completed,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche :", error);
    }
  };

  const handleEdit = (id: string, title: string) => {
    setIsEditing(id);
    setNewTitle(title);
  };

  const saveEdit = async (id: string) => {
    if (newTitle.trim() === "") return;
    setLoading(true);
    try {
      await updateDoc(doc(database, "tasks", id), { title: newTitle });
      setIsEditing(null);
      setNewTitle("");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la tâche :", error);
      Alert.alert("Erreur", "Erreur lors de la sauvegarde de la tâche.");
    } finally {
      setLoading(false);
    }
  };

  const deleteTaskHandler = async (id: string) => {
    Alert.alert(
      "Confirmation",
      "Es-tu sûr de vouloir supprimer cette tâche ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            try {
              await deleteDoc(doc(database, "tasks", id));
              Toast.show({
                type: "success",
                text1: "Tâche supprimée avec succès!",
              });
            } catch (error) {
              console.error(
                "Erreur lors de la suppression de la tâche :",
                error
              );
              Toast.show({
                type: "error",
                text1: "Erreur lors de la suppression de la tâche",
              });
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const addTaskHandler = async () => {
    if (newTitle.trim() === "") return;
    setLoading(true);
    try {
      const newTask = {
        title: newTitle,
        completed: false,
        favorite: false,
      };
      await addDoc(collection(database, "tasks"), newTask);
      setNewTitle("");
      bottomSheetModalRef.current?.close();
      Toast.show({ type: "success", text1: "Tâche ajoutée avec succès!" });
    } catch (e) {
      console.error("Erreur d'ajout: ", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    const task = tasks.find((task) => task.id === id);
    if (!task) return;
    try {
      const updatedTask = { favorite: !task.favorite };
      await updateDoc(doc(database, "tasks", id), {
        favorite: updatedTask.favorite,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du favori :", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("Déconnexion réussie");
      router.replace("/login");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity onPress={() => toggleCompletion(item.id)}>
        <View
          style={[styles.circle, item.completed && styles.circleCompleted]}
        />
      </TouchableOpacity>
      <View style={styles.taskContainer}>
        {isEditing === item.id ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.inputEditing}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => saveEdit(item.id)}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark-outline" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <Text
            style={[styles.taskText, item.completed && styles.completedTask]}
          >
            {item.title}
          </Text>
        )}

        {!isEditing && (
          <View style={styles.iconsContainer}>
            <TouchableOpacity
              style={{ marginLeft: 5 }}
              onPress={() => toggleFavorite(item.id)}
            >
              <Ionicons
                name={item.favorite ? "heart" : "heart-outline"}
                size={24}
                color="#ff6347"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleEdit(item.id, item.title)}
              style={{ marginLeft: 10 }}
            >
              <FontAwesome name="pencil-square-o" size={24} color="#ff6347" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteTaskHandler(item.id)}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Fire-Task",
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => router.navigate("/profile")}>
                <Ionicons name="person-outline" size={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={logout} style={styles.logoutUI}>
                <Ionicons name="log-out-outline" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <BottomSheetModalProvider>
        <View
          style={{ flex: 1, backgroundColor: "#1E1B3C", paddingHorizontal: 10 }}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Liste des Tâches</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#41c9e1" />
          ) : tasks.length > 0 ? (
            <FlatList
              data={tasks}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "500" }}>
                Aucune tâche disponible
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.addTaskButton}
            onPress={() => bottomSheetModalRef.current?.present()}
          >
            <Entypo name="plus" size={18} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 5 }}>
              Ajouter une tâche
            </Text>
          </TouchableOpacity>
          <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={["40%", "90%"]}
          >
            <View style={{ flex: 1, padding: 10 }}>
              <TextInput
                placeholder="Nom de la tâche"
                value={newTitle}
                onChangeText={setNewTitle}
                style={styles.inputModal}
              />
              <TouchableOpacity
                style={styles.saveButtonAdd}
                onPress={addTaskHandler}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff" }}>Ajouter la tâche</Text>
                )}
              </TouchableOpacity>
            </View>
          </BottomSheetModal>
        </View>
      </BottomSheetModalProvider>
    </View>
  );
};

export default TaskListScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    color: "#41c9e1",
  },
  logoutUI: {
    backgroundColor: "#41c9e1",
    borderRadius: 5,
    padding: 5,
    marginLeft: 20,
  },
  addTaskButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#41c9e1",
    padding: 15,
    borderRadius: 10,
  },
  circle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#41c9e1",
  },
  circleCompleted: {
    backgroundColor: "#41c9e1",
  },
  taskContainer: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  inputEditing: {
    borderColor: "#41c9e1",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    color: "#fff",
    flex: 1,
    marginRight: 10,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskText: {
    fontSize: 16,
    color: "#fff",
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  input: {
    borderColor: "#41c9e1",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    height: 50,
  },
  inputModal: {
    borderColor: "#41c9e1",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    height: 50,
  },
  saveButton: {
    backgroundColor: "#41c9e1",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonAdd: {
    backgroundColor: "#41c9e1",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});
