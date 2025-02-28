import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
  Share,
} from "react-native";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

const windowWidth = Dimensions.get("window").width;

export default function ListingDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data()?.isAdmin || false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
    fetchListing();
  }, []);

  const checkIfReported = (listing) => {
    if (!user || !listing?.reports) return false;
    return listing.reports.some((report) => report.userId === user.uid);
  };

  const fetchListing = async () => {
    try {
      const listingDoc = await getDoc(doc(db, "listings", id));

      if (listingDoc.exists()) {
        const listingData = {
          id: listingDoc.id,
          ...listingDoc.data(),
          contact: {
            ...listingDoc.data().contact,
            name:
              listingDoc.data().metadata?.userName ||
              listingDoc.data().contact?.contactName,
          },
        };

        if (listingData.status === "blocked" && !isAdmin) {
          Alert.alert("Annonce bloquée", "Cette annonce n'est plus disponible");
          navigation.goBack();
          return;
        }

        setListing(listingData);
        setReported(checkIfReported(listingData));
      } else {
        Alert.alert("Erreur", "Cette annonce n'existe pas");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      Alert.alert("Erreur", "Impossible de charger l'annonce");
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour contacter l'annonceur",
        [
          {
            text: "Se connecter",
            onPress: () => navigation.navigate("Login"),
          },
          {
            text: "Annuler",
            style: "cancel",
          },
        ]
      );
      return;
    }

    if (listing?.contact?.contactPhone) {
      Linking.openURL(`tel:${listing.contact.contactPhone}`);
    } else if (listing?.contact?.contactEmail) {
      Linking.openURL(`mailto:${listing.contact.contactEmail}`);
    } else {
      Alert.alert("Erreur", "Aucune information de contact disponible");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez cette colocation: ${listing.details.title} - ${listing.details.rent}€/mois à ${listing.location.city}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleReport = async () => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour signaler une annonce",
        [
          {
            text: "Se connecter",
            onPress: () => navigation.navigate("Login"),
          },
          {
            text: "Annuler",
            style: "cancel",
          },
        ]
      );
      return;
    }

    if (reported || checkIfReported(listing)) {
      Alert.alert("Déjà signalé", "Vous avez déjà signalé cette annonce");
      return;
    }

    try {
      const listingRef = doc(db, "listings", id);

      await updateDoc(listingRef, {
        reports: arrayUnion({
          userId: user.uid,
          userName: user.displayName || user.email,
          date: new Date().toISOString(),
          reason: "Contenu inapproprié",
          reportedAt: new Date().toISOString(),
        }),
      });

      setReported(true);
      Alert.alert("Succès", "Annonce signalée avec succès");
    } catch (error) {
      console.error("Error reporting listing:", error);
      Alert.alert("Erreur", "Échec du signalement");
    }
  };

  const renderAmenities = () => {
    if (!listing || !listing.services) return null;

    return (
      <View style={styles.amenitiesContainer}>
        {Object.entries(listing.services).map(
          ([key, value]) =>
            value && (
              <View key={key} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{formatAmenityName(key)}</Text>
              </View>
            )
        )}
        {listing.details?.furnished && (
          <View style={styles.amenityTag}>
            <Text style={styles.amenityText}>Meublé</Text>
          </View>
        )}
      </View>
    );
  };

  const getAmenityLabel = (key) => {
    const amenitiesMap = {
      wifi: "Wifi",
      handicapAccess: "Accès handicapé",
      kitchenware: "Équipement cuisine",
      microwave: "Micro-ondes",
      laundry: "Laverie",
      bikeParking: "Parking vélo",
      linens: "Linge de maison",
      washingMachine: "Lave-linge",
      tv: "TV",
      doubleBed: "Lit double",
      elevator: "Ascenseur",
      parking: "Parking",
    };
    return amenitiesMap[key];
  };

  const formatAmenityName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C86F9" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.photoContainer}>
        {listing?.photos && listing.photos.length > 0 ? (
          <>
            <Image
              source={{ uri: listing.photos[currentPhotoIndex] }}
              style={styles.mainPhoto}
              resizeMode="cover"
            />
            {listing.photos.length > 1 && (
              <View style={styles.photoControls}>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentPhotoIndex((prev) =>
                      prev > 0 ? prev - 1 : listing.photos.length - 1
                    )
                  }
                  style={styles.photoButton}
                  disabled={listing.photos.length <= 1}
                >
                  <Text style={styles.photoButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.photoCounter}>
                  {currentPhotoIndex + 1} / {listing.photos.length}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentPhotoIndex((prev) =>
                      prev < listing.photos.length - 1 ? prev + 1 : 0
                    )
                  }
                  style={styles.photoButton}
                  disabled={listing.photos.length <= 1}
                >
                  <Text style={styles.photoButtonText}>→</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noPhotoContainer}>
            <Text style={styles.noPhotoText}>Aucune photo disponible</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>
          {listing?.details?.title || "Sans titre"}
        </Text>
        <Text style={styles.price}>{listing?.details?.rent || "0"} €/mois</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation</Text>
          <Text style={styles.location}>{listing?.location?.street || ""}</Text>
          <Text style={styles.location}>
            {listing?.location?.postalCode || ""}{" "}
            {listing?.location?.city || ""}, {listing?.location?.country || ""}
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>
              👥{" "}
              {listing?.details?.totalRoommates ||
                listing?.housing?.totalRoommates ||
                "?"}{" "}
              colocataires
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>
              🚿{" "}
              {listing?.details?.bathrooms ||
                listing?.housing?.bathrooms ||
                "?"}{" "}
              salles de bain
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>
              📏{" "}
              {listing?.details?.privateArea ||
                listing?.housing?.privateArea ||
                "?"}{" "}
              m² privés
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>
              🏠 {listing?.details?.propertyType || "?"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Surface totale</Text>
              <Text style={styles.detailValue}>
                {listing?.details?.totalArea ||
                  listing?.housing?.totalArea ||
                  "?"}{" "}
                m²
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Chambres</Text>
              <Text style={styles.detailValue}>
                {listing?.details?.rooms || listing?.housing?.rooms || "?"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Étage</Text>
              <Text style={styles.detailValue}>
                {listing?.details?.floor || listing?.housing?.floor || "RDC"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Meublé</Text>
              <Text style={styles.detailValue}>
                {listing?.details?.furnished ? "Oui" : "Non"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Disponible à partir de</Text>
              <Text style={styles.detailValue}>
                {listing?.details?.availableDate
                  ? new Date(listing.details.availableDate).toLocaleDateString()
                  : "Non spécifié"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Équipements</Text>
          {renderAmenities()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {listing?.details?.description || "Pas de description"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.contactName}>
            {listing?.contact?.contactName ||
              listing?.metadata?.userName ||
              listing?.contact?.name ||
              "Non spécifié"}
          </Text>
          {listing?.contact?.contactEmail && (
            <Text style={styles.contactDetail}>
              Email: {listing.contact.contactEmail}
            </Text>
          )}
          {listing?.contact?.contactPhone && (
            <Text style={styles.contactDetail}>
              Téléphone: {listing.contact.contactPhone}
            </Text>
          )}

          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContact}
          >
            <Text style={styles.contactButtonText}>Contacter l'annonceur</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Partager</Text>
          </TouchableOpacity>

          {user && !isAdmin && !reported && !checkIfReported(listing) && (
            <TouchableOpacity
              style={styles.reportButton}
              onPress={handleReport}
            >
              <Text style={styles.reportButtonText}>Signaler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: "#4C86F9",
    fontWeight: "bold",
  },
  photoContainer: {
    position: "relative",
    width: "100%",
    height: 250,
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
  },
  photoControls: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  photoButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  photoButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  photoCounter: {
    color: "white",
    fontSize: 14,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  noPhotoContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  noPhotoText: {
    color: "#666",
    fontSize: 16,
  },
  infoContainer: {
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4C86F9",
    marginBottom: 15,
  },
  location: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
    color: "#333",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
  },
  featureItem: {
    width: "50%",
    paddingVertical: 5,
  },
  featureText: {
    fontSize: 14,
    color: "#555",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: windowWidth / 2 - 20,
    padding: 5,
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  amenityTag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  amenityText: {
    fontSize: 14,
    color: "#555",
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  contactDetail: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  contactButton: {
    backgroundColor: "#4C86F9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  shareButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  reportButton: {
    backgroundColor: "#FF4444",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  reportButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
