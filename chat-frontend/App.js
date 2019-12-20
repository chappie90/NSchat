import RemoveSocketIoWarning from './src/components/RemoveSocketIoWarning';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import io from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';
import JoinScreen from './src/screens/JoinScreen';

export default function App() {
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://62d9a974.ngrok.io');
    socket.current.on('message', message => {
    setIncomingMsgs(prevState => GiftedChat.append(prevState, message));  
    });
  }, []);

  const sendMessage = (messages) => {
    socket.current.emit('message', messages[0].text);
    setIncomingMsgs(prevState => GiftedChat.append(prevState, messages));
  };

  return (
    <View style={styles.container}>
    {hasJoined 
      ? (<GiftedChat messages={incomingMsgs} onSend={sendMessage} user={{ _id: 1 }} />) 
      : <JoinScreen /> 
    }      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
