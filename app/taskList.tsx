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
  getDocs,
} from "firebase/firestore";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  Task,
} from "@/store/tasksSlice";

const TaskListScreen = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(
    (state: { tasks: { tasks: Task[] } }) => state.tasks.tasks
  );

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const bottomSheetModalRef = useRef<BottomSheetModal | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(database, "tasks"));
        const tasksData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "",
            completed: data.completed || false,
            favorite: data.favorite || false,
          };
        });
        dispatch(setTasks(tasksData));
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [dispatch]);

  const toggleCompletion = async (id: string) => {
    const task = tasks.find((task) => task.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };
    await updateDoc(doc(database, "tasks", id), {
      completed: updatedTask.completed,
    });
    dispatch(updateTask(updatedTask));
  };

  const handleEdit = (id: string, title: string) => {
    setIsEditing(id);
    setNewTitle(title);
  };

  const saveEdit = async (id: string) => {
    if (newTitle.trim() === "") return;

    const updatedTask = {
      ...tasks.find((task) => task.id === id)!,
      title: newTitle,
    };
    await updateDoc(doc(database, "tasks", id), { title: newTitle });
    dispatch(updateTask(updatedTask));
    setIsEditing(null);
    setNewTitle("");
  };

  const deleteTaskHandler = async (id: string) => {
    Alert.alert(
      "Confirmation",
      "Es-tu sûr de vouloir supprimer cette tâche ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          onPress: async () => {
            await deleteDoc(doc(database, "tasks", id));
            dispatch(deleteTask(id));
            Toast.show({
              type: "success",
              text1: "Tâche supprimée avec succès!",
            });
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

      const docRef = await addDoc(collection(database, "tasks"), newTask);
      dispatch(addTask({ id: docRef.id, ...newTask }));
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

    const updatedTask = { ...task, favorite: !task.favorite };
    await updateDoc(doc(database, "tasks", id), {
      favorite: updatedTask.favorite,
    });
    dispatch(updateTask(updatedTask));
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
          <View style={{ alignItems: "center" }}>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#41c9e1",
                padding: 5,
                width: 100,
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => saveEdit(item.id)}
            >
              <Ionicons name="checkmark-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text
            style={[styles.taskText, item.completed && styles.completedTask]}
          >
            {item.title}
          </Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={{ marginLeft: 5 }}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons
              name={item.favorite ? "heart" : "heart-outline"}
              size={18}
              color="#ff6347"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEdit(item.id, item.title)}
            style={{ marginLeft: 10 }}
          >
            <FontAwesome name="pencil-square-o" size={18} color="#ff6347" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deleteTaskHandler(item.id)}
            style={{ marginLeft: 10 }}
          >
            <Ionicons name="trash" size={18} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <BottomSheetModalProvider>
      <View
        style={{ flex: 1, backgroundColor: "#1E1B3C", paddingHorizontal: 10 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Liste des Tâches</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutUI}>
            <Ionicons name="log-out-outline" size={18} color="#000" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#41c9e1" />
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            style={{ marginTop: 20 }}
          />
        )}
        <TouchableOpacity
          style={styles.addButtonContainer}
          onPress={() => bottomSheetModalRef.current?.present()}
        >
          <Entypo name="plus" size={24} color="#fff" />
        </TouchableOpacity>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={["50%"]}
          handleIndicatorStyle={{ backgroundColor: "#41c9e1" }}
        >
          <View style={styles.contentContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nouvelle Tâche"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={addTaskHandler}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

export default TaskListScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 24,
    color: "white",
  },
  logoutUI: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  circleCompleted: {
    backgroundColor: "#4CAF50",
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#F2F2F2",
    marginBottom: 20,
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 10,
    padding: 10,
  },
  buttonContainer: {
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#41c9e1",
    padding: 15,
    borderRadius: 10,
    width: "100%",
  },
  addButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 20,
    backgroundColor: "#41c9e1",
    borderRadius: 10,
    width: 50,
    height: 50,
  },
  addButton: {
    backgroundColor: "#41c9e1",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  submitButton: {
    backgroundColor: "#41c9e1",
    padding: 15,
    borderRadius: 10,
    width: "100%",
  },
  submitButtonText: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
    color: "white",
  },
});
