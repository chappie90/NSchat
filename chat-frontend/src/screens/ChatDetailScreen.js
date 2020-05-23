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
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  PanResponder,
  Animated,
  Keyboard,
  Dimensions,
  Alert,
  Button
} from 'react-native';
import Constants from 'expo-constants';
import { Overlay } from 'react-native-elements';
import { GiftedChat, Bubble, Avatar, Message, MessageText, Time, Send } from 'react-native-gifted-chat';
import { NavigationEvents } from 'react-navigation';
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import Modal from "react-native-modal";
import { v4 as uuidv4 } from 'uuid'
import * as Random from 'expo-random'

import Colors from '../constants/colors';
import youtubeApi from '../api/youtube';
import YoutubeComponent from '../components/YoutubeComponent';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import { Context as GroupsContext } from '../context/GroupsContext';
import chatApi from '../api/chat';
import FadeViewAnim from '../components/animations/FadeViewAnim';
import GroupSettingsScreen from './GroupSettingsScreen';

const ChatDetailScreen = ({ navigation }) => {
  const { state: { username, socketState, statusBarColor }, setStatusBarColor } = useContext(AuthContext);
  const {
    state: { chat, currentScreen, previousChats }, 
    getChats, 
    getMessages, 
    updateMessages, 
    deleteMessage, 
    resetChatState,
    markMessageAsRead,
    deleteMessageState,
    getCurrentScreen,
    updateChatState,
    saveMessageImage,
    addNewChat
 } = useContext(ChatContext);
  const { state: { group } } = useContext(GroupsContext);
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [currentPage, setCurrentPage] = useState(null);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [overlayMode, setOverlayMode] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [groupSettingsModal, setGroupSettingsModal] = useState(false);
  const [chatType, setChatType] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [markSendAsActive, setMarkSendAsActive] = useState(false);
  const [previewImageWidth, setPreviewImageWidth] = useState(null);
  const [previewImageHeight, setPreviewImageHeight] = useState(null);
  const [previewImageMode, setPreviewImageMode] = useState(false);
  const [previewImageInput, setPreviewImageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isVisibleYoutube = useRef(false);
  const isBackgroundYoutube = useRef(false);
  const [showScrollToBottomBtn, setShowScrollToBottomBtn] = useState(false);
  const socket = useRef(null);
  const chatIdRef = useRef(null);
  const [chatId, setChatId] = useState(null);
  const previousRoute = useRef(null);
  const [uuid, setUuid] = useState('');
  const [fadeAnim, setFadeAnim] = useState(new Animated.Value(0.01));
  const [inputFocused, setInputFocused] = useState(false);
  let page;
  let stopTypingTimeout;
  let giftedChatRef;
  let mounted = true;
  const screen = useRef(null);
  const deviceHeight = Dimensions.get('window').height;
  const statusBarHeight = Constants.statusBarHeight;

  useEffect(() => {
    if (!Object.keys(group).length === 0 && group.constructor === Object) {
      navigation.setParams({
        username: group.name,
        image: group.avatar ? group.avatar.imagePath : null
      });
    }
  }, [group]);

  useEffect(() => {
    screen.current = currentScreen;
  }, [currentScreen]);

  useEffect(() => {
    if (socketState) {
      socket.current = socketState; 

      socket.current.on('message', message => {
        let recipient = recipient || navigation.getParam('username');

        socket.current.emit('stop_typing', recipient); 
        if (mounted) {
          updateMessages({ chatId: message.chat.chatId, message: message.message });
        }
        if (message.message.user.name === username) {
          if (chatIdRef.current === null) {
            chatIdRef.current = message.chat.chatId;
            let msgArr = [];
            msgArr.push(message.message);
            setIncomingMsgs(msgArr);
            message.chat.type = 'private';
            message.chat.muted = false;
            message.chat.unreadMessageCount = 0;
            message.chat.from = username;
            addNewChat(message.chat);
          } else {
            // setIncomingMsgs(prevState => prevState.map(msg => {
            //   return msg._id === message.message._id ? { ...msg, read: false } : msg;
            // }));
            updateChatState(message.chat);
          }
        }
        
        if (message.message.user.name === recipient) {
          if (screen.current === 'ChatDetail') {
            updateChatState(message.chat);
            // setIncomingMsgs(prevState => GiftedChat.append(prevState, message.message));
            socket.current.emit('join_chat', { username, recipient, messageId: message.message._id });
          } 
        }
      });
     socket.current.on('is_typing', () => {
        navigation.setParams({ isTyping: 'is typing...' });
      });
      socket.current.on('is_not_typing', () => {
        navigation.setParams({ isTyping: '' });
      });
      socket.current.on('message_deleted', data => {
        if (username === data.recipient) {
          let chatId = navigation.getParam('chatId') || chatIdRef.current;
          deleteMessageState({ chatId: chatId, messageId: data.selectedMessage._id });
          setIncomingMsgs(prevState => prevState.map(msg => {
            return msg._id === data.selectedMessage._id ? { ...msg, text: 'Message deleted', deleted: true } : msg;
          }));
        }
      });
      socket.current.on('has_joined_chat', data => {
        let chatType =  chatType || navigation.getParam('type');
        let chatId = navigation.getParam('chatId') || chatIdRef.current;
        let recipient = recipient || navigation.getParam('username');

        if (data.user === recipient) {
          markMessageAsRead({ chatId: chatId });
          setIncomingMsgs(prevState => prevState.map(msg => {
            return msg.read === false ? { ...msg, read: true } : msg;
          }));
        } 
      });
    }
  }, [socketState]);

  useEffect(() => {
    let chatId = navigation.getParam('chatId') || chatIdRef.current;

    if (!chatId) {
      return;
    }

    if (chat[chatId]?.length <= 30) {
      setIncomingMsgs(chat[chatId]);
    } else if (chat[chatId]?.length > 30) {
      if (incomingMsgs.length <= 31) {
        setIncomingMsgs(chat[chatId].slice(0, 30));
      } else if (incomingMsgs.length > 31) {
        setIncomingMsgs(chat[chatId].slice(0, incomingMsgs.length));
      }
    }

  }, [chat]);

  const didFocusHandler = () => {
    if (socket.current) {
      socket.current.emit('join_chat', { username, recipient });
    }
  };

  const willBlurHandler = () => {
    setIncomingMsgs([]);
    setFadeAnim(new Animated.Value(0.01));
    // resetChatState();
  };

  const willFocusHandler = () => {
    setAllMessagesLoaded(false);

    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 50,
        delay: 50
      }
    ).start();

    let recipient = navigation.getParam('username');
    setRecipient(recipient);
    let chatType = navigation.getParam('type');
    setChatType(chatType);
    chatIdRef.current = navigation.getParam('chatId');
    let chatId = chatIdRef.current;
    previousRoute.current = navigation.getParam('origin');

    navigation.setParams({ 
      openModal: openModalHandler,
      openYoutube: openYoutubeHandler,
      isVisibleYou: isVisibleYoutube.current,
      setAsBackgroundYoutube: youtubeBackgroundHandler,
      isBackgroundYou: isBackgroundYoutube.current,
      goBack: previousRoute.current 
    });

    getCurrentScreen(navigation.state.routeName);
    if (Platform.OS === 'ios') {
      setStatusBarColor(2);
    } 

    setCurrentPage(1);
    let page = 1;

    if (!chatId) {
      return;
    }

    if (chat.hasOwnProperty(chatId)) {
      if (chat[chatId].length > 30) {
        // resetChatState(chatId);
        setIncomingMsgs(chat[chatId].slice(0, 30));
        return;
      }
      setIncomingMsgs(chat[chatId]);
      return;
    }

    if (recipient) {
      let chatType = navigation.getParam('type');
      getMessages({ chatType, chatId, username, recipient, page })
        .then((messages) => {
          setIncomingMsgs(messages.slice(0, 30));   
      });
    }
  }

  const openModalHandler = () => {
    setGroupSettingsModal(true);
    setStatusBarColor(1);
  };

  const modalPreviewImageCloseHandler = () => {
    setPreviewImageMode(false);
  };

  const openYoutubeHandler = (params) => {
      isVisibleYoutube.current = !params;
      navigation.setParams({ isVisibleYou: !params });
  };

  const youtubeBackgroundHandler = (val) => {
    isBackgroundYoutube.current = !val;
    navigation.setParams({ isBackgroundYou: !val });
  };

  const isVisibleHandler = (val) => {
    isVisibleYoutube.current = val;
    navigation.setParams({ isVisibleYou: val });
  };

  const closeModalHandler = () => {
    setGroupSettingsModal(false);
  };

  const updateGroupNameHandler = (name) => {
    navigation.setParams({ username: name });
  };

  const scrollToBottom = () => {
    if (giftedChatRef) {
      giftedChatRef.scrollToBottom();
    }
  };

  const sendImage = async (image, caption) => {

    let messageId = uuidv4( { random: await Random.getRandomBytesAsync( 16 ) } );

    const message = {
      _id: messageId,
      text: caption,
      createdAt: new Date(),
      user: {
        _id: 1,
        name: username,
      },
      image: image,
    };

    let chatId = chatId || navigation.getParam('chatId') || chatIdRef.current;

    const msgObj = {
      type: chatType,
      chatId,
      from: username,
      to: recipient,
      message: [message],
      replyTo: {}
    };

    saveMessageImage(msgObj).then(res => {
      if (res.imgPath && res.imgName) {
        msgObj.message[0].imgPath = res.imgPath;
        msgObj.message[0].imgName = res.imgName;
        socket.current.emit('message', msgObj);
      }
    }); 

    setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
  };

  const loadMoreMessages = () => {
    let chatType =  chatType || navigation.getParam('type');
    let chatId = navigation.getParam('chatId') || chatIdRef.current;

    if (incomingMsgs.length < chat[chatId].length) {
      if (chat[chatId].length - incomingMsgs.length < 30) {
        setAllMessagesLoaded(true);
        setIncomingMsgs(prevState => 
          GiftedChat.prepend(
            prevState, 
            chat[chatId].slice(incomingMsgs.length, incomingMsgs.length + (chat[chatId].length - incomingMsgs.length))
          )
        );
        return;
      }
      setIncomingMsgs(prevState => 
        GiftedChat.prepend(
          prevState, 
          chat[chatId].slice(incomingMsgs.length, incomingMsgs.length + 30)
        )
      );
      setIsLoading(false);
    } else if (incomingMsgs.length === chat[chatId].length) {
      setAllMessagesLoaded(true);
    } else {
      setIsLoading(true);
      setCurrentPage(currentPage + 1);
      let page = currentPage + 1;
      getMessages({ chatType, chatId, username, recipient, page })
        .then(messages => {
          if (mounted) {
            if (messages.length < 30) {
              setAllMessagesLoaded(true);
            }
            setIncomingsMsgs(prevState => GiftedChat.prepend(prevState, messages.slice(0, 30)));
            setIsLoading(false);
          }
        }) 
    }
  };

  const sendMessage = async (message) => {

    const msgObj = {
      type: chatType,
      chatId: chatIdRef.current,
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
    } else {
      message[0].reply = null;
      message[0].replyAuthor = null;
    }

    message[0].user.name = username;
    message[0].deleted = false;
    message[0].image = null;

    if (giftedChatRef) {
      giftedChatRef.scrollToBottom();
    }
    
    setIncomingMsgs(prevState => GiftedChat.append(prevState, message));

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

  const renderActions = props => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%', paddingLeft: 6 }}>
        <TouchableOpacity style={{paddingHorizontal: 5}} onPress={takePhotoHandler}>
          <MaterialIcons color="#C8C8C8" name="camera-alt" size={29} />
        </TouchableOpacity>
        <TouchableOpacity style={{paddingHorizontal: 5}} onPress={choosePhotoHandler}>
          <Ionicons color="#C8C8C8" name="md-images" size={29} />
        </TouchableOpacity>
      </View>
    );
  };

  const getCameraPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    if (response.status !== 'granted') {
      Alert.alert('You don\'t have the required permissions to access the camera', [{text: 'Okay'}]);
      return false;
    }
    return true;
  };

  const getImageLibraryPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (response.status !== 'granted') {
      Alert.alert('You don\'t have the required permissions to access the image library', [{text: 'Okay'}]);
      return false;
    }
    return true;
  };

  const takePhotoHandler = async () => {
    const hasCameraPermissions = await getCameraPermissions();
    if (!hasCameraPermissions) {
      return;
    }
    const cameraImage = await ImagePicker.launchCameraAsync({
      allowsEditing: true
    });
    if (!cameraImage.uri) {
      return;
    }

    Image.getSize(cameraImage.uri, (width, height) => {
      const screenWidth = Dimensions.get('window').width;
      const scaleFactor = width / screenWidth;
      const imageHeight = height / scaleFactor;
      setPreviewImageWidth(screenWidth);
      setPreviewImageHeight(imageHeight);
    });
    setPreviewImage(cameraImage.uri);
    setPreviewImageMode(true);

    // saveImage(username, cameraImage.uri);
  };

  const choosePhotoHandler = async () => {
    const hasImageLibraryPermissions = await getImageLibraryPermissions();
    if (!hasImageLibraryPermissions) {
      return;
    }
    const libraryImage = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
    });
    if (!libraryImage.uri) {
      return;
    }

    Image.getSize(libraryImage.uri, (width, height) => {
      const screenWidth = Dimensions.get('window').width;
      const scaleFactor = width / screenWidth;
      const imageHeight = height / scaleFactor;
      setPreviewImageWidth(screenWidth);
      setPreviewImageHeight(imageHeight);
    });
    setPreviewImage(libraryImage.uri);
    setPreviewImageMode(true);

    // saveImage(username, libraryImage.uri);
  };

  const sendImageHandler = () => {
    sendImage(previewImage, previewImageInput);
    setPreviewImageMode(false);
    if (giftedChatRef) {
      giftedChatRef.scrollToBottom();
    }
  };

  const deleteMessageHandler = () => {
    let chatId = navigation.getParam('chatId') || chatIdRef.current;
    // updateMessages({ chatId: message.chat.chatId, message: message.message });
    deleteMessage({ chatId: chatId, messageId: selectedMessage._id })
      .then(res => {
        setIncomingMsgs(prevState => prevState.map(msg => {
          return msg._id === selectedMessage._id ? { ...msg, text: 'Message deleted', deleted: true } : msg;
        }));
        socket.current.emit('delete_message', { selectedMessage, recipient });
      });
    setOverlayMode(false);
  };

  const replyMessageHandler = () => {
    setShowReplyBox(true);
    setOverlayMode(false);
  };

  const onIputFocusHandler = () => {
    setInputFocused(true);
  };

  const onIputBlurHandler = () => {
     setInputFocused(false);
  };

  const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingTop = 80;
    return contentSize.height - layoutMeasurement.height - paddingTop <= contentOffset.y;
  };
 
  const startTypingHandler = (text) => {
    if (text) {
      setMarkSendAsActive(true);
      socket.current.emit('start_typing', { username, recipient });
    } else {
      setMarkSendAsActive(false);
    }

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
      return <MessageReplyBubble { ...props } />;
    }
    if (props.currentMessage.user.name === 'admin') {
      return <AdminBubble { ...props } />;
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
        <View style={{marginRight: 10, marginBottom: 9}}>
          <MaterialIcons name="send" size={26} color={markSendAsActive ? Colors.primary : '#C8C8C8'} />
        </View>
      </Send>
    );
  }

  const AdminBubble = props => {
    return (
      <View style={{ alignSelf: 'center', marginVertical: 8 }}>
          <Text style={{ 
            borderRadius: 10, 
            overflow: 'hidden', 
            backgroundColor: '#A8A8A8', 
            paddingTop: 2,
            paddingBottom: 4,
            paddingHorizontal: 8, 
            color: '#fff' }}>
            {props.currentMessage.text}
          </Text>
      </View>
    );
  };

  const MessageReplyBubble = (props) => {
    if (props.currentMessage.user._id === 1)  {
      return (
        <View style={props.containerStyle}> 
          <View style={{ paddingBottom: 2, marginRight: 32, marginLeft: 74 }}>
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
          {!props.currentMessage.deleted && (
            <View>
              <Ionicons
                style={styles.leftCheckmarkReply}
                name="ios-checkmark"
                size={24} color="#C8C8C8" />
            </View>
          )}
          {props.currentMessage.hasOwnProperty('read') && !props.currentMessage.deleted && (
            <View>
              <Ionicons
                style={styles.leftCheckmarkReply}
                name="ios-checkmark"
                size={24} color="#C8C8C8" />
              <Ionicons
                style={styles.rightCheckmarkReply}
                name="ios-checkmark"
                size={24} color="#C8C8C8" />
            </View>
          )}
          {props.currentMessage.read && !props.currentMessage.deleted && ( 
            <View>
              <Ionicons
                style={styles.leftCheckmarkReply}
                name="ios-checkmark"
                size={24} color="#87CEEB" />
              <Ionicons
                style={styles.rightCheckmarkReply}
                name="ios-checkmark"
                size={24} color="#87CEEB" />
            </View>
          )}
        </View>
      );
    } else if (props.currentMessage.user._id === 2) {
      return (
        <View style={props.containerStyle}> 
          <View style={{
            backgroundColor: Colors.primary, 
            width: 36, 
            height: 36, 
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            left: 8,
            position: 'absolute',
            bottom: 0
          }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>{props.currentMessage.user.name}</Text>
          </View>
          <View style={{ paddingBottom: 2, marginRight: 60, marginLeft: 52 }}>
            <View style={{ borderRadius: 15, backgroundColor: '#E8E8E8' }}>
              <View style={{
                flexDirection: 'row', 
                backgroundColor: '#c2c2c2', 
                padding: 5, 
                alignItems: 'center', 
                borderLeftWidth: 6, 
                borderLeftColor: Colors.tertiary, 
                borderRadius: 8, 
                marginTop: 8, marginHorizontal: 8 }}>
                  <View style={{flexDirection: 'column'}}>
                    <Text style={{color: Colors.tertiary, paddingHorizontal: 10, marginBottom: 4 }}>Reply to <Text style={{ fontFamily: 'open-sans-semi-bold' }}>{props.currentMessage.replyAuthor}</Text></Text>
                    <Text style={{color: 'black', paddingHorizontal: 10 }}>{props.currentMessage.reply}</Text>
                  </View>
              </View>
              <MessageText {...props} />
              <Time {...props} />
            </View>
          </View>
        </View>
      );
    }  
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
        // <View  { ...props}>
        <View>
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
          <View>
          {/*<View  { ...props}>*/}
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
          <View>
          {/*<View  { ...props}>*/}
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

  return (
    <View style={[styles.container, { height: deviceHeight - statusBarHeight - 50 }]}>
      <NavigationEvents
        onWillBlur={willBlurHandler}
        onWillFocus={willFocusHandler}
        onDidFocus={didFocusHandler}
        />
      {isVisibleYoutube.current && (
        <YoutubeComponent
          inputFocused={inputFocused}
          isBackground={isBackgroundYoutube.current}
          isVisible={isVisibleYoutube.current}
          youtubeBackgroundHandler={youtubeBackgroundHandler}
          isVisibleHandler={isVisibleHandler}
        /> 
      )}
           <Modal
              style={{ alignItems: "center", justifyContent: "center" }}
              isVisible={previewImageMode}
              animationIn="fadeIn"
              animationOut="fadeOut"
              animationInTiming={200}
              backdropTransitionOutTiming={0}
              onSwipeComplete={modalPreviewImageCloseHandler}
              swipeThreshold={60}
              swipeDirection={["down","up"]}  
            >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <KeyboardAvoidingView keyboardVerticalOffset={Platform.OS === 'android' ? -80 : null} behavior="padding" style={{flex: 1, justifyContent: 'center'}}>
                <TouchableOpacity style={{ position: 'absolute', zIndex: 2, top: 15, right: 15 }} onPress={modalPreviewImageCloseHandler}>
                  <MaterialIcons name="close" size={34} color="white" />
                </TouchableOpacity>
                <Image
                  style={{
                    width: previewImageWidth, 
                    height: previewImageHeight, 
                    }} 
                  source={{ uri: previewImage }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                  <TextInput
                    style={styles.previewImageInput}
                    placeholder="Add caption"
                    placeholderTextColor='#202020'
                    autoCorrect={false}
                    value={previewImageInput}
                    onChangeText={setPreviewImageInput}
                   />
                  <TouchableOpacity onPress={sendImageHandler}>
                    <View style={{ paddingLeft: 13, paddingRight: 9, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary, height: 36}}>
                      <MaterialIcons name="send" size={26} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
         </Modal>
        <GroupSettingsScreen
          navigation={navigation} 
          visible={groupSettingsModal} 
          closeModal={closeModalHandler} 
          updateGroupName={updateGroupNameHandler}
          />
           {showScrollToBottomBtn && <View style={styles.scrollBottomBtn}>
            <TouchableOpacity onPress={() => scrollToBottom()}>
              <MaterialIcons name="keyboard-arrow-down" size={30} color={Colors.primary} />
            </TouchableOpacity>
          </View>}
          {isLoading && <View style={{ position: 'absolute', top: 40, alignSelf: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>}
          <GiftedChat
              renderUsernameOnMessage 
              messages={incomingMsgs} 
              onSend={sendMessage} 
              user={{ _id: 1 }}
              listViewProps={{
                scrollEventThrottle: 400,
                onScroll: ({ nativeEvent }) => { 
                  if (nativeEvent.contentOffset.y > 170) {
                    setShowScrollToBottomBtn(true);
                  } else {
                    setShowScrollToBottomBtn(false);
                  }
                  if (isCloseToTop(nativeEvent)) {    
                    let chatId = navigation.getParam('chatId') || chatIdRef.current;
                    if (chat[chatId].length > 30 && !allMessagesLoaded) {
                      loadMoreMessages();
                    }
                    
                  }
                }
              }}
              textInputStyle={styles.input}
              // infiniteScroll={true}
              placeholderTextColor="#202020"
              renderBubble={renderBubble}
              renderAvatar={renderAvatar}
              renderLoading={renderLoading}
              ref={ref => giftedChatRef = ref}
              renderSend={renderSend}
              renderActions={renderActions}
              // renderComposer={renderComposer}
              textInputProps={{ ...styles.messageInputContainer, onFocus: onIputFocusHandler, onBlur: onIputBlurHandler }}
              textInputStyle={styles.messageInput}
              renderChatFooter={renderChatFooter}
              renderCustomView={false ? null : renderCustomView}
              isCustomViewBottom={true}
              renderMessage={renderMessage}
              renderMessageText={renderMessageText}
              alwaysShowSend={true}
              keyboardShouldPersistTaps={'handled'}
              // forceGetKeyboardHeight={false}
              onInputTextChanged={startTypingHandler}
              //isLoadingEarlier={true}
              // bottomOffset={ Platform.OS === 'android' ? null : null }
              // isAnimated={false}
              />
         {/*<KeyboardAvoidingView 
            behavior={ Platform.OS === 'android' ? 'padding' :  null}
            keyboardVerticalOffset={95} />
         {/*{Platform.OS === 'android' ? <KeyboardSpacer /> : null } */}
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
                  {selectedMessage && selectedMessage.user._id === 1 && (
                    <TouchableOpacity style={styles.overlayItemWrapper} onPress={deleteMessageHandler}>
                      <View style={styles.overlayItem}>
                        <View style={styles.deleteIconWrapper}>
                          <AntDesign color="white" name="delete" size={24} />
                        </View>
                        <BodyText style={styles.overlayDelete}>Delete message</BodyText>
                      </View>  
                    </TouchableOpacity>
                  )}
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
      <TouchableOpacity onPress={() => navigation.navigate(params.goBack)}>
        <Ionicons
          name="ios-arrow-back" 
          size={34} 
          color={Colors.primary} 
          style={{ paddingHorizontal: 10,  paddingTop: 5, marginLeft: 8 }} />
      </TouchableOpacity>
    ), 
    headerRight: (
      <View style={{flexDirection: 'row', paddingRight: 10}}>  
        {params.isBackgroundYou && <TouchableOpacity onPress={() => params.setAsBackgroundYoutube(params.isBackgroundYou)}>
          <MaterialCommunityIcons name="flip-to-back" style={{ paddingHorizontal: 8, paddingTop: 3}} size={30} color={Colors.tertiary} />
        </TouchableOpacity>}
        <TouchableOpacity onPress={() => params.openYoutube(params.isVisibleYou)}>
          <FontAwesome name="youtube" size={32} style={{ paddingRight: 6, paddingTop: 1}} color={params.isVisibleYou ? Colors.tertiary : "#D0D0D0"} />
        </TouchableOpacity>
       {params.type === 'group' && (
         <TouchableOpacity onPress={() => params.openModal()}>
          <MaterialIcons
            name="settings" 
            size={28} 
            color="#D0D0D0"
            style={{ paddingLeft: 2, paddingTop: 3 }} />
        </TouchableOpacity>)}
      </View>
    ),
    headerBackground: (
      <View style={{
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        paddingLeft: 45,
        paddingTop: 20 }}>
        <FadeViewAnim style={{ overflow: 'hidden',  backgroundColor: '#F0F0F0', width: 40, height: 40, borderRadius: 20 }}>
          {params.image ? (
            <Image source={{ uri: params.image }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Image
              style={{ width: '100%', height: '100%' }} 
              source={params.type === 'private' ? require('../../assets/avatar-small.png') : require('../../assets/group-small.png')} />
          )}
        </FadeViewAnim>
        <HeadingText
          numberOfLines={1}
          style={{ 
            marginLeft: 10, 
            maxWidth: '60%', 
            fontFamily: 'open-sans-semi-bold', 
            fontSize: 17,
            color: '#202020' }}>
          {params.username} {params.isTyping ? params.isTyping : ''}
        </HeadingText>
      </View>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    flex: Platform.OS === 'android' ? 1 : null
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
  scrollBottomBtn: {
    position: 'absolute',
    opacity: 0.75,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    zIndex: 2,
    bottom: 74,
    right: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2
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
  leftCheckmarkReply: {
    position: 'absolute', 
    right: 17, 
    bottom: -2
  },
  rightCheckmarkReply: {
    position: 'absolute', 
    right: 7, 
    bottom: -2
  },
  header: {
    width: '100%',
    height: 50,
  },
  previewImageInput: {
    backgroundColor: "#fff",
    color: "#202020",
    paddingHorizontal: 15,
    height: 36,
    fontSize: 17,
    fontFamily: "open-sans",
    flex: 1
  },
  messageInputContainer: {
    height: 32,
    marginTop: 4,
    alignSelf: 'center',
    marginRight: 13
  },
  messageInput: {
    paddingTop: Platform.OS === 'ios' ? 9 : 0,
    paddingLeft: 10,
    backgroundColor: '#E8E8E8',
    borderRadius: 18
  }
});

export default ChatDetailScreen;