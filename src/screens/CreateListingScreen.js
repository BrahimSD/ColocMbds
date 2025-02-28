import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import LocationStep from "../components/CreateListing/LocationStep";
import HousingStep from "../components/CreateListing/HousingStep";
import DetailsStep from "../components/CreateListing/DetailsStep";
import PhotosStep from "../components/CreateListing/PhotosStep";
import ServicesStep from "../components/CreateListing/ServicesStep";
import ContactStep from "../components/CreateListing/ContactStep";

const stepLabels = {
  1: "Localisation",
  2: "Logement",
  3: "Détails",
  4: "Photos",
  5: "Services",
  6: "Contact",
};

export default function CreateListingScreen({ navigation }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    street: "",
    postalCode: "",
    city: "",
    country: "",
    totalRoommates: "",
    bathrooms: "",
    privateArea: "",
    propertyType: "",
    totalArea: "",
    rooms: "",
    floor: "",
    furnished: false,
    availableDate: new Date().toISOString().split("T")[0],
    rent: "",
    title: "",
    description: "",
    photos: [],
    services: {
      wifi: false,
      handicapAccess: false,
      kitchenware: false,
      microwave: false,
      laundry: false,
      bikeParking: false,
      linens: false,
      washingMachine: false,
      tv: false,
      doubleBed: false,
      elevator: false,
      parking: false,
    },
    contactName: user?.displayName || "",
    contactPhone: "",
    contactEmail: user?.email || "",
    acceptTerms: false,
  });

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().isVerified) {
          setIsVerified(true);

          setFormData((prev) => ({
            ...prev,
            contactName: user.displayName || "",
            contactEmail: user.email || "",
          }));
        }
      } catch (error) {
        console.error("Error checking verification:", error);
      } finally {
        setLoading(false);
      }
    };

    checkVerification();
  }, [user]);

  const validateStep = (step) => {
    setError("");
    switch (step) {
      case 1:
        if (
          !formData.street ||
          !formData.postalCode ||
          !formData.city ||
          !formData.country
        ) {
          setError("Veuillez remplir tous les champs de localisation");
          return false;
        }
        break;
      case 2:
        if (
          !formData.totalRoommates ||
          !formData.bathrooms ||
          !formData.privateArea
        ) {
          setError("Veuillez remplir tous les champs concernant le logement");
          return false;
        }
        break;
      case 3:
        if (
          !formData.propertyType ||
          !formData.totalArea ||
          !formData.rooms ||
          !formData.availableDate ||
          !formData.rent ||
          !formData.title ||
          !formData.description
        ) {
          setError("Veuillez remplir tous les champs obligatoires des détails");
          return false;
        }
        break;
      case 4:
        if (formData.photos.length === 0) {
          setError("Veuillez ajouter au moins une photo");
          return false;
        }
        break;
      case 6:
        if (
          !formData.contactName ||
          !formData.contactPhone ||
          !formData.contactEmail ||
          !formData.acceptTerms
        ) {
          setError(
            "Veuillez remplir tous les champs de contact et accepter les conditions"
          );
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    Alert.alert(
      "Confirmer la publication",
      "Êtes-vous sûr de vouloir publier cette annonce ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Publier",
          onPress: async () => {
            try {
              setLoading(true);

              // Upload photos to Cloudinary
              const photoUrls = await Promise.all(
                formData.photos.map(async (photoUri) => {
                  const filename = photoUri.split("/").pop();
                  const match = /\.(\w+)$/.exec(filename);
                  const type = match ? `image/${match[1]}` : "image";

                  const formData = new FormData();
                  formData.append("file", {
                    uri: photoUri,
                    type,
                    name: filename,
                  });
                  formData.append("upload_preset", "colocations");

                  const response = await fetch(
                    "https://api.cloudinary.com/v1_1/colocation/upload",
                    {
                      method: "POST",
                      body: formData,
                      headers: {
                        "content-type": "multipart/form-data",
                      },
                    }
                  );

                  const data = await response.json();
                  return data.secure_url;
                })
              );

              // Create listing document
              const listingData = {
                location: {
                  street: formData.street,
                  postalCode: formData.postalCode,
                  city: formData.city,
                  country: formData.country,
                },
                housing: {
                  totalRoommates: parseInt(formData.totalRoommates),
                  bathrooms: parseInt(formData.bathrooms),
                  privateArea: parseInt(formData.privateArea),
                  totalArea: parseInt(formData.totalArea),
                  rooms: parseInt(formData.rooms),
                  floor: formData.floor ? parseInt(formData.floor) : 0,
                },
                details: {
                  propertyType: formData.propertyType,
                  furnished: formData.furnished,
                  availableDate: formData.availableDate,
                  rent: parseFloat(formData.rent),
                  title: formData.title,
                  description: formData.description,
                },
                photos: photoUrls,
                services: formData.services,
                contact: {
                  contactName: formData.contactName,
                  contactPhone: formData.contactPhone,
                  contactEmail: formData.contactEmail,
                },
                metadata: {
                  userId: user.uid,
                  userName: user.displayName || formData.contactName,
                  userPhotoURL: user.photoURL || null,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
                status: "pending",
                isVisible: true,
              };

              // Add document to Firestore
              const docRef = await addDoc(
                collection(db, "listings"),
                listingData
              );

              Alert.alert("Succès", "Votre annonce a été publiée avec succès", [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("MyListings"),
                },
              ]);
            } catch (error) {
              console.error("Error submitting listing:", error);
              Alert.alert(
                "Erreur",
                "Impossible de publier l'annonce: " + error.message
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <LocationStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <HousingStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <DetailsStep formData={formData} setFormData={setFormData} />;
      case 4:
        return <PhotosStep formData={formData} setFormData={setFormData} />;
      case 5:
        return <ServicesStep formData={formData} setFormData={setFormData} />;
      case 6:
        return <ContactStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C86F9" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageTitle}>Connexion requise</Text>
        <Text style={styles.messageText}>
          Veuillez vous connecter pour publier une annonce.
        </Text>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.messageButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isVerified) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageTitle}>Compte non vérifié</Text>
        <Text style={styles.messageText}>
          Votre compte doit être vérifié pour publier une annonce.
        </Text>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.messageButtonText}>Compléter mon profil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publier une annonce</Text>
          <View style={styles.placeholder}></View>
        </View>

        <View style={styles.progressContainer}>
          {Object.keys(stepLabels).map((step) => (
            <View
              key={step}
              style={[
                styles.progressStep,
                parseInt(step) <= currentStep ? styles.progressStepActive : {},
              ]}
            >
              <Text
                style={[
                  styles.progressStepText,
                  parseInt(step) <= currentStep
                    ? styles.progressStepTextActive
                    : {},
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.stepLabelContainer}>
          <Text style={styles.stepLabel}>{stepLabels[currentStep]}</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.formContainer}>{renderStep()}</View>

        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backStepButton}
              onPress={handlePrevious}
            >
              <Text style={styles.backStepButtonText}>Précédent</Text>
            </TouchableOpacity>
          )}

          {currentStep < 6 ? (
            <TouchableOpacity
              style={[
                styles.nextStepButton,
                currentStep === 1 ? { marginLeft: 0 } : {},
              ]}
              onPress={handleNext}
            >
              <Text style={styles.nextStepButtonText}>Suivant</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Publier l'annonce</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  messageText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  messageButton: {
    backgroundColor: "#4C86F9",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  progressStepActive: {
    backgroundColor: "#4C86F9",
  },
  progressStepText: {
    color: "#777",
    fontWeight: "bold",
  },
  progressStepTextActive: {
    color: "#fff",
  },
  stepLabelContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  stepLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  errorText: {
    color: "red",
    padding: 15,
    textAlign: "center",
  },
  formContainer: {
    padding: 15,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 40,
  },
  backStepButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#4C86F9",
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  backStepButtonText: {
    color: "#4C86F9",
    fontSize: 16,
    fontWeight: "bold",
  },
  nextStepButton: {
    backgroundColor: "#4C86F9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  nextStepButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
