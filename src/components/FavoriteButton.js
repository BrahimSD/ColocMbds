import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function FavoriteButton({ listingId, size = 24, style }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, listingId]);

  const checkFavoriteStatus = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setIsFavorite(userData.favorites?.includes(listingId) || false);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Veuillez vous connecter pour ajouter des favoris',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        favorites: isFavorite
          ? arrayRemove(listingId)
          : arrayUnion(listingId)
      });
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.favoriteButton, style]}
      onPress={toggleFavorite}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorite ? '#FF4444' : '#666'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 