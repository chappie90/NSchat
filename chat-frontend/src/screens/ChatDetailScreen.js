import RemoveSocketIoWarning from '../components/RemoveSocketIoWarning';
import React, { useEffect, useState, useMemo, useRef, useContext } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { GiftedChat, Bubble, Avatar, LoadEarlier, Message, MessageText, Time, Send } from 'react-native-gifted-chat';
import { NavigationEvents } from 'react-navigation';
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { MaterialIcons, FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import BottomSheet from 'reanimated-bottom-sheet';

import Colors from '../constants/colors';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import chatApi from '../api/chat';
import { connectToSocket } from '../socket/chat';
import FadeViewAnim from '../components/animations/FadeViewAnim';
import GroupSettingsScreen from './GroupSettingsScreen';
import { getTabBarHeight } from '../components/TabBarComponent';

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
  const [groupSettingsModal, setGroupSettingsModal] = useState(false);
 
  const bottomHeight = useRef(new Animated.Value(40)).current;
  const topHeight = useRef(new Animated.Value(40)).current;
  const topHeightNum = useRef(200).current;
  const deviceHeight = Dimensions.get('window').height;
  const bottomNavHeight = getTabBarHeight();
  // const [deviceHeight, setDeviceHeight] = useState(Dimensions.get('window').height);
  const isDividerClicked = useRef(true);
  const isVisibleYoutube = useRef(false);
  const socket = useRef(null);
  let page;
  let stopTypingTimeout;
  let giftedChatRef;

  const pan = useRef(new Animated.ValueXY());

  // const offset = useRef(new Animated.ValueXY()).current;
  const height = useRef(new Animated.Value(0)).current;

  const panResponder = React.useMemo(() => PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e, gestureState) => {
        // if (e.nativeEvent.pageY < Header.HEIGHT) {
        //   offset.setValue(0);
        // }
        // if (e.nativeEvent.pageY > deviceHeight - 49) {
        //   offset.setValue(deviceHeight - 49);
        // }
        // isDividerClicked.current = true;
        // offset.setOffset({ x: 0, y: offset.y._value });
        // offset.setValue({x: 0, y: 0});
        // if (gestureState.moveY < 70) {
        //     offset.setOffset({ x: 0, y: offset.y._value });
        // }
      },
      onPanResponderStart: (e, gestureState) => {
    
      },
      onPanResponderMove: (e, gestureState) => {
        // topHeight.setValue(gestureState.moveY > (deviceHeight - 40) ? 40 : deviceHeight - gestureState.moveY);
        // offset.setValue(100);
        // if (e.nativeEvent.pageY < Header.HEIGHT) {
        //   offset.setValue(0);
        // }
        // if (e.nativeEvent.pageY > deviceHeight - Header.HEIGHT - 24) {
        //   offset.setValue(deviceHeight - 153);
        // }
          // offset.setValue({x: 0, y: gestureState.dy});
          height.setValue(e.nativeEvent.pageY - 50);
        //     if (gestureState.moveY < 70) {
        //    offset.setValue({x: 0, y: 0});
        // }
          // if (gestureState.moveY > deviceHeight - 125) {
          //    offset.setValue({x: 0, y: deviceHeight - 153});
          // }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (e.nativeEvent.pageY > (deviceHeight - 30 - bottomNavHeight) / 2) {
          // height.setValue(deviceHeight - 70 - bottomNavHeight);
          Animated.spring(
            height,
            {
              toValue: deviceHeight - 70 - bottomNavHeight // Animate to final value of 1
            },
          ).start();
        }
        if (e.nativeEvent.pageY < (deviceHeight - 30 - bottomNavHeight) / 2) {
          Animated.spring(
            height,
            {
              toValue: 0
            },
          ).start();
        }
        height.flattenOffset();
      },
    }), []);

  const PUSH_REGISTRATION_ENDPOINT = `${chatApi}/token`;
  const MESSAGE_ENPOINT = `${chatApi}/message`;

  useEffect(() => {
    navigation.setParams({ 
      openModal: openModalHandler,
      openYoutube: openYoutubeHandler,
      isVisibleYou: isVisibleYoutube.current 
    });
    registerForPushNotificationsAsync();
    socket.current = connectToSocket(username);
    socket.current.on('message', message => {
      getChats({ username });
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
  }, [chat]);

  const didFocusHandler = () => {
    socket.current.emit('join_chat', { username, recipient });
  };

  const willBlurHandler = () => {
    resetChatState();
  };

  const openModalHandler = () => {
    setGroupSettingsModal(true);
  };

  const openYoutubeHandler = (params) => {
      isVisibleYoutube.current = !params;
      navigation.setParams({ isVisibleYou: !params });
  };

  const renderContent = () => {
    return (
      <View style={styles.panel}>
        <WebView
        allowsInlineMediaPlayback={true} style={{ flex: 1 }} source={{ uri: 'https://www.youtube.com' }} />
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={{ width: '100%', height: 50, backgroundColor: Colors.primary }} />
    );
  };

  const closeModalHandler = () => {
    setGroupSettingsModal(false);
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

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{marginRight: 10, marginBottom: 8}}>
          <MaterialIcons name="send" size={26} color={Colors.primary} />
        </View>
      </Send>
    );
  }

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
            style={styles.leftCheckmark}
            name="ios-checkmark"
            size={24} color="#87CEEB" />
          <Ionicons
            style={styles.rightCheckmark}
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
              style={styles.leftCheckmark}
              name="ios-checkmark"
              size={24} color="#C8C8C8" />
            <Ionicons
              style={styles.rightCheckmark}
              name="ios-checkmark"
              size={24} color="#C8C8C8" />
          </View>
        );
    } else if (props.currentMessage.user._id === 1 && !props.currentMessage.deleted) {
        return (
          <View  { ...props}>
            <Ionicons
              style={styles.leftCheckmark}
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
        <Animated.View
            { ...panResponder.panHandlers }
            style={[
              // {transform:
              //   { translateY: offset }
              // ]},
              {height: height, maxHeight: deviceHeight - 70 - bottomNavHeight},
              styles.youtubeVideo
            ]}>
            <WebView
             allowsInlineMediaPlayback={true} 
             style={{ flex: 1 }} source={{ uri: 'https://www.youtube.com' }} />
          <Animated.View
            { ...panResponder.panHandlers }
            style={[
              // {transform: [
              //   { translateY: offset }
              // ]},
              styles.youtubeNav
            ]}>
          </Animated.View>
          </Animated.View>
        {isVisibleYoutube.current && <View style={{flex: 1, position: 'absolute', top: 0, left: 0, zIndex: 2, width: '100%', height: '100%' }}>
          <BottomSheet
            initialSnap={1}
            snapPoints = {[460, 50]}
            renderContent = {renderContent}
            renderHeader = {renderHeader}
          />
        </View>}
        {isVisibleYoutube.current && <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
         <WebView  
          mediaPlaybackRequiresUserAction={true} 
          allowsFullscreenVideo={true} 
          automaticallyAdjustContentInsets={false}
          style={{ flex: 1 }} 
          source={{ uri: 'https://www.youtube.com/watch?v=mvfT_tgpWNM' }} />
        </View>}
        <GroupSettingsScreen visible={groupSettingsModal} closeModal={closeModalHandler} />
             {isVisibleYoutube.current && <GiftedChat
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
              renderSend={renderSend}
              renderChatFooter={renderChatFooter}
              renderCustomView={false ? null : renderCustomView}
              isCustomViewBottom={true}
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
              }}/>}
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
    headerRight: (
      <View style={{flexDirection: 'row'}}>  
        <TouchableOpacity onPress={() => params.openYoutube(params.isVisibleYou)}>
          <FontAwesome name="youtube" size={32} style={{paddingTop: 1}} color={params.isVisibleYou ? Colors.tertiary : "#D0D0D0"} />
        </TouchableOpacity>
       {params.type === 'group' && (
         <TouchableOpacity onPress={() => params.openModal()}>
          <MaterialIcons
            name="settings" 
            size={28} 
            color="#D0D0D0"
            style={{ paddingHorizontal: 10,  paddingTop: 3 }} />
        </TouchableOpacity>)}
      </View>
    ),
    headerBackground: (
      <View style={{
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        paddingLeft: 55,
        paddingTop: 20 }}>
        <FadeViewAnim style={{ overflow: 'hidden', width: 40, height: 40, borderRadius: 20 }}>
          {params.image ? (
            <Image source={{ uri: params.image }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Image style={{ width: '100%', height: '100%' }} source={require('../../assets/avatar2.png')} />
          )}
        </FadeViewAnim>
        <Text style={{ marginLeft: 10, fontFamily: 'open-sans-semi-bold', fontSize: 18 }}>{params.username} {params.isTyping ? params.isTyping : ''}</Text>
      </View>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 40,
    zIndex: 2
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
  leftCheckmark: {
    position: 'absolute', 
    right: -15, 
    bottom: -20
  },
  rightCheckmark: {
    position: 'absolute', 
    right: -24, 
    bottom: -20
  },
    panelContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  panel: {
    height: '100%'
  },
  header: {
    width: '100%',
    height: 50,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#292929',
    alignItems: 'center',
    marginVertical: 10,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  youtubeNav: {
    width: '100%',
    height: 40,
    backgroundColor: 'lightgrey'
  },
  youtubeVideo: {
    backgroundColor: Colors.primary,
    width: '100%',
    position: 'absolute',
    left: 0
  }
});

export default ChatDetailScreen;