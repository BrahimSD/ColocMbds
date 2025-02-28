import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

export default function ListingsScreen({ navigation }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const listingsRef = collection(db, "listings");
      const querySnapshot = await getDocs(collection(db, "listings"));

      const listingsData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (listing) =>
            listing.status === "active" && listing.isVisible !== false
        );

      console.log(`Récupéré ${listingsData.length} annonces`);
      setListings(listingsData);
      setFilteredListings(listingsData);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredListings(listings);
      return;
    }

    const searchLower = text.toLowerCase();
    const filtered = listings.filter((listing) => {
      const city = (listing.location?.city || "").toLowerCase();
      const street = (listing.location?.street || "").toLowerCase();
      const country = (listing.location?.country || "").toLowerCase();
      const title = (listing.details?.title || "").toLowerCase();
      const description = (listing.details?.description || "").toLowerCase();
      const propertyType = (listing.details?.propertyType || "").toLowerCase();

      return (
        city.includes(searchLower) ||
        street.includes(searchLower) ||
        country.includes(searchLower) ||
        title.includes(searchLower) ||
        description.includes(searchLower) ||
        propertyType.includes(searchLower)
      );
    });

    setFilteredListings(filtered);
  };

  const formatListingData = (item) => {
    return {
      id: item.id,
      details: item.details || {},
      location: item.location || {},
      housing: item.housing || {},
      services: item.services || {},
      photos: item.photos || [],
      contact: item.contact || {},
      metadata: item.metadata || {},
    };
  };

  const renderItem = ({ item }) => {
    const listing = formatListingData(item);

    const authorName =
      listing.contact?.contactName ||
      listing.metadata?.userName ||
      listing.contact?.name ||
      "Non spécifié";

    const photoUrl =
      listing.metadata?.userPhotoURL || listing.contact?.photoURL || null;

    const coverImageUrl =
      listing.photos && listing.photos.length > 0 ? listing.photos[0] : null;

    return (
      <TouchableOpacity
        style={styles.listingCard}
        onPress={() => navigation.navigate("ListingDetail", { id: listing.id })}
      >
        <Image
          source={
            coverImageUrl
              ? { uri: coverImageUrl }
              : require("../../assets/default-avatar.png")
          }
          style={styles.listingImage}
        />
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle}>
            {listing.details?.title || "Sans titre"}
          </Text>
          <Text style={styles.listingLocation}>
            {listing.location?.city || ""}, {listing.location?.country || ""}
          </Text>
          <Text style={styles.listingPrice}>
            {listing.details?.rent || "0"} €/mois
          </Text>

          <View style={styles.listingDetails}>
            <Text style={styles.detailItem}>
              <Text style={styles.detailIcon}>👥 </Text>
              {listing.housing?.totalRoommates || "?"} colocataires
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailIcon}>🚿 </Text>
              {listing.housing?.bathrooms || "?"} SdB
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailIcon}>📏 </Text>
              {listing.housing?.privateArea || "?"} m²
            </Text>
          </View>

          <View style={styles.servicesContainer}>
            {listing.services?.wifi && (
              <View style={styles.serviceTag}>
                <Text style={styles.serviceText}>Wifi</Text>
              </View>
            )}
            {listing.services?.washingMachine && (
              <View style={styles.serviceTag}>
                <Text style={styles.serviceText}>Lave-linge</Text>
              </View>
            )}
            {listing.details?.furnished && (
              <View style={styles.serviceTag}>
                <Text style={styles.serviceText}>Meublé</Text>
              </View>
            )}
          </View>

          <View style={styles.listingAvailable}>
            <Text style={styles.availableText}>
              Disponible à partir du:{" "}
              {listing.details?.availableDate
                ? new Date(listing.details.availableDate).toLocaleDateString()
                : "Non spécifié"}
            </Text>
          </View>

          <View style={styles.listingAuthor}>
            <Image
              source={
                photoUrl
                  ? { uri: photoUrl }
                  : require("../../assets/default-avatar.png")
              }
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{authorName}</Text>
              <Text style={styles.postDate}>
                {listing.metadata?.createdAt
                  ? new Date(
                      listing.metadata.createdAt.seconds * 1000
                    ).toLocaleDateString()
                  : "Date inconnue"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rechercher des colocations</Text>
        <View style={styles.placeholder}></View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par ville, titre..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4C86F9" />
        </View>
      ) : filteredListings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune annonce trouvée</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchListings}
          >
            <Text style={styles.refreshButtonText}>Rafraîchir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
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
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: "#4C86F9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 15,
  },
  listingCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  listingImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  listingInfo: {
    padding: 15,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  listingLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4C86F9",
    marginBottom: 10,
  },
  listingDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  detailItem: {
    marginRight: 15,
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  detailIcon: {
    fontSize: 16,
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  serviceTag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    color: "#666",
  },
  listingAvailable: {
    marginBottom: 10,
  },
  availableText: {
    fontSize: 12,
    color: "#666",
  },
  listingAuthor: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  postDate: {
    fontSize: 10,
    color: "#999",
  },
});
