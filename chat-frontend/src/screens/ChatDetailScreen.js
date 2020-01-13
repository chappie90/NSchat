import RemoveSocketIoWarning from '../components/RemoveSocketIoWarning';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { GiftedChat, Bubble, Avatar } from 'react-native-gifted-chat';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';

const ChatDetailScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { chat }, getMessages } = useContext(ChatContext);
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [currentPage, setCurrentPage] = useState(null);
  const socket = useRef(null);
  let page;

  useEffect(() => {
    setCurrentPage(1);
    setRecipient(navigation.getParam('username'));
    if (recipient && currentPage) {
      page = currentPage;
      getMessages({ username, recipient, page })
      .then((chat) => {
        setIncomingMsgs(chat);
      });
    }
    socket.current = io('http://192.168.0.31:3001', { query: `username=${username}` });
    socket.current.on('message', message => {
      setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
    });
  }, [recipient]);

  const loadMoreMessages = () => {
    let page = currentPage + 1;  
    getMessages({ username, recipient, page })
      .then((chat) => {
        setIncomingMsgs(prevState => GiftedChat.prepend(prevState, chat));
      });
    setCurrentPage(currentPage + 1);
  };

  const sendMessage = (message) => {
    const msgObj = {
      from: username,
      to: recipient,
      message,
    };
    socket.current.emit('message', msgObj);
    setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
  };

  // IS OVERRIDING scrollToBottom
  // const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
  //   const paddingToTop = 80;
  //   return contentSize.height - layoutMeasurement.height - paddingToTop <= contentOffset.y;
  // };

  return (
    <View style={styles.container}>
      <GiftedChat
        renderUsernameOnMessage 
        messages={incomingMsgs} 
        onSend={sendMessage} 
        user={{ _id: 1 }}
        // listViewProps={{
        //   scrollEventThrottle: 400,
        //   onScroll: ({ nativeEvent }) => { 
        //     if (isCloseToTop(nativeEvent)) {
        //       console.log('test');
        //     }
        //   }
        // }}
        textInputStyle={styles.input}
        renderBubble={(props) => {
          return (
            <Bubble { ...props }
              wrapperStyle={{ left: styles.left, right: styles.right }}
              textStyle={{ left: styles.text, right: styles.text }} />
          );
        }}
        renderAvatar={(props) => {
          return (
            <Avatar { ...props }
              imageStyle={{ left: styles.avatar }} />
          );
        }}
        loadEarlier={true} // enables load earlier messages button
        onLoadEarlier={() => {
          loadMoreMessages();
        }}
        //isLoadingEarlier={true}
        scrollToBottom={true}
        scrollToBottomComponent={() => {
          return (
            <View style={styles.scrollContainer}>
              <MaterialIcons name="keyboard-arrow-down" size={30} color={Colors.primary} />
            </View>
          );
        }}/>
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
  },
  scrollContainer: {
    width: 30,
    height: 30,
    paddingTop: 1
  },
  left: {
    backgroundColor: '#E8E8E8'
  },
  right: {
    backgroundColor: Colors.secondary
  },
  text: {
    fontFamily: 'open-sans'
  },
  avatar: {
    backgroundColor: Colors.primary
  },
  input: {
    paddingTop: 8
  }
});

export default ChatDetailScreen;