import RemoveSocketIoWarning from '../components/RemoveSocketIoWarning';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';
// import { AsyncStorage } from 'react-native';

const ChatDetailScreen = () => {
 const [incomingMsgs, setIncomingMsgs] = useState([]);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://192.168.1.108:3001');
    socket.current.on('message', message => {
      setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
    });
  });

  const sendMessage = (messages) => {
    socket.current.emit('message', messages[0].text);
    setIncomingMsgs(prevState => GiftedChat.append(prevState, messages));
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        renderUsernameOnMessage 
        messages={incomingMsgs} 
        onSend={sendMessage} 
        user={{ _id: 1 }} />
    </View>
  );
};

ChatDetailScreen.navigationOptions = {
  // title: 'Chats',
  // tabBarIcon: <MaterialIcons name="chat" size={30} />
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default ChatDetailScreen;