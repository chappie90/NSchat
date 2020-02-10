import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';

import { Context as AppContext } from '../context/AppContext';

const Overlay = () => {
  const { state: { overlayMode } } = useContext(AppContext);

  return (
    <View style={styles.overlayBackground} />
  );
};

const styles = StyleSheet.create({
  overlayBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000',
    opacity: 0.2,
    zIndex: 1
  }
});

export default Overlay;