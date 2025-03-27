import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const HousingStep = ({ formData, setFormData }) => {
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails du Logement</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre total de colocataires *</Text>
        <TextInput
          style={styles.input}
          value={formData.totalRoommates}
          onChangeText={(value) => handleChange('totalRoommates', value)}
          placeholder="Ex: 3"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre de salles de bain *</Text>
        <TextInput
          style={styles.input}
          value={formData.bathrooms}
          onChangeText={(value) => handleChange('bathrooms', value)}
          placeholder="Ex: 2"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Surface privée (m²) *</Text>
        <TextInput
          style={styles.input}
          value={formData.privateArea}
          onChangeText={(value) => handleChange('privateArea', value)}
          placeholder="Ex: 15"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
});

export default HousingStep;