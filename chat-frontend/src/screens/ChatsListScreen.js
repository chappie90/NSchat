import RemoveSocketIoWarning from '../components/RemoveSocketIoWarning';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';
import io from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';

const ChatsListScreen = ({ navigation }) => {
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
      <TouchableOpacity onPress={() => navigation.navigate('ChatDetail')}>
        <Text>Chats List</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cotainer: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center'
  }
});

export default ChatsListScreen;