import React, { useState, useEffect, useCallback } from "react";
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
  Platform,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
  RefreshControl,
} from "react-native";
import Slider from "@react-native-community/slider";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import commonStyles from "../styles/commonStyles";
import FavoriteButton from "../components/FavoriteButton";
import Map, { Marker } from "../components/Map";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get("window");
const ITEMS_PER_PAGE = 10;

export default function ListingsScreen({ navigation }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    price: [0, 2000],
    area: [0, 200],
    propertyType: "all",
    furnished: "all",
    services: [],
  });

  const propertyTypes = ["Appartement", "Maison", "Studio", "Loft", "Chambre"];

  const services = ["wifi", "washingMachine", "tv", "parking", "elevator"];

  // Fonction pour charger les données depuis le cache
  const loadFromCache = async () => {
    try {
      const cachedData = await AsyncStorage.getItem("listingsCache");
      const cachedTime = await AsyncStorage.getItem("listingsCacheTime");

      if (cachedData && cachedTime) {
        const parsedData = JSON.parse(cachedData);
        const lastUpdate = parseInt(cachedTime);
        const now = Date.now();

        // Utiliser le cache si les données ont moins de 5 minutes
        if (now - lastUpdate < 5 * 60 * 1000) {
          setListings(parsedData);
          setFilteredListings(parsedData);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error loading from cache:", error);
      return false;
    }
  };

  // Fonction pour sauvegarder les données dans le cache
  const saveToCache = async (data) => {
    try {
      await AsyncStorage.setItem("listingsCache", JSON.stringify(data));
      await AsyncStorage.setItem("listingsCacheTime", Date.now().toString());
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  const fetchListings = async (pageNumber = 1, shouldRefresh = false) => {
    try {
      // Vérification du cache comme avant
      if (pageNumber === 1 && !shouldRefresh) {
        const hasCachedData = await loadFromCache();
        if (hasCachedData) {
          setLoading(false);
          return;
        }
      }

      setLoading(true);

      // Essayer d'abord l'API
      let apiSuccess = false;
      try {
        // Préparer les paramètres de la requête
        const params = {
          page: pageNumber,
          limit: ITEMS_PER_PAGE,
          price_min: filters.price[0],
          price_max: filters.price[1],
          area_min: filters.area[0],
          area_max: filters.area[1],
          propertyType:
            filters.propertyType !== "all" ? filters.propertyType : undefined,
          furnished:
            filters.furnished !== "all" ? filters.furnished : undefined,
          services: filters.services.length > 0 ? filters.services : undefined,
          sort: "date_desc",
        };

        console.log("Fetching listings with params:", params);

        const API_URL =
          Platform.OS === "web"
            ? process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000"
            : process.env.EXPO_PUBLIC_API_URL_MOBILE ||
              "http://192.168.1.151:5000";

        const response = await axios.get(`${API_URL}/api/listings`, {
          params,
          headers: user
            ? {
                Authorization: `Bearer ${await user.getIdToken()}`,
              }
            : {},
          timeout: 5000, // 5 secondes timeout
        });

        if (response.data.success) {
          const newListings = response.data.listings;
          console.log(`Received ${newListings.length} listings from API`);

          // Vérifier si nous avons plus de pages
          const hasMore = newListings.length === ITEMS_PER_PAGE;
          setHasMore(hasMore);

          if (pageNumber === 1) {
            setListings(newListings);
            setFilteredListings(newListings);
            saveToCache(newListings);
          } else {
            setListings((prev) => [...prev, ...newListings]);
            setFilteredListings((prev) => [...prev, ...newListings]);
          }

          apiSuccess = true;
        }
      } catch (error) {
        console.log("API fetch failed, falling back to Firebase:", error);
        apiSuccess = false;
      }

      // Si l'API a échoué, utiliser Firebase directement
      if (!apiSuccess) {
        console.log("Fetching listings directly from Firebase");
        let firestoreQuery = collection(db, "listings");

        // Filtrer les annonces actives et visibles uniquement
        firestoreQuery = query(
          firestoreQuery,
          where("status", "==", "active"),
          where("isVisible", "==", true),
          orderBy("metadata.createdAt", "desc"),
          limit(ITEMS_PER_PAGE * pageNumber)
        );

        // Pour pagination, on pourrait utiliser startAfter avec le dernier document
        // mais ici on simplifie en récupérant tout puis en filtrant

        const querySnapshot = await getDocs(firestoreQuery);
        let newListings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(`Received ${newListings.length} listings from Firebase`);

        // Appliquer les filtres côté client
        newListings = newListings.filter((listing) => {
          // Filter by price
          const rent = parseFloat(listing.details?.rent) || 0;
          if (rent < filters.price[0] || rent > filters.price[1]) return false;

          // Filter by area
          const area = parseFloat(listing.housing?.privateArea) || 0;
          if (area < filters.area[0] || area > filters.area[1]) return false;

          // Filter by property type
          if (
            filters.propertyType !== "all" &&
            listing.details?.propertyType !== filters.propertyType
          )
            return false;

          // Filter by furnished
          if (filters.furnished === "yes" && !listing.details?.furnished)
            return false;
          if (filters.furnished === "no" && listing.details?.furnished)
            return false;

          // Filter by services
          if (filters.services.length > 0) {
            // Check if ALL required services are present
            for (const service of filters.services) {
              if (!listing.services?.[service]) return false;
            }
          }

          return true;
        });

        // Apply search query if present
        if (searchQuery.trim() !== "") {
          const searchLower = searchQuery.toLowerCase();
          newListings = newListings.filter((listing) => {
            const city = (listing.location?.city || "").toLowerCase();
            const street = (listing.location?.street || "").toLowerCase();
            const title = (listing.details?.title || "").toLowerCase();

            return (
              city.includes(searchLower) ||
              street.includes(searchLower) ||
              title.includes(searchLower)
            );
          });
        }

        // Si page 1, remplacer tout
        if (pageNumber === 1) {
          setListings(newListings);
          setFilteredListings(newListings);
          saveToCache(newListings);
        } else {
          // Pour les autres pages, on ajoute, mais il faut éviter les doublons
          const existingIds = listings.map((l) => l.id);
          const uniqueNewListings = newListings.filter(
            (l) => !existingIds.includes(l.id)
          );

          setListings((prev) => [...prev, ...uniqueNewListings]);
          setFilteredListings((prev) => [...prev, ...uniqueNewListings]);
        }

        setHasMore(newListings.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      Alert.alert("Erreur", "Impossible de charger les annonces");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchListings(1, true);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchListings(nextPage);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredListings(listings);
      return;
    }

    const searchLower = text.toLowerCase();
    const filtered = listings.filter((listing) => {
      if (!listing || !listing.location || !listing.details) return false;

      const city = (listing.location.city || "").toLowerCase();
      const street = (listing.location.street || "").toLowerCase();
      const title = (listing.details.title || "").toLowerCase();

      return (
        city.includes(searchLower) ||
        street.includes(searchLower) ||
        title.includes(searchLower)
      );
    });

    setFilteredListings(filtered);
  };

  const applyFilters = () => {
    setPage(1);
    fetchListings(1, true);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      price: [0, 2000],
      area: [0, 200],
      propertyType: "all",
      furnished: "all",
      services: [],
    });
    setPage(1);
    fetchListings(1, true);
    setShowFilters(false);
  };

  const togglePropertyType = (type) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: type,
    }));
  };

  const toggleService = (service) => {
    setFilters((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
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
    const coverImageUrl =
      listing.photos && listing.photos.length > 0 ? listing.photos[0] : null;

    return (
      <TouchableOpacity
        style={styles.listingCard}
        onPress={() => navigation.navigate("ListingDetail", { id: listing.id })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              coverImageUrl
                ? { uri: coverImageUrl }
                : require("../../assets/default-avatar.png")
            }
            style={styles.listingImage}
          />
          <FavoriteButton
            listingId={listing.id}
            style={styles.favoriteButton}
          />
        </View>
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
        </View>
      </TouchableOpacity>
    );
  };

  const renderMap = () => {
    const initialRegion = {
      latitude: 48.8566, // Paris
      longitude: 2.3522,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    return (
      <View style={styles.mapContainer}>
        <Map
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={Platform.OS !== "web"}
          showsMyLocationButton={Platform.OS !== "web"}
        >
          {filteredListings.map((listing) => {
            if (!listing.location?.coordinates?.lat || !listing.location?.coordinates?.lng) {
              return null;
            }

            const coordinates = {
              latitude: listing.location.coordinates.lat,
              longitude: listing.location.coordinates.lng,
            };

            return (
              <Marker
                key={listing.id}
                coordinate={coordinates}
                title={listing.details?.title || "Sans titre"}
                description={`${listing.details?.rent || 0}€/mois`}
                onPress={() => navigation.navigate("ListingDetail", { id: listing.id })}
              />
            );
          })}
        </Map>
      </View>
    );
  };
  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Filtres</Text>

        <Text style={styles.filterLabel}>
          Prix: {filters.price[0]}€ - {filters.price[1]}€
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={2000}
          step={50}
          value={filters.price[1]}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, price: [prev.price[0], value] }))
          }
        />

        <Text style={styles.filterLabel}>
          Surface: {filters.area[0]}m² - {filters.area[1]}m²
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={200}
          step={10}
          value={filters.area[1]}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, area: [prev.area[0], value] }))
          }
        />

        <Text style={styles.filterLabel}>Type de logement</Text>
        <View style={styles.propertyTypeContainer}>
          {["all", "apartment", "house", "studio"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.propertyTypeButton,
                filters.propertyType === type &&
                  styles.propertyTypeButtonActive,
              ]}
              onPress={() => togglePropertyType(type)}
            >
              <Text
                style={[
                  styles.propertyTypeText,
                  filters.propertyType === type &&
                    styles.propertyTypeTextActive,
                ]}
              >
                {type === "all"
                  ? "Tous"
                  : type === "apartment"
                  ? "Appartement"
                  : type === "house"
                  ? "Maison"
                  : "Studio"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Meublé</Text>
        <View style={styles.propertyTypeContainer}>
          {["all", "yes", "no"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.propertyTypeButton,
                filters.furnished === option && styles.propertyTypeButtonActive,
              ]}
              onPress={() => toggleService(option)}
            >
              <Text
                style={[
                  styles.propertyTypeText,
                  filters.furnished === option && styles.propertyTypeTextActive,
                ]}
              >
                {option === "all"
                  ? "Tous"
                  : option === "yes"
                  ? "Meublé"
                  : "Non meublé"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Services</Text>
        <View style={styles.servicesContainer}>
          {["wifi", "washingMachine", "tv", "parking", "elevator"].map(
            (service) => (
              <TouchableOpacity
                key={service}
                style={[
                  styles.serviceButton,
                  filters.services.includes(service) &&
                    styles.serviceButtonActive,
                ]}
                onPress={() => toggleService(service)}
              >
                <Text
                  style={[
                    styles.serviceText,
                    filters.services.includes(service) &&
                      styles.serviceTextActive,
                  ]}
                >
                  {service === "wifi"
                    ? "WiFi"
                    : service === "washingMachine"
                    ? "Lave-linge"
                    : service === "tv"
                    ? "TV"
                    : service === "parking"
                    ? "Parking"
                    : "Ascenseur"}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.filterActions}>
          <TouchableOpacity
            style={[styles.filterButton, styles.resetButton]}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, styles.applyButton]}
            onPress={applyFilters}
          >
            <Text style={styles.applyButtonText}>Appliquer</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.headerButtonText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMap(!showMap)}
          >
            <Text style={styles.headerButtonText}>{showMap ? "📋" : "🗺️"}</Text>
          </TouchableOpacity>
        </View>
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
      ) : showMap ? (
        renderMap()
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={() =>
            loading && page > 1 ? (
              <ActivityIndicator style={styles.loadingMore} />
            ) : null
          }
        />
      )}

      {renderFilters()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    minHeight: 60,
  },
  backButton: {
    padding: 10,
    marginLeft: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: "#4C86F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 10,
    marginLeft: 5,
  },
  headerButtonText: {
    fontSize: 20,
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
  imageContainer: {
    position: "relative",
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
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: width,
    height: "100%",
  },
  filtersContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 15,
  },
  propertyTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  propertyTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    marginBottom: 10,
  },
  propertyTypeButtonActive: {
    backgroundColor: "#4C86F9",
  },
  propertyTypeText: {
    color: "#666",
  },
  propertyTypeTextActive: {
    color: "#fff",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: "#f0f0f0",
  },
  applyButton: {
    backgroundColor: "#4C86F9",
  },
  resetButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingMore: {
    paddingVertical: 20,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
    color: "#666",
  },
});
