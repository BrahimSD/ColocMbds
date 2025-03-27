import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const PhotosStep = ({ formData, setFormData }) => {
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à vos photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, { uri: result.assets[0].uri }]
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de la photo.');
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photos du bien</Text>
      <Text style={styles.description}>
        Ajoutez au moins une photo de votre bien. Les photos de meilleure qualité seront affichées en premier.
      </Text>

      <ScrollView horizontal style={styles.photosContainer}>
        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
          <MaterialIcons name="add-photo-alternate" size={40} color="#666" />
          <Text style={styles.addPhotoText}>Ajouter une photo</Text>
        </TouchableOpacity>

        {formData.photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.photo}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(index)}
            >
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {formData.photos.length > 0 && (
        <Text style={styles.photoCount}>
          {formData.photos.length} photo{formData.photos.length > 1 ? 's' : ''} sélectionnée{formData.photos.length > 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A265F',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  photosContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  addPhotoButton: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  addPhotoText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  photoContainer: {
    width: 150,
    height: 150,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4d4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default PhotosStep;