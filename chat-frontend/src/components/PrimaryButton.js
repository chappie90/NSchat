import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../constants/colors';

const PrimaryButton = props => {
  return (
    <TouchableOpacity style={{ ...props.style }} onPress={props.onPress}>
      <View style={styles.button}>
        <Text style={styles.text}>{props.children}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 3
  },
  text: {
    color: '#fff',
    fontFamily: 'open-sans-semi-bold',
    fontSize: 20
  }
});

export default PrimaryButton;