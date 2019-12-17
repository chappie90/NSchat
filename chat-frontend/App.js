import RemoveSocketIoWarning from './src/components/RemoveSocketIoWarning';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import io from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';

export default function App() {
  const [outgoingMsg, setOutgoingMsg] = useState('');
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://edfabd16.ngrok.io');
    socket.current.on('message', message => {
    setIncomingMsgs(prevState => [...prevState, message]);  
    });
  }, []);

  const sendMessage = () => {
    socket.current.emit('message', outgoingMsg);
    setOutgoingMsg('');
  };

  const displayChat = incomingMsgs.map(msg => {
    return (
      <Text key={msg}>{msg}</Text>
    );
  });

  return (
    <View style={styles.container}>
      {displayChat}
      <TextInput 
        value={outgoingMsg} 
        onChangeText={msg => setOutgoingMsg(msg)} 
        placeholder="Enter chat message..." 
        onSubmitEditing={sendMessage} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
