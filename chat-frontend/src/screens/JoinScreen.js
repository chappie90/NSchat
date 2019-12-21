import React, { useState } from 'react';
import { 
  View, 
  Button, 
  TextInput, 
  Image,
  KeyboardAvoidingView } from 'react-native';

export default function JoinScreen({ joinChat }) {
  const [username, setUsername] = useState('');

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Image resizeMode="contain" style={{ flex: 1, marginTop: 80 }} source={require('../../assets/chat-icon.png')} />
      <View style={{ flex: 1 }}>
        <TextInput 
          style={{ fontSize: 26, textAlign: 'center', height: 40 }} 
          value={username}
          placeholder="Enter username" 
          onChangeText={setUsername}
          />
        <Button title="Join Chat" onPress={() => joinChat(username)} />
      </View>
      {Platform.OS === 'ios' && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
}