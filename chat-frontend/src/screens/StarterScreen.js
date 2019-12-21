import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';

const StarterScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Starter Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default StarterScreen;
