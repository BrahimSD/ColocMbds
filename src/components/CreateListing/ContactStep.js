import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const ContactStep = ({ formData, setFormData }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.stepDescription}>Comment les intéressés peuvent vous contacter</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nom complet *</Text>
        <TextInput
          style={styles.input}
          value={formData.contactName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, contactName: text }))}
          placeholder="Votre nom et prénom"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Téléphone *</Text>
        <TextInput
          style={styles.input}
          value={formData.contactPhone}
          onChangeText={(text) => setFormData(prev => ({ ...prev, contactPhone: text }))}
          placeholder="Votre numéro de téléphone"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.contactEmail}
          onChangeText={(text) => setFormData(prev => ({ ...prev, contactEmail: text }))}
          placeholder="Votre adresse email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>J'accepte que mes informations soient partagées avec les utilisateurs intéressés *</Text>
          <Switch
            value={formData.acceptTerms}
            onValueChange={(value) => setFormData(prev => ({ ...prev, acceptTerms: value }))}
            trackColor={{ false: "#d3d3d3", true: "#4C86F9" }}
            thumbColor={formData.acceptTerms ? "#fff" : "#f4f3f4"}
          />
        </View>
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
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});

export default ContactStep;