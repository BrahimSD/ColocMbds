import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

// Import step components
import LocationStep from '../components/CreateListing/LocationStep';
import HousingStep from '../components/CreateListing/HousingStep';
import DetailsStep from '../components/CreateListing/DetailsStep';
import PhotosStep from '../components/CreateListing/PhotosStep';
import ServicesStep from '../components/CreateListing/ServicesStep';
import ContactStep from '../components/CreateListing/ContactStep';

const stepLabels = {
  1: "Localisation",
  2: "Logement",
  3: "Détails",
  4: "Photos",
  5: "Services",
  6: "Contact",
};

const CreateListing = ({ navigation }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

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
    availableDate: "",
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
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    acceptTerms: false,
  });

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userDoc = await user.getIdToken();
        if (!userDoc) {
          navigation.navigate('Profile');
        } else {
          setIsVerified(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking verification:', error);
        navigation.navigate('Profile');
      }
    };

    checkVerification();
  }, [user, navigation]);

  const validateStep = (step) => {
    setError("");
    switch (step) {
      case 1:
        if (!formData.street || !formData.postalCode || !formData.city || !formData.country) {
          setError("Veuillez remplir tous les champs de localisation");
          return false;
        }
        break;
      case 2:
        if (!formData.totalRoommates || !formData.bathrooms || !formData.privateArea) {
          setError("Veuillez remplir tous les champs concernant le logement");
          return false;
        }
        break;
      case 3:
        if (!formData.propertyType || !formData.totalArea || !formData.rooms || 
            !formData.availableDate || !formData.rent || !formData.title || !formData.description) {
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
        if (!formData.contactName || !formData.contactPhone || !formData.contactEmail || !formData.acceptTerms) {
          setError("Veuillez remplir tous les champs de contact et accepter les conditions");
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
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const uploadPhotosToCloudinary = async (photos) => {
    const newPhotos = photos.filter(photo => !photo.isExisting);

    if (newPhotos.length === 0) {
      return photos.map(photo => photo.url || photo.preview);
    }

    const uploadedUrls = [];
    const cloudinaryUrl = process.env.EXPO_PUBLIC_CLOUDINARY_URL;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudinaryApiKey = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY;

    try {
      for (const photo of newPhotos) {
        const formData = new FormData();
        formData.append('file', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'photo.jpg'
        });
        formData.append('upload_preset', uploadPreset);
        formData.append('api_key', cloudinaryApiKey);
        formData.append('timestamp', Math.floor(Date.now() / 1000));

        const response = await axios.post(cloudinaryUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data && response.data.secure_url) {
          uploadedUrls.push(response.data.secure_url);
        } else {
          throw new Error('Invalid response from Cloudinary');
        }
      }

      const existingUrls = photos
        .filter(photo => photo.isExisting)
        .map(photo => photo.url || photo.preview);

      return [...existingUrls, ...uploadedUrls];
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Erreur lors du téléchargement des photos: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    try {
      setIsLoading(true);
      const photoUrls = await uploadPhotosToCloudinary(formData.photos);

      const listingData = {
        location: {
          street: formData.street,
          postalCode: formData.postalCode,
          city: formData.city,
          country: formData.country,
          coordinates: formData.coordinates || { lat: 0, lng: 0 },
        },
        housing: {
          totalRoommates: parseInt(formData.totalRoommates) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          privateArea: parseFloat(formData.privateArea) || 0,
        },
        details: {
          propertyType: formData.propertyType,
          totalArea: parseFloat(formData.totalArea) || 0,
          rooms: parseInt(formData.rooms) || 0,
          floor: formData.floor ? parseInt(formData.floor) : 0,
          furnished: formData.furnished || false,
          availableDate: formData.availableDate,
          rent: parseFloat(formData.rent) || 0,
          title: formData.title,
          description: formData.description,
        },
        photos: photoUrls,
        services: formData.services,
        contact: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
      };

      const token = await user.getIdToken();

      try {
        const response = await axios.post('http://localhost:5000/api/listings', 
          { listing: {
            ...listingData,
            status: "pending",
            isVisible: true,
            metadata: {
              userId: user.uid,
              userName: user.displayName || formData.contactName,
              userPhotoURL: user.photoURL || null,
              createdAt: new Date().toISOString(),
            },
          }}, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          navigation.navigate('MyListings');
          alert('Votre annonce a été créée avec succès et sera visible après validation par un administrateur');
        } else {
          throw new Error(response.data.error || 'Erreur lors de la création de l\'annonce');
        }
      } catch (error) {
        console.error('Error creating listing:', error);
        setError(`Erreur lors de la création de l'annonce: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      setError(`Une erreur s'est produite: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd60a" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  if (!user || !isVerified) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accès non autorisé</Text>
        <Text style={styles.message}>Votre compte doit être vérifié pour publier une annonce.</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.buttonText}>Retour au profil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Créer une annonce</Text>

      <View style={styles.stepsIndicator}>
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <View
            key={step}
            style={[
              styles.step,
              currentStep === step && styles.activeStep,
              currentStep > step && styles.completedStep,
            ]}
          >
            <View style={[
              styles.stepCircle,
              currentStep === step && styles.activeStepCircle,
              currentStep > step && styles.completedStepCircle,
            ]}>
              <Text style={[
                styles.stepNumber,
                currentStep === step && styles.activeStepNumber,
                currentStep > step && styles.completedStepNumber,
              ]}>{step}</Text>
            </View>
            <Text style={styles.stepLabel}>{stepLabels[step]}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

      <ScrollView style={styles.stepContainer}>
        {renderStep()}
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handlePrevious}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Précédent</Text>
          </TouchableOpacity>
        )}
        {currentStep < 6 ? (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>Suivant</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryButtonText}>Publier l'annonce</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A265F',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepNumber: {
    fontSize: 14,
    color: '#666',
  },
  stepLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeStep: {
    backgroundColor: '#fff',
  },
  activeStepCircle: {
    backgroundColor: '#ffd60a',
  },
  activeStepNumber: {
    color: '#000',
  },
  completedStep: {
    backgroundColor: '#fff',
  },
  completedStepCircle: {
    backgroundColor: '#52c41a',
  },
  completedStepNumber: {
    color: '#fff',
  },
  stepContainer: {
    flex: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    padding: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#ffd60a',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  errorMessage: {
    backgroundColor: '#fff2f0',
    borderWidth: 1,
    borderColor: '#ffccc7',
    color: '#ff4d4f',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A265F',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default CreateListing; 