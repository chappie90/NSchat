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
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import chatApi from '../api/chat';

const ChatDetailScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { chat }, getChats, getMessages } = useContext(ChatContext);
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [currentPage, setCurrentPage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [badgeNumber, setBadgeNumber] = useState(null);
  const socket = useRef(null);
  let page;

  const PUSH_REGISTRATION_ENDPOINT = `${chatApi}/token`;
  const MESSAGE_ENPOINT = `${chatApi}/message`;

  useEffect(() => {
    registerForPushNotificationsAsync();
    socket.current = io('http://192.168.1.174:3000', { query: `username=${username}` });
    socket.current.on('message', message => {
      setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
    });
  }, []);

  useEffect(() => {
    async () => {
      const resetBadgeNumber = await Notifications.setBadgeNumberAsync(0);
    };
    setBadgeNumber(0);
  }, [badgeNumber]);

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
  }, [recipient]);

  const registerForPushNotificationsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    if (status !== 'granted') {
      return;
    }
    let token = await Notifications.getExpoPushTokenAsync();


    // return fetch(PUSH_REGISTRATION_ENDPOINT, {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     token: {
    //       value: token
    //     },
    //     user: {
    //       username:'warly',
    //       name: 'Dan Ward'
    //     }
    //   })
    // });

    sendPushNotificationToken(token, 'Stoyan');

    const notificationSubscription = Notifications.addListener(handleNotification);
  };

  const handleNotification = async (notification) => {
    setNotification({ notification });
    console.log(notification);

    const setBadgeNumber = await Notifications.setBadgeNumberAsync(badgeNumber + 1);
    // setBadgeNumber(badgeNumber + 1);
  }

  const sendPushNotificationToken = async (token, username) => {
    try {
      const response = await chatApi.post('/token', { token, username });
      
      console.log(response.data); 

    } catch (err) {
      console.log(err);
    }
  };


  const loadMoreMessages = () => {
    let page = currentPage + 1;  
    getMessages({ username, recipient, page })
      .then((chat) => {
        setIncomingMsgs(prevState => GiftedChat.prepend(prevState, chat));
      });
    setCurrentPage(currentPage + 1);
  };

  const sendMessage = async (message) => {
    const msgObj = {
      from: username,
      to: recipient,
      message,
    };
    const { message: [{ text }] } = msgObj;
    socket.current.emit('message', msgObj);
    setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
    getChats({ username });

    try {
      const response = await chatApi.post('/message', { message: text });
    } catch (err) {
      console.log(err);
    }

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
          keyboardShouldPersistTaps={'handled'}
          //isLoadingEarlier={true}
          bottomOffset={ Platform.OS === 'android' ? null : 46 }
          scrollToBottom={true}
          scrollToBottomComponent={() => {
            return (
              <View style={styles.scrollContainer}>
                <MaterialIcons name="keyboard-arrow-down" size={30} color={Colors.primary} />
              </View>
            );
          }}/>
         <KeyboardAvoidingView 
            behavior={ Platform.OS === 'android' ? 'padding' :  null}
            keyboardVerticalOffset={80} />
         {/* {Platform.OS === 'android' ? <KeyboardSpacer /> : null } */}
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
    paddingTop: Platform.OS === 'ios' ? 9 : null,
  },
  loadButton: {
    backgroundColor: Colors.tertiary
  },
  loadButtonText: {
    fontFamily: 'open-sans'
  }
});

export default ChatDetailScreen;