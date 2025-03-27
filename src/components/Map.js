import React from 'react';
import { Platform, View, Text } from 'react-native';
import MapView from 'react-native-maps';

// Composant Map pour mobile
const MobileMap = ({ style, children, ...props }) => (
  <MapView
    style={[{ flex: 1 }, style]}
    {...props}
  >
    {children}
  </MapView>
);

// Composant Map pour web (placeholder)
const WebMap = ({ style, children, ...props }) => (
  <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
    <Text>La carte n'est pas disponible sur le web</Text>
  </View>
);

// Composant Map principal qui choisit la bonne version selon la plateforme
const Map = Platform.select({
  ios: MobileMap,
  android: MobileMap,
  web: WebMap,
  default: WebMap,
});

export default Map; 