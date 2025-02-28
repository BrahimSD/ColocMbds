import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

const DetailsStep = ({ formData, setFormData }) => {
  return (
    <ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={styles.stepDescription}>Détails du bien</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Type de bien *</Text>
          <TextInput
            style={styles.input}
            value={formData.propertyType}
            onChangeText={(text) => setFormData(prev => ({ ...prev, propertyType: text }))}
            placeholder="Appartement, maison, studio..."
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Surface totale (m²) *</Text>
          <TextInput
            style={styles.input}
            value={formData.totalArea}
            onChangeText={(text) => setFormData(prev => ({ ...prev, totalArea: text }))}
            placeholder="80"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre de pièces *</Text>
          <TextInput
            style={styles.input}
            value={formData.rooms}
            onChangeText={(text) => setFormData(prev => ({ ...prev, rooms: text }))}
            placeholder="3"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Étage</Text>
          <TextInput
            style={styles.input}
            value={formData.floor}
            onChangeText={(text) => setFormData(prev => ({ ...prev, floor: text }))}
            placeholder="2 (0 pour RDC)"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Meublé</Text>
            <Switch
              value={formData.furnished}
              onValueChange={(value) => setFormData(prev => ({ ...prev, furnished: value }))}
              trackColor={{ false: "#d3d3d3", true: "#4C86F9" }}
              thumbColor={formData.furnished ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Disponible à partir de *</Text>
          <TextInput
            style={styles.input}
            value={formData.availableDate}
            onChangeText={(text) => setFormData(prev => ({ ...prev, availableDate: text }))}
            placeholder="YYYY-MM-DD"
          />
          {/* Note: Dans une application réelle, vous voudriez utiliser un DatePicker */}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Loyer mensuel (€) *</Text>
          <TextInput
            style={styles.input}
            value={formData.rent}
            onChangeText={(text) => setFormData(prev => ({ ...prev, rent: text }))}
            placeholder="600"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Titre de l'annonce *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Chambre dans colocation..."
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Décrivez le logement, l'ambiance..."
            multiline
            numberOfLines={6}
          />
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
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
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});

export default DetailsStep;