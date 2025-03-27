import React from 'react';
import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const ContactStep = ({ formData, setFormData }) => {
  const { user } = useAuth();

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUseProfileInfo = () => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: user.displayName || '',
        contactEmail: user.email || '',
      }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informations de contact</Text>
      <Text style={styles.description}>
        Ces informations seront visibles pour les personnes intéressées par votre annonce
      </Text>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={handleUseProfileInfo}
      >
        <Text style={styles.profileButtonText}>
          Utiliser les informations de mon profil
        </Text>
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom *</Text>
        <TextInput
          style={styles.input}
          value={formData.contactName}
          onChangeText={(value) => handleChange('contactName', value)}
          placeholder="Votre nom"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Téléphone *</Text>
        <TextInput
          style={styles.input}
          value={formData.contactPhone}
          onChangeText={(value) => handleChange('contactPhone', value)}
          placeholder="Votre numéro de téléphone"
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.contactEmail}
          onChangeText={(value) => handleChange('contactEmail', value)}
          placeholder="Votre email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.termsContainer}>
        <Switch
          value={formData.acceptTerms}
          onValueChange={(value) => handleChange('acceptTerms', value)}
          trackColor={{ false: '#ddd', true: '#ffd60a' }}
          thumbColor={formData.acceptTerms ? '#000' : '#fff'}
        />
        <Text style={styles.termsText}>
          J'accepte les conditions d'utilisation et la politique de confidentialité
        </Text>
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
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  profileButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  profileButtonText: {
    color: '#2A265F',
    fontSize: 16,
    fontWeight: '500',
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  termsText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default ContactStep;