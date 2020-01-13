import RemoveSocketIoWarning from '../components/RemoveSocketIoWarning';
import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { GiftedChat, Bubble, Avatar, LoadEarlier } from 'react-native-gifted-chat';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';

const ChatDetailScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { chat }, getMessages } = useContext(ChatContext);
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [currentPage, setCurrentPage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [messageText, setMessageText] = useState('');
  const socket = useRef(null);
  let page;

  const PUSH_REGISTRATION_ENDPOINT = 'http://generated-ngrok-url/token';
  const MESSAGE_ENPOINT = 'http://generated-ngrok-url/message';

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

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

  const registerForPushNotificationsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    if (status !== 'granted') {
      return;
    }
    let token = await Notifications.getExpoPushTokenAsync();

    return fetch(PUSH_REGISTRATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: {
          value: token
        },
        user: {
          username:'warly',
          name: 'Dan Ward'
        }
      })
    });

    const notificationSubscription = Notifications.addListener(handleNotifcation);
  };

  const handleNotification = (notification) => {
    setNotification({ notification });
  }

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

  const renderBubble = (bubbleProps) => {
    return (
      <Bubble { ...bubbleProps }
        wrapperStyle={{ left: styles.left, right: styles.right }}
        textStyle={{ left: styles.text, right: styles.text }} />
    );
  };

  const renderAvatar = (avatarProps) => {
    return (
      <Avatar { ...avatarProps }
        imageStyle={{ left: styles.avatar }} />
    );
  };

  const renderLoadEarlier = (props) => {
    if (chat.length < 4 || !chat) {
      return;
    }

    return (
      <LoadEarlier { ...props } 
        wrapperStyle={styles.loadButton}
        textStyle={styles.loadButtonText} />
    );
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
          renderBubble={renderBubble}
          renderAvatar={renderAvatar}
          loadEarlier={true} // enables load earlier messages button
          onLoadEarlier={() => {
            loadMoreMessages();
          }}
          renderLoadEarlier={renderLoadEarlier}
          //isLoadingEarlier={true}
          bottomOffset={46}
          scrollToBottom={true}
          scrollToBottomComponent={() => {
            return (
              <View style={styles.scrollContainer}>
                <MaterialIcons name="keyboard-arrow-down" size={30} color={Colors.primary} />
              </View>
            );
          }}/>
         {/*  <KeyboardAvoidingView 
            behavior={ Platform.OS === 'android' ? 'padding' :  null}
            keyboardVerticalOffset={80} /> */}
         {/* Solution for Android. Try without to see if necesssary 
          {Platform.OS === 'android' ? <KeyboardSpacer /> : null } */}
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
    backgroundColor: Colors.primary,
    // width: 28,
    // height: 28
    marginRight: -8
  },
  input: {
    paddingTop: 9
  },
  loadButton: {
    backgroundColor: Colors.tertiary
  },
  loadButtonText: {
    fontFamily: 'open-sans'
  }
});

export default ChatDetailScreen;