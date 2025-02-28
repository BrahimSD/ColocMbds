import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const PhotosStep = ({ formData, setFormData }) => {
  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie pour ajouter des photos.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Pour l'instant, stockons juste les URI locaux - dans une vraie app, nous les téléchargerions sur Cloudinary ou un autre service
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri]
      }));
    }
  };
  
  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepDescription}>Ajoutez des photos du logement</Text>
      
      <TouchableOpacity 
        style={styles.addPhotoButton}
        onPress={handleAddPhoto}
      >
        <Text style={styles.addPhotoText}>+ Ajouter une photo</Text>
      </TouchableOpacity>
      
      <Text style={styles.photoCountText}>
        {formData.photos.length} photo{formData.photos.length !== 1 ? 's' : ''} ajoutée{formData.photos.length !== 1 ? 's' : ''}
      </Text>
      
      <ScrollView style={styles.photosContainer}>
        {formData.photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemovePhoto(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  addPhotoButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc'
  },
  addPhotoText: {
    color: '#4C86F9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoCountText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  photosContainer: {
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover'
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  }
});

export default PhotosStep;