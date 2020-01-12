import RemoveSocketIoWarning from '../components/RemoveSocketIoWarning';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';

import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';

const ChatDetailScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { chat }, getMessages } = useContext(ChatContext);
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const [receiver, setReceiver] = useState('');
  const socket = useRef(null);

  useEffect(() => {
    setReceiver(navigation.getParam('username'));
    const recipient = navigation.getParam('username');
    getMessages({ username, recipient })
      .then((chat) => {
        setIncomingMsgs(chat);
      });
    setIncomingMsgs(chat);
    socket.current = io('http://192.168.0.31:3001', { query: `username=${username}` });
    socket.current.on('message', message => {
      setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
    });
  }, []);

  const sendMessage = (message) => {
    const msgObj = {
      from: username,
      to: receiver,
      message
    };
    socket.current.emit('message', msgObj);
    setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        renderUsernameOnMessage 
        messages={incomingMsgs} 
        onSend={sendMessage} 
        user={{ _id: 1 }}
        scrollToBottom={true} />
    </View>
  );
};

ChatDetailScreen.navigationOptions = ({ navigation }) => {
  const { state: { params = {} } } = navigation;
  return {
    title: params.username || ''
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default ChatDetailScreen;