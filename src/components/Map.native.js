import React from 'react';
import { MapView, Marker } from 'react-native-maps';

const NativeMap = ({ style, children, ...props }) => {
  return (
    <MapView
      style={[{ flex: 1 }, style]}
      {...props}
    >
      {children}
    </MapView>
  );
};

export { Marker };
export default NativeMap; 