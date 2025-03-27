import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import commonStyles from '../styles/commonStyles';

export default function FavoritesScreen({ navigation }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const favoriteIds = userData.favorites || [];

      const favoritesData = [];
      for (const listingId of favoriteIds) {
        const listingDoc = await getDoc(doc(db, 'listings', listingId));
        if (listingDoc.exists()) {
          favoritesData.push({
            id: listingDoc.id,
            ...listingDoc.data()
          });
        }
      }

      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const coverImageUrl = item.photos && item.photos.length > 0 ? item.photos[0] : null;

    return (
      <TouchableOpacity
        style={styles.listingCard}
        onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
      >
        <Image
          source={
            coverImageUrl
              ? { uri: coverImageUrl }
              : require('../../assets/default-avatar.png')
          }
          style={styles.listingImage}
        />
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle}>
            {item.details?.title || 'Sans titre'}
          </Text>
          <Text style={styles.listingLocation}>
            {item.location?.city || ''}, {item.location?.country || ''}
          </Text>
          <Text style={styles.listingPrice}>
            {item.details?.rent || '0'} €/mois
          </Text>

          <View style={styles.listingDetails}>
            <Text style={styles.detailItem}>
              <Text style={styles.detailIcon}>👥 </Text>
              {item.housing?.totalRoommates || '?'} colocataires
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailIcon}>🚿 </Text>
              {item.housing?.bathrooms || '?'} SdB
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailIcon}>📏 </Text>
              {item.housing?.privateArea || '?'} m²
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={commonStyles.header}>
          <TouchableOpacity
            style={commonStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={commonStyles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Mes Favoris</Text>
          <View style={commonStyles.placeholder} />
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Connectez-vous pour voir vos favoris
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={commonStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Mes Favoris</Text>
        <View style={commonStyles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4C86F9" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore d'annonces favorites
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Listings')}
          >
            <Text style={styles.browseButtonText}>
              Parcourir les annonces
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#4C86F9',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#4C86F9',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  listingInfo: {
    padding: 15,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listingLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4C86F9',
    marginBottom: 10,
  },
  listingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  detailItem: {
    marginRight: 15,
    fontSize: 14,
    color: '#666',
  },
  detailIcon: {
    fontSize: 16,
  },
}); 