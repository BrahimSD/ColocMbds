import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    photoURL: "",
    budget: "",
    location: "",
    housingType: "",
    description: "",
    studentCard: "",
    isVerified: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile((prev) => ({
            ...prev,
            photoURL: userData.photoURL || auth.currentUser.photoURL || null,
            budget: userData.budget || "",
            location: userData.location || "",
            housingType: userData.housingType || "",
            description: userData.description || "",
            studentCard: userData.studentCardURL || "",
            isVerified: userData.isVerified || false,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Erreur", "Impossible de charger les données du profil");
    }
  };

  const handleImagePick = async (type) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin de votre permission pour accéder à la galerie"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "profile" ? [1, 1] : [3, 2],
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "upload.jpg",
        });
        formData.append(
          "upload_preset",
          process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        );

        const response = await fetch(process.env.EXPO_PUBLIC_CLOUDINARY_URL, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!data.secure_url) {
          throw new Error("Échec du téléchargement de l'image");
        }

        const userRef = doc(db, "users", auth.currentUser.uid);
        if (type === "profile") {
          await updateDoc(userRef, {
            photoURL: data.secure_url,
            updatedAt: serverTimestamp(),
          });
          setProfile((prev) => ({ ...prev, photoURL: data.secure_url }));
        } else {
          await updateDoc(userRef, {
            studentCardURL: data.secure_url,
            status: "pending",
            updatedAt: serverTimestamp(),
          });
          setProfile((prev) => ({ ...prev, studentCard: data.secure_url }));
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Erreur", "Échec du téléchargement de l'image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!profile.budget) {
      Alert.alert("Erreur", "Veuillez entrer votre budget");
      return;
    }
    if (!profile.location) {
      Alert.alert("Erreur", "Veuillez entrer votre localisation préférée");
      return;
    }
    if (!profile.housingType) {
      Alert.alert("Erreur", "Veuillez sélectionner un type de logement");
      return;
    }
    if (!profile.description) {
      Alert.alert("Erreur", "Veuillez entrer une description");
      return;
    }
    if (!profile.studentCard) {
      Alert.alert("Erreur", "Veuillez télécharger votre carte étudiante");
      return;
    }

    setIsLoading(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        budget: parseFloat(profile.budget),
        location: profile.location,
        housingType: profile.housingType,
        description: profile.description,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Succès", "Profil mis à jour avec succès", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Erreur", "Échec de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <View style={styles.placeholder}></View>
      </View>
      <View style={styles.profileContainer}>
        <View style={styles.photoSection}>
          <Image
            source={
              profile.photoURL
                ? { uri: profile.photoURL }
                : require("../../assets/default-avatar.png")
            }
            style={styles.profilePhoto}
          />
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleImagePick("profile")}
          >
            <Text style={styles.uploadButtonText}>Changer la photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Budget (€/mois)</Text>
          <TextInput
            style={styles.input}
            value={profile.budget.toString()}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, budget: text }))
            }
            keyboardType="numeric"
            placeholder="Votre budget mensuel"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Localisation préférée</Text>
          <TextInput
            style={styles.input}
            value={profile.location}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, location: text }))
            }
            placeholder="Ville, quartier..."
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Type de logement</Text>
          <TextInput
            style={styles.input}
            value={profile.housingType}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, housingType: text }))
            }
            placeholder="Appartement, maison..."
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>À propos de vous</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.description}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, description: text }))
            }
            placeholder="Décrivez-vous, vos hobbies..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Carte Étudiante</Text>
          {profile.studentCard ? (
            <View style={styles.studentCardPreview}>
              <Image
                source={{ uri: profile.studentCard }}
                style={styles.studentCardImage}
              />
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleImagePick("studentCard")}
              >
                <Text style={styles.uploadButtonText}>Changer la carte</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleImagePick("studentCard")}
            >
              <Text style={styles.uploadButtonText}>
                Télécharger la carte étudiante
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Enregistrer le profil</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: "#4C86F9",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 20,
  },
  cancelButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#4C86F9",
  },
  cancelButtonText: {
    color: "#4C86F9",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  profileContainer: {
    padding: 20,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  uploadButton: {
    backgroundColor: "#4C86F9",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  uploadButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  studentCardPreview: {
    marginTop: 10,
  },
  studentCardImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#4C86F9",
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
