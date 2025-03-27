import React from 'react';
import { View, Text, TextInput, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';

const DetailsStep = ({ formData, setFormData }) => {
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Détails du bien</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Type de bien *</Text>
        <View style={styles.selectContainer}>
          {['apartment', 'house', 'studio'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.selectOption,
                formData.propertyType === type && styles.selectOptionActive
              ]}
              onPress={() => handleChange('propertyType', type)}
            >
              <Text style={[
                styles.selectOptionText,
                formData.propertyType === type && styles.selectOptionTextActive
              ]}>
                {type === 'apartment' ? 'Appartement' : 
                 type === 'house' ? 'Maison' : 'Studio'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Surface totale (m²) *</Text>
          <TextInput
            style={styles.input}
            value={formData.totalArea}
            onChangeText={(value) => handleChange('totalArea', value)}
            placeholder="Ex: 80"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Nombre de pièces *</Text>
          <TextInput
            style={styles.input}
            value={formData.rooms}
            onChangeText={(value) => handleChange('rooms', value)}
            placeholder="Ex: 4"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Étage</Text>
        <TextInput
          style={styles.input}
          value={formData.floor}
          onChangeText={(value) => handleChange('floor', value)}
          placeholder="Ex: 2"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Meublé</Text>
        <Switch
          value={formData.furnished}
          onValueChange={(value) => handleChange('furnished', value)}
          trackColor={{ false: '#ddd', true: '#ffd60a' }}
          thumbColor={formData.furnished ? '#000' : '#fff'}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Disponible à partir de *</Text>
        <TextInput
          style={styles.input}
          value={formData.availableDate}
          onChangeText={(value) => handleChange('availableDate', value)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Loyer mensuel (€) *</Text>
        <TextInput
          style={styles.input}
          value={formData.rent}
          onChangeText={(value) => handleChange('rent', value)}
          placeholder="Ex: 500"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(value) => handleChange('title', value)}
          placeholder="Ex: Appartement lumineux avec vue"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(value) => handleChange('description', value)}
          placeholder="Décrivez votre bien..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </ScrollView>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
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
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  selectContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  selectOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectOptionActive: {
    backgroundColor: '#ffd60a',
    borderColor: '#ffd60a',
  },
  selectOptionText: {
    color: '#666',
    fontSize: 16,
  },
  selectOptionTextActive: {
    color: '#000',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default DetailsStep;