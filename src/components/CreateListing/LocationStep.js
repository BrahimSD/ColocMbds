import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const LocationStep = ({ formData, setFormData }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.stepDescription}>Entrez l'adresse du bien</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Numéro et rue *</Text>
        <TextInput
          style={styles.input}
          value={formData.street}
          onChangeText={(text) => setFormData(prev => ({ ...prev, street: text }))}
          placeholder="123 rue Example"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Code postal *</Text>
        <TextInput
          style={styles.input}
          value={formData.postalCode}
          onChangeText={(text) => setFormData(prev => ({ ...prev, postalCode: text }))}
          placeholder="75000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Ville *</Text>
        <TextInput
          style={styles.input}
          value={formData.city}
          onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
          placeholder="Nice"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Pays *</Text>
        <TextInput
          style={styles.input}
          value={formData.country}
          onChangeText={(text) => setFormData(prev => ({ ...prev, country: text }))}
          placeholder="France"
        />
      </View>
    </KeyboardAvoidingView>
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  }
});

export default LocationStep;