import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import commonStyles from '../styles/commonStyles';

export default function MyListingsScreen({ navigation }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const q = query(
        collection(db, 'listings'),
        where('metadata.userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const myListings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setListings(myListings);
    } catch (error) {
      console.error('Error fetching my listings:', error);
      Alert.alert('Erreur', 'Impossible de charger vos annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette annonce ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'listings', id));
              setListings(prevListings => 
                prevListings.filter(listing => listing.id !== id)
              );
              Alert.alert('Succès', 'Annonce supprimée avec succès');
            } catch (error) {
              console.error('Error deleting listing:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'annonce');
            }
          }
        }
      ]
    );
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'En attente';
      case 'blocked':
        return 'Bloquée';
      default:
        return 'En attente';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'pending':
        return styles.statusPending;
      case 'blocked':
        return styles.statusBlocked;
      default:
        return styles.statusPending;
    }
  };

  const renderItem = ({ item }) => {
    const coverImageUrl = item.photos && item.photos.length > 0 
      ? item.photos[0] 
      : null;

    return (
      <View style={styles.listingCard}>
        <TouchableOpacity
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
          
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, getStatusStyle(item.status)]}>
              {getStatusText(item.status || 'pending')}
            </Text>
          </View>
          
          <View style={styles.listingInfo}>
            <Text style={styles.listingTitle}>{item.details?.title || 'Sans titre'}</Text>
            <Text style={styles.listingLocation}>
              {item.location?.city || ''}, {item.location?.country || ''}
            </Text>
            <Text style={styles.listingPrice}>{item.details?.rent || '0'} €/mois</Text>
            
            <Text style={styles.dateInfo}>
              Créée le: {item.metadata?.createdAt 
                ? new Date(item.metadata.createdAt.seconds * 1000).toLocaleDateString() 
                : 'Date inconnue'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('CreateListing', { editId: item.id })}
          >
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={[styles.buttonText, styles.deleteButtonText]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={commonStyles.messageContainer}>
          <Text style={commonStyles.messageTitle}>Connexion requise</Text>
          <Text style={commonStyles.messageText}>Veuillez vous connecter pour voir vos annonces</Text>
          <TouchableOpacity
            style={commonStyles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={commonStyles.loginButtonText}>Se connecter</Text>
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
        <Text style={commonStyles.headerTitle}>Mes Annonces</Text>
        <View style={commonStyles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4C86F9" />
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Vous n'avez pas encore d'annonces</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateListing')}
          >
            <Text style={styles.createButtonText}>Créer une annonce</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listingsContainer}>
          <TouchableOpacity
            style={styles.newListingButton}
            onPress={() => navigation.navigate('CreateListing')}
          >
            <Text style={styles.newListingButtonText}>+ Nouvelle annonce</Text>
          </TouchableOpacity>
          
          <FlatList
            data={listings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4C86F9',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingsContainer: {
    flex: 1,
    padding: 15,
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
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#4C86F9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newListingButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  newListingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusActive: {
    color: '#28a745',
  },
  statusPending: {
    color: '#ffc107',
  },
  statusBlocked: {
    color: '#dc3545',
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
    marginBottom: 5,
  },
  dateInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#4C86F9',
  },
  deleteButton: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#4C86F9',
  },
  deleteButtonText: {
    color: '#dc3545',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4C86F9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});