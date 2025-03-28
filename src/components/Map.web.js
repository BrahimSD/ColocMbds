import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WebMap = ({ style, children, initialRegion, ...props }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Carte disponible uniquement sur mobile</Text>
        <Text style={styles.mapSubText}>
          {initialRegion ? 
            `Position: ${initialRegion.latitude.toFixed(4)}, ${initialRegion.longitude.toFixed(4)}` : 
            'Position: Paris (48.8566, 2.3522)'
          }
        </Text>
      </View>
    </View>
  );
};

const WebMarker = () => null;

export { WebMarker as Marker };
export default WebMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  mapSubText: {
    fontSize: 14,
    color: '#666',
  },
}); 