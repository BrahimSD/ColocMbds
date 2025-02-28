import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Switch,
  ScrollView
} from 'react-native';

const ServicesStep = ({ formData, setFormData }) => {
  const serviceItems = [
    { key: 'wifi', label: 'Wifi inclus' },
    { key: 'handicapAccess', label: 'Accès handicapé' },
    { key: 'kitchenware', label: 'Kit vaisselle' },
    { key: 'microwave', label: 'Four micro-ondes' },
    { key: 'laundry', label: 'Laverie' },
    { key: 'bikeParking', label: 'Parking vélo' },
    { key: 'linens', label: 'Linge fourni' },
    { key: 'washingMachine', label: 'Lave-linge' },
    { key: 'tv', label: 'TV' },
    { key: 'doubleBed', label: 'Lit double' },
    { key: 'elevator', label: 'Ascenseur' },
    { key: 'parking', label: 'Parking' }
  ];

  const handleServiceChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [key]: value
      }
    }));
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.stepDescription}>Sélectionnez les services disponibles</Text>
        
        {serviceItems.map(item => (
          <View key={item.key} style={styles.serviceItem}>
            <Text style={styles.serviceLabel}>{item.label}</Text>
            <Switch
              value={formData.services[item.key]}
              onValueChange={(value) => handleServiceChange(item.key, value)}
              trackColor={{ false: "#d3d3d3", true: "#4C86F9" }}
              thumbColor={formData.services[item.key] ? "#fff" : "#f4f3f4"}
            />
          </View>
        ))}
      </View>
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
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  serviceLabel: {
    fontSize: 16,
  }
});

export default ServicesStep;