import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../constants/colors';
import HeadingText from './HeadingText';

const PrimaryButton = props => {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={styles.button}>
        <HeadingText style={styles.text}>{props.children}</HeadingText>
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
    fontSize: 20
  }
});

export default PrimaryButton;