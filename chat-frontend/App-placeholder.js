import RemoveSocketIoWarning from './src/components/RemoveSocketIoWarning';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { createAppContainer, createSwitchNagivator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import io from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';
import JoinScreen from './src/screens/JoinScreen';
import { createStore, applyMiddleware } from 'redux';
import createSocketIoMiddleware from 'redux-socket.io';

export default function App() {
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://192.168.1.108:3001');
    socket.current.on('message', message => {
    setIncomingMsgs(prevState => GiftedChat.append(prevState, message));  
    });
  }, []);

  const sendMessage = (messages) => {
    socket.current.emit('message', messages[0].text);
    setIncomingMsgs(prevState => GiftedChat.append(prevState, messages));
  };

  const joinChat = username => {
    socket.current.emit('join', username);
    setHasJoined(true);
  };

  return (
    <View style={styles.container}>
    {hasJoined 
      ? (<GiftedChat
          renderUsernameOnMessage 
          messages={incomingMsgs} 
          onSend={sendMessage} 
          user={{ _id: 1 }} />) 
      : <JoinScreen joinChat={joinChat} /> 
    }      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
