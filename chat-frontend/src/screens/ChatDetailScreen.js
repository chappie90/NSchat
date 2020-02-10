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
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { Overlay, Image } from 'react-native-elements';
import { GiftedChat, Bubble, Avatar, LoadEarlier, Message, MessageText, Time } from 'react-native-gifted-chat';
import { NavigationEvents } from 'react-navigation';
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
  const { state: { chat }, getChats, getMessages, updateMessages, deleteMessage, resetChatState } = useContext(ChatContext);
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [currentPage, setCurrentPage] = useState(null);
  const [notification, setNotification] = useState(null);
  // const [badgeNumber, setBadgeNumber] = useState(null);
  const [overlayMode, setOverlayMode] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const socket = useRef(null);
  let page;
  let stopTypingTimeout;
  let giftedChatRef;

  const PUSH_REGISTRATION_ENDPOINT = `${chatApi}/token`;
  const MESSAGE_ENPOINT = `${chatApi}/message`;

  useEffect(() => {
    registerForPushNotificationsAsync();
    socket.current = connectToSocket(username);
    socket.current.on('message', message => {
      if (message.user.name === username) {
        updateMessages({ message });
        setIncomingMsgs(prevState => prevState.map(msg => {
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
    // socket.current.on('message_deleted', message => {
    //   if (message) {
    //     const deletedMessage = chat.map(item => {
    //     return item._id === message._id ? { ...item, text: 'Message deleted', deleted: true } : item;
    //   });
    //   setIncomingMsgs(deletedMessage);
    //   }
    // });
    socket.current.on('has_joined_chat', user => {
      if (user === recipient) {
        getMessages({ username, recipient, page: currentPage })
          .then((chat) => {
            setIncomingMsgs(chat);
        });
      } 
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
  }, [recipient]);

  useEffect(() => {;
    setIncomingMsgs(chat);
    console.log('chat updated');
  }, [chat]);

  const didFocusHandler = () => {
    socket.current.emit('join_chat', { username, recipient });
  };

  const willBlurHandler = () => {
    resetChatState();
  };

  // const willFocusHandler = () => {
  //   const getRecipientParam = navigation.getParam('username');
  //   setCurrentPage(1);
  //   setRecipient(getRecipientParam);
  //   console.log(username);
  //   console.log(getRecipientParam);
  //   getMessages({ username, recipient: getRecipientParam, page: 1 });
  // };

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

    if (showReplyBox) {
      msgObj.replyTo = {
         messageId: selectedMessage._id, 
         messageText: selectedMessage.text,
         messageAuthor: selectedMessage.user.name };
    } else {
      msgObj.replyTo = {};
    }

    const { message: [{ text }] } = msgObj;
    socket.current.emit('message', msgObj);
    if (showReplyBox) {
      setShowReplyBox(false);
      message[0].reply = selectedMessage.text;
      message[0].replyAuthor = selectedMessage.user.name;
    }

    if (giftedChatRef) {
      giftedChatRef.scrollToBottom();
    }
    
    setIncomingMsgs(prevState => GiftedChat.append(prevState, message));

    try {
      const response = await chatApi.post('/message', { message: text });
    } catch (err) {
      console.log(err);
    }

  };

  const renderChatFooter = (props) => {
    if (showReplyBox) {
      return (
        <View style={{ minHeight: 50, flexDirection: 'row', backgroundColor: '#F8F8F8', borderTopWidth: 1, borderTopColor: 'lightgrey' }}>
          <View style={{ minHeight: 50, width: 7, backgroundColor: Colors.primary }}></View>
          <View style={{ paddingVertical: 5 }}>
            <Text style={{ color: Colors.tertiary, fontFamily: 'open-sans-semi-bold', paddingLeft: 15 }}>{selectedMessage.user.name}</Text>
            <Text style={{ color: 'gray', paddingLeft: 15, paddingTop: 3, paddingBottom: 2 }}>{selectedMessage.text}</Text>
          </View>
          <View style={{ flex: 1, paddingTop: 5, justifyContent: 'flex-start', alignItems: 'flex-end', paddingRight: 15 }}>
            <TouchableOpacity onPress={() => setShowReplyBox(false)}>
              <Ionicons name="ios-close-circle" color={Colors.tertiary} size={28} />
            </TouchableOpacity>
          </View> 
        </View>
      );
    }
  };

  const deleteMessageHandler = () => {
    deleteMessage({ messageId: selectedMessage._id });
    // socket.current.emit('delete_message', selectedMessage);  
    setOverlayMode(false);
  };

  const replyMessageHandler = () => {
    setShowReplyBox(true);
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
          setSelectedMessage(props.currentMessage);
          setOverlayMode(true)
        }}
        wrapperStyle={{ left: styles.left, right: styles.right }}
        textStyle={{ left: styles.text, right: styles.text }} />
    );
  };

  const renderMessage = (props) => {
    if (props.currentMessage.reply) {
      return <RenderMessageReplyBubble { ...props } />;
    }
    return <Message { ...props } />;
  };  

  const renderLoading = () => {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
       </View>
    );
  };

  const RenderMessageReplyBubble = props => {
    return (
      <View style={props.containerStyle}> 
        <View style={{ paddingBottom: 2, marginRight: 32, marginLeft: 60 }}>
          <View style={{ borderRadius: 15, backgroundColor: Colors.secondary }}>
            <View style={{
              flexDirection: 'row', 
              backgroundColor: '#76bf88', 
              padding: 5, 
              alignItems: 'center', 
              borderLeftWidth: 6, 
              borderLeftColor: '#D8D8D8', 
              //'#D8D8D8'
              // '#eda1a1'
              // '#e6b5b5
              // #18240b
              borderRadius: 8, 
              marginTop: 8, marginHorizontal: 8 }}>
                <View style={{flexDirection: 'column'}}>
                  <Text style={{color: 'black', paddingHorizontal: 10, marginBottom: 4 }}>Reply to <Text style={{ fontFamily: 'open-sans-semi-bold' }}>{props.currentMessage.replyAuthor}</Text></Text>
                  <Text style={{color: 'white', paddingHorizontal: 10 }}>{props.currentMessage.reply}</Text>
                </View>
              </View>
              <MessageText {...props} />
              <Time {...props} />
            </View>
          </View>
        </View>
    );
  };

  const renderMessageText = props => {
    if (props.currentMessage.deleted) {
      return <Text style={styles.deletedMessage}>Message deleted</Text>;
    }
    return <MessageText { ...props } />;
  };
 
  const renderCustomView = (props) => {
    if (props.currentMessage.user._id === 1 &&
        props.currentMessage.read &&
        !props.currentMessage.deleted) {
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
    } else if (props.currentMessage.user._id === 1 && 
               props.currentMessage.hasOwnProperty('read') && 
               !props.currentMessage.deleted) {
        return (
          <View  { ...props}>
            <Ionicons
              style={{ position: 'absolute', right: -15, bottom: -45 }}
              name="ios-checkmark"
              size={24} color="#C8C8C8" />
            <Ionicons
              style={{ position: 'absolute', right: -24, bottom: -45 }}
              name="ios-checkmark"
              size={24} color="#C8C8C8" />
          </View>
        );
    } else if (props.currentMessage.user._id === 1 && !props.currentMessage.deleted) {
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
      <NavigationEvents
        onWillBlur={willBlurHandler}
        // onWillFocus={willFocusHandler}
        onDidFocus={didFocusHandler}
        />
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
          placeholderTextColor="#202020"
          renderBubble={renderBubble}
          renderAvatar={renderAvatar}
          loadEarlier={true} // enables load earlier messages button
          onLoadEarlier={() => {
            loadMoreMessages();
          }}
          renderLoading={renderLoading}
          ref={ref => giftedChatRef = ref}
          renderChatFooter={renderChatFooter}
          renderCustomView={false ? null : renderCustomView}
          renderMessage={renderMessage}
          renderMessageText={renderMessageText}
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
                  <TouchableOpacity style={styles.overlayItemWrapper} onPress={replyMessageHandler}>
                    <View style={styles.overlayItem}>
                      <View style={styles.iconWrapper}>
                        <MaterialIcons color="white" name="reply" size={24} />
                      </View>
                      <BodyText style={styles.overlayText}>Reply to message</BodyText>
                    </View>
                  </TouchableOpacity>
                    <TouchableOpacity style={styles.overlayItemWrapper} onPress={deleteMessageHandler}>
                    <View style={styles.overlayItem}>
                      <View style={styles.deleteIconWrapper}>
                        <AntDesign color="white" name="delete" size={24} />
                      </View>
                      <BodyText style={styles.overlayDelete}>Delete message</BodyText>
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
      {/* title:  `${params.username} ${params.isTyping ? params.isTyping : ''}`  || '' */}

  return {
    headerLeft: (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons
          name="ios-arrow-back" 
          size={34} 
          color={Colors.primary} 
          style={{ paddingHorizontal: 10,  paddingTop: 5, marginLeft: 10 }} />
      </TouchableOpacity>
    ), 
    headerBackground: (
      <View style={{
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        paddingLeft: 60,
        paddingTop: 20 }}>
        <View style={{ overflow: 'hidden', borderRadius: 17 }}>
          <Image
            style={{ width: 34, height: 34 }}
            source={require('../../assets/avatar2.png')}
          />
        </View>
        <Text style={{ marginLeft: 10, fontFamily: 'open-sans-semi-bold', fontSize: 18 }}>{params.username} {params.isTyping ? params.isTyping : ''}</Text>
      </View>
    )
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
  },
  deletedMessage: { 
    color: '#282828', 
    fontSize: 15,
    fontStyle: 'italic', 
    paddingHorizontal: 10, 
    paddingVertical: 5 
  },
  spinnerContainer: {
    padding: 40
  },
});

export default ChatDetailScreen;