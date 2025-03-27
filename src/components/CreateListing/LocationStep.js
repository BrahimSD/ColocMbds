import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import debounce from 'lodash/debounce';

const LocationStep = ({ formData, setFormData }) => {
  const [locationError, setLocationError] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchAddress = useCallback(
    debounce(async (text) => {
      if (text.length < 3) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      setIsLoading(true);
      try {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error('Google Maps API Key is not configured');
          setLocationError('Configuration de l\'API Google Maps manquante');
          return;
        }

        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&components=country:fr&language=fr&key=${apiKey}`;
        console.log('Requesting Google Places API:', url);

        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Google Places API Response:', data);
        
        if (data.status === 'OK') {
          setPredictions(data.predictions);
          setShowPredictions(true);
        } else {
          console.error('Google Places API Error:', {
            status: data.status,
            error_message: data.error_message,
            next_page_token: data.next_page_token
          });
          setLocationError(`Erreur API: ${data.error_message || data.status}`);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setLocationError('Erreur lors de la recherche d\'adresse');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleAddressSelect = async (placeId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components,geometry&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const details = data.result;
        const addressComponents = details.address_components;
        let streetNumber = '';
        let streetName = '';

        addressComponents.forEach(component => {
          if (component.types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (component.types.includes('route')) {
            streetName = component.long_name;
          }
        });

        setFormData(prev => ({
          ...prev,
          street: `${streetNumber} ${streetName}`.trim(),
          postalCode: addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '',
          city: addressComponents.find(c => c.types.includes('locality'))?.long_name || '',
          country: addressComponents.find(c => c.types.includes('country'))?.long_name || '',
          coordinates: {
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
          },
        }));
        setShowPredictions(false);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setLocationError('Erreur lors de la récupération des détails de l\'adresse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAddressChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'street') {
      searchAddress(value);
    }
  };

  const renderPrediction = ({ item }) => (
    <TouchableOpacity
      style={styles.predictionItem}
      onPress={() => handleAddressSelect(item.place_id)}
    >
      <Text style={styles.predictionText}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Numéro et rue *</Text>
        <View style={styles.autocompleteContainer}>
          <TextInput
            style={styles.input}
            value={formData.street}
            onChangeText={(value) => handleManualAddressChange('street', value)}
            placeholder="123 rue Example"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {showPredictions && predictions.length > 0 && (
            <View style={styles.predictionsContainer}>
              <FlatList
                data={predictions}
                renderItem={renderPrediction}
                keyExtractor={(item) => item.place_id}
                style={styles.predictionsList}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              />
            </View>
          )}
          {isLoading && (
            <Text style={styles.loadingText}>Chargement...</Text>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Code postal *</Text>
        <TextInput
          style={styles.input}
          value={formData.postalCode}
          onChangeText={(value) => handleManualAddressChange('postalCode', value)}
          placeholder="75000"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ville *</Text>
        <TextInput
          style={styles.input}
          value={formData.city}
          onChangeText={(value) => handleManualAddressChange('city', value)}
          placeholder="Nice"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pays *</Text>
        <TextInput
          style={styles.input}
          value={formData.country}
          onChangeText={(value) => handleManualAddressChange('country', value)}
          placeholder="France"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>Localisation</Text>
      {renderForm()}
      {locationError ? (
        <Text style={styles.errorText}>{locationError}</Text>
      ) : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A265F',
    marginBottom: 20,
  },
  formContainer: {
    gap: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff4d4f',
    marginTop: 10,
    textAlign: 'center',
  },
  autocompleteContainer: {
    position: 'relative',
  },
  predictionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#ddd',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  predictionsList: {
    flex: 1,
  },
  predictionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  predictionText: {
    fontSize: 14,
    color: '#333',
  },
  loadingText: {
    position: 'absolute',
    right: 12,
    top: 12,
    color: '#666',
    fontSize: 14,
  },
});

export default LocationStep;