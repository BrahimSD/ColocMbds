import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const HousingStep = ({ formData, setFormData }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.stepDescription}>Détails du logement</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre total de colocataires *</Text>
        <TextInput
          style={styles.input}
          value={formData.totalRoommates}
          onChangeText={(text) => setFormData(prev => ({ ...prev, totalRoommates: text }))}
          placeholder="2"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre de salles de bain *</Text>
        <TextInput
          style={styles.input}
          value={formData.bathrooms}
          onChangeText={(text) => setFormData(prev => ({ ...prev, bathrooms: text }))}
          placeholder="1"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Surface privée (m²) *</Text>
        <TextInput
          style={styles.input}
          value={formData.privateArea}
          onChangeText={(text) => setFormData(prev => ({ ...prev, privateArea: text }))}
          placeholder="15"
          keyboardType="numeric"
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

export default HousingStep;