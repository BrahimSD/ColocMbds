import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const services = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
  { id: 'handicapAccess', label: 'Accès handicapé', icon: 'accessible' },
  { id: 'kitchenware', label: 'Vaisselle', icon: 'kitchen' },
  { id: 'microwave', label: 'Micro-ondes', icon: 'microwave' },
  { id: 'laundry', label: 'Machine à laver', icon: 'local-laundry-service' },
  { id: 'bikeParking', label: 'Parking vélo', icon: 'directions-bike' },
  { id: 'linens', label: 'Linge de maison', icon: 'bed' },
  { id: 'washingMachine', label: 'Lave-linge', icon: 'local-laundry-service' },
  { id: 'tv', label: 'Télévision', icon: 'tv' },
  { id: 'doubleBed', label: 'Lit double', icon: 'king-bed' },
  { id: 'elevator', label: 'Ascenseur', icon: 'elevator' },
  { id: 'parking', label: 'Parking', icon: 'local-parking' },
];

const ServicesStep = ({ formData, setFormData }) => {
  const toggleService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [serviceId]: !prev.services[serviceId]
      }
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Services inclus</Text>
      <Text style={styles.description}>
        Sélectionnez les services disponibles dans votre bien
      </Text>

      <ScrollView style={styles.servicesContainer}>
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceItem,
                formData.services[service.id] && styles.serviceItemActive
              ]}
              onPress={() => toggleService(service.id)}
            >
              <MaterialIcons
                name={service.icon}
                size={24}
                color={formData.services[service.id] ? '#000' : '#666'}
              />
              <Text style={[
                styles.serviceLabel,
                formData.services[service.id] && styles.serviceLabelActive
              ]}>
                {service.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  servicesContainer: {
    flex: 1,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  serviceItem: {
    width: '47%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    gap: 8,
  },
  serviceItemActive: {
    backgroundColor: '#ffd60a',
  },
  serviceLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  serviceLabelActive: {
    color: '#000',
    fontWeight: '500',
  },
});

export default ServicesStep;