import React from 'react';
import { View, Text, TextInput, Image } from 'react-native';

export default function JoinScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Image source={require('../../assets/chat-icon.png')} />
      <Text style={{ fontSize: 50 }}>JoinScreen</Text>
    </View>
  );
}