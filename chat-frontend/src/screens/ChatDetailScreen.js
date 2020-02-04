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
  KeyboardAvoidingView
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { GiftedChat, Bubble, Avatar, LoadEarlier } from 'react-native-gifted-chat';
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';

import Colors from '../constants/colors';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import chatApi from '../api/chat';
import { connectToSocket } from '../socket/chat';

const ChatDetailScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { chat }, getChats, getMessages } = useContext(ChatContext);
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [currentPage, setCurrentPage] = useState(null);
  const [notification, setNotification] = useState(null);
  // const [badgeNumber, setBadgeNumber] = useState(null);
  const [overlayMode, setOverlayMode] = useState(false);
  const socket = useRef(null);
  let page;
  let stopTypingTimeout;

  const PUSH_REGISTRATION_ENDPOINT = `${chatApi}/token`;
  const MESSAGE_ENPOINT = `${chatApi}/message`;

  useEffect(() => {
    registerForPushNotificationsAsync();
    socket.current = connectToSocket(username);
    socket.current.on('message', message => {
      if (message.user.name === username) {
        setIncomingMsgs(prevState => prevState.map(msg => {
          console.log(msg);
          if (msg._id == message._id) {
            console.log(msg);
          }
          return msg._id === message._id ? { ...msg, read: false } : msg;
        }));
        return;
      }
      setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
    });
    socket.current.on('is_typing', () => {
      navigation.setParams({ isTyping: 'is typing...' });
    });
    socket.current.on('is_not_typing', () => {
      navigation.setParams({ isTyping: '' });
    });
  }, []);

  // useEffect(() => {
  //   async () => {
  //     const resetBadgeNumber = await Notifications.setBadgeNumberAsync(0);
  //   };
  //   setBadgeNumber(0);
  // }, [badgeNumber]);

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
    console.log('recipient useeffect ran');
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

    // sendPushNotificationToken(token, 'Stoyan');

    // const notificationSubscription = Notifications.addListener(handleNotification);
  };

  const handleNotification = async (notification) => {
    setNotification({ notification });
    // console.log(notification);

    // const setBadgeNumber = await Notifications.setBadgeNumberAsync(badgeNumber + 1);
    // setBadgeNumber(badgeNumber + 1);
  }

  const sendPushNotificationToken = async (token, username) => {
    try {
      const response = await chatApi.post('/token', { token, username });
      
      // console.log(response.data); 

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
    // getChats({ username });

    try {
      const response = await chatApi.post('/message', { message: text });
    } catch (err) {
      console.log(err);
    }

  };

  const deleteMessage = async ({ username, recipient, message }) => {
    console.log(username, recipient, message);
  };

  const deleteMessageHandler = () => {
    deleteMessage({ username, recipient, message });
    setOverlayMode(false);
  };

  const startTypingHandler = () => {
    socket.current.emit('start_typing', { username, recipient });

    if (stopTypingTimeout) {
      clearTimeout(stopTypingTimeout);
    }

    stopTypingTimeout = setTimeout(() => {
      socket.current.emit('stop_typing', recipient); 
      // stopTypingTimeout = undefined;
    }, 3000);
  };

  const renderBubble = (props) => {
    return (
      <Bubble { ...props }
        onLongPress={(bubbleProps) => {
          console.log(props);
          setOverlayMode(true)
        }}
        wrapperStyle={{ left: styles.left, right: styles.right }}
        textStyle={{ left: styles.text, right: styles.text }} />
    );
  };

  const renderCustomView = (props) => {
    if (props.currentMessage.user._id === 1 && props.currentMessage.hasOwnProperty('read')) {
      return (
        <View  { ...props}>
          <Ionicons
            style={{ position: 'absolute', right: -15, bottom: -45 }}
            name="ios-checkmark"
            size={24} color="#87CEEB" />
          <Ionicons
            style={{ position: 'absolute', right: -24, bottom: -45 }}
            name="ios-checkmark"
            size={24} color="#87CEEB" />
        </View>
      );
    } else if (props.currentMessage.user._id === 1) {
      return (
        <View  { ...props}>
          <Ionicons
            style={{ position: 'absolute', right: -15, bottom: -45 }}
            name="ios-checkmark"
            size={24} color="#C8C8C8" />
        </View>
      );
    }
  };

  const renderAvatar = (avatarProps) => {
    return (
      <Avatar { ...avatarProps }
        imageStyle={{ left: styles.avatar }} />
    );
  };

  const renderLoadEarlier = (props) => {
    if (!chat || chat.length < 50) {
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
          renderCustomView={false ? null : renderCustomView}
          // renderLoading={() => {}}
          renderLoadEarlier={renderLoadEarlier}
          keyboardShouldPersistTaps={'handled'}
          onInputTextChanged={startTypingHandler}
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
         <Overlay
              isVisible={overlayMode}
              width="auto"
              height="auto"
              onBackdropPress={() => setOverlayMode(false)}>
                <View style={styles.overlayContainer}>
                  <TouchableOpacity style={styles.overlayItemWrapper} onPress={() => {}}>
                    <View style={styles.overlayItem}>
                      <View style={styles.iconWrapper}>
                        <MaterialIcons color="white" name="content-copy" size={24} />
                      </View>
                      <BodyText style={styles.overlayText}>Copy message</BodyText>
                    </View>
                  </TouchableOpacity>
                    <TouchableOpacity style={styles.overlayItemWrapper} onPress={deleteMessageHandler}>
                    <View style={styles.overlayItem}>
                      <View style={styles.deleteIconWrapper}>
                        <AntDesign color="white" name="delete" size={24} />
                      </View>
                      <BodyText style={styles.overlayDelete}>Delete Message</BodyText>
                    </View>  
                  </TouchableOpacity>
                  <View style={styles.cancel}>
                    <TouchableOpacity onPress={() => setOverlayMode(false)}>
                      <BodyText style={styles.cancelText}>Cancel</BodyText>
                    </TouchableOpacity>
                  </View>
                </View>
            </Overlay>
    </View>
  );
};

ChatDetailScreen.navigationOptions = ({ navigation }) => {
  const { state: { params = {} } } = navigation;

  return {
    title: `${params.username} ${params.isTyping ? params.isTyping : ''}`  || ''
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
    backgroundColor: Colors.secondary,
    marginRight: 24
    // maringRight: 22
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
    paddingTop: Platform.OS === 'ios' ? 9 : null
  },
  loadButton: {
    backgroundColor: Colors.tertiary
  },
  loadButtonText: {
    fontFamily: 'open-sans',
    fontSize: 14
  },
  overlayContainer: {
    padding: 15,
    paddingBottom: 10,
  },
  overlayItemWrapper: {
    marginBottom: 10,
  },
  overlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1 
  },
  overlayText: {
    fontSize: 18,
    marginLeft: 8,
    color: 'grey'
  },
  overlayDelete: {
    fontSize: 18,
    marginLeft: 8,
    color: Colors.tertiary
  },
  iconWrapper: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteIconWrapper: {
    backgroundColor: Colors.tertiary,
    borderRadius: 100,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancel: {
    marginTop: 10,
    padding: 5,
    alignSelf: 'center',
  },
  cancelText: {
    color: 'grey',
    fontSize: 18
  }
});

export default ChatDetailScreen;