import React, { useEffect, useState, useMemo, useRef, useContext } from 'react';
import { 
  View, 
  ScrollView,
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  RefreshControl, 
  ActivityIndicator,
  StatusBar,
  Image,
  PanResponder,
  Animated,
  Easing,
  AppState,
  AsyncStorage,
  Dimensions,
  Vibration
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Entypo, AntDesign, Octicons } from '@expo/vector-icons';
import { Badge } from 'react-native-elements';
import { formatDate } from '../helpers/formatDate';
import { SwipeListView } from 'react-native-swipe-list-view';;
import Modal from "react-native-modal";
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { NavigationEvents } from 'react-navigation';

import chatApi from '../api/chat';
import { connectToSocket } from '../socket/chat';
import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import { Context as ContactsContext } from '../context/ContactsContext';
import { Context as GroupsContext } from '../context/GroupsContext';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import ScaleImageAnim from '../components/animations/ScaleImageAnim';
import ScaleViewAnim from '../components/animations/ScaleViewTriggerAnim';
import TranslateFadeViewAnim from '../components/animations/TranslateFadeViewAnim';
import AddGroupScreen from './AddGroupScreen';

const ChatsListScreen = ({ navigation }) => {
  const {
    state: { username, socketState, statusBarColor },
    updateSocketState, 
    setStatusBarColor 
  } = useContext(AuthContext);
  const { 
    state: { previousChats, currentScreen },
    getChats, 
    deleteChat,
    toggleMuteChat,
    markMessagesAsRead,
    saveExpoToken,
    resetBadgeCount,
    updateMessages,
    updateChatState,
    addNewChat,
    getCurrentScreen,
    updateGroup
  } = useContext(ChatContext);
  const { state: { onlineContacts }, getActiveStatus, userIsOffline } = useContext(ContactsContext);
  const { getCurrentGroupId } = useContext(GroupsContext);
  const [modalVisible, setModalVisible] = useState(false);
  const socket = useRef(null);
  const openRowRefs = [];
  const [isTyping, setIsTyping] = useState(false);
  const screen = useRef(null);
  const notificationState = useRef(null);
  const [typingUser, setTypingUser] = useState(null);
  const [newGroupMode, setNewGroupMode] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;
  const rowTranslateAnimatedValues = useRef({}).current;
  // const rowTranslateAnimatedHeightValues = useRef({}).current;
  const rowOpenValue = useRef(0);
  const isRowOpen = useRef(false);
  const screenWidth = Math.round(Dimensions.get('window').width);
  // const panResponder = React.useMemo(() => PanResponder.create({
  //     onStartShouldSetPanResponder: (evt, gestureState) => true,
  //     onMoveShouldSetResponderCapture: () => true,
  //     onMoveShouldSetPanResponderCapture: () => true,
  //     onPanResponderGrant: (e, gestureState) => {
  //       position.setOffset({ x: position.x._value, y: position.y._value });
  //       position.setValue({x: 0, y: 0});
  //     },
  //     onPanResponderStart: (e, gestureState) => {
      
  //     },
  //     onPanResponderMove: (evt, gestureState) => {
  //       position.setValue({x: gestureState.dx, y: gestureState.dy});
  //     },
  //     onPanResponderRelease: (evt, gestureState) => {
  //       // console.log(gestureState);
  //       // if (gestureState.dx < screenWidth / 2 - 50) {
  //       //   position.setValue({ x: 0, y: gestureState.dy });
        
  //       // } else {
  //       //   position.setValue({ x: (screenWidth - 100), y: gestureState.dy });
  //       // }
  //       position.flattenOffset();
  //     },
  //   }), []);
  useEffect(() => {

    registerForPushNotificationsAsync();
    getChats({ username }).then(res => {
      setIsLoading(false);
    });
    _handleAppStateChange();
    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    }  
  }, []);

  useEffect(() => {
    screen.current = currentScreen;
  }, [currentScreen]);

  const checkAuth = async () => {
    let data = await AsyncStorage.getItem('data');
    
    if (data) {
      data = JSON.parse(data);
      if (data.username) {
        socket.current = connectToSocket(data.username);
        updateSocketState(socket.current);
        if (Platform.OS === 'ios') {
          await Notifications.setBadgeNumberAsync(0);
        }
        if (Platform.OS === 'android') {
          await Notifications.dismissAllNotificationsAsync();
        }
        resetBadgeCount(username);
      }
    }   
  };

  const _handleAppStateChange = async nextAppState => { 
    if ((nextAppState === undefined && AppState.currentState === 'active') || nextAppState === 'active') {
      checkAuth();
    }

    if (nextAppState === 'inactive' || nextAppState === 'background') {
      if (socket.current) {
        socket.current.removeAllListeners();
        socket.current.disconnect();
        updateSocketState(null);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    if (socketState) {
      socket.current = socketState;  
      socket.current.on('online', users => {
        getActiveStatus(users);
      });
      socket.current.on('offline', user => {
        userIsOffline(user);
      });

      socket.current.on('message', message => {
        // if (navigation.getParam('image')) {
        //   message.chat = {
        //     profile: {
        //       imgPath: navigation.getParam('image')
        //     }
        //   }
        // }    
        if (mounted) {
          if (username !== message.message.user.name && screen.current !== 'ChatDetail') {
            updateChatState({ chat: message.chat, updateUnreadMessageCount: true });
            // updateMessages({ user: message.message.user.name, message: message.message });
          }       
        }
      });

      socket.current.on('is_typing', username => {
        setIsTyping(true);
        setTypingUser(username);
      });

      socket.current.on('is_not_typing', () => {
        setIsTyping(false);
        setTypingUser(null);
      });

      socket.current.on('new_group', () => {
        getChats({ username });
      });

      socket.current.on('group_name_updated', (data) => {
        if (username !== data.editor) {
          updateMessages({ chatId: data.group._id, message: data.adminMessage });
          let unreadMessageCount;
          if (screen.current !== 'ChatDetail') {
            unreadMessageCount = true;
          }
          updateGroup(data.group, 'name', data.adminMessage, unreadMessageCount);
        }
      });

      socket.current.on('group_image_updated', (data) => {
        if (username !== data.editor) {
          updateMessages({ chatId: data.group._id, message: data.adminMessage });
          let unreadMessageCount;
          if (screen.current !== 'ChatDetail') {
            unreadMessageCount = true;
          }
          updateGroup(data.group, 'image', data.adminMessage, unreadMessageCount);
        }
      });

       socket.current.on('group_members_added', (data) => {
        if (username !== data.editor) {
          updateMessages({ chatId: data.group._id, message: data.adminMessage });
          let unreadMessageCount;
          if (screen.current !== 'ChatDetail') {
            unreadMessageCount = true;
          }
          updateGroup(data.group, 'image', data.adminMessage, unreadMessageCount);
        }
      });

       socket.current.on('user_left_group', (data) => {
        if (username !== data.editor) {
          updateMessages({ chatId: data.group._id, message: data.adminMessage });
          let unreadMessageCount;
          if (screen.current !== 'ChatDetail') {
            unreadMessageCount = true;
          }
          updateGroup(data.group, 'leave', data.adminMessage, unreadMessageCount);
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, [socketState])

  useEffect(() => {
    // if (Object.entries(rowTranslateAnimatedValues).length === 0 && 
    //     rowTranslateAnimatedValues.constructor === Object) {
    // if (previousChats.length > 0) {
    if (Object.keys(rowTranslateAnimatedValues).length !== previousChats.length) {
      previousChats.forEach((item, index) => {
        rowTranslateAnimatedValues[`${index}`] = { left: new Animated.Value(0), right: new Animated.Value(0) };
      });
    }
      // previousChats.forEach((item, index) => {
      //   rowTranslateAnimatedHeightValues[`${index}`] = new Animated.Value(1);
      // });
    // }
  }, [previousChats]);

  const registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      let expoToken = await Notifications.getExpoPushTokenAsync();

      if (Platform.OS === 'android') {
        Notifications.createChannelAndroidAsync('default', {
          name: 'default',
          sound: true,
          priority: 'max',
          vibrate: [0, 250, 250, 250],
        });
      }

      saveExpoToken(expoToken, username);

      const notificationSubscription = Notifications.addListener(handleNotification);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  };

  const handleNotification = async (notification) => {
    let { origin, data } = notification;

    // if (Platform.OS === 'android') {
    //   await  Notifications.dismissNotificationAsync(notification.notificationId);
    // }
    if (notification.data.chatId) {
      notificationState.current = notification;
    }

    if (origin === 'selected') {
      markMessagesAsRead({ username, recipient: notificationState.current.data.sender });
      if (notificationState.current.data.type === 'group') {
        getCurrentGroupId(notificationState.current.data.chatId);
      }

      navigation.navigate('ChatDetail', {
        username: notificationState.current.data.sender,
        image: notificationState.current.data.img,
        type: notificationState.current.data.type,
        chatId: notificationState.current.data.chatId,
        origin: 'ChatsList'
      });
    }

    if (Platform.OS === 'ios' && !notification.remote && origin === 'received') {
      markMessagesAsRead({ username, recipient: notificationState.current.data.sender });
      if (notificationState.current.data.type === 'group') {
        getCurrentGroupId(notificationState.current.data.chatId);
      }

      navigation.navigate('ChatDetail', {
        username: notificationState.current.data.sender,
        image: notificationState.current.data.img,
        type: notificationState.current.data.type,
        chatId: notificationState.current.data.chatId,
        origin: 'ChatsList'
      });
    }

    if (notification.remote && screen.current !== 'ChatDetail') {
      
      Vibration.vibrate();                                                  
      const notificationId = Notifications.presentLocalNotificationAsync({      
        title: data.sender,  
        body: data.message,                                             
        ios: { _displayInForeground: true }                          
      });                                                                   
    } 

    if (origin === 'received' && AppState.currentState === 'active') {

      if (Platform.OS === 'ios') {
        await Notifications.setBadgeNumberAsync(0);
      }
      if (Platform.OS === 'android') {
        await Notifications.dismissAllNotificationsAsync();
      }
      resetBadgeCount(username); 
    }  

  }

  const willFocusHandler = () => {
    setStatusBarColor(1);

    getCurrentScreen(navigation.state.routeName);
  }

  const didFocusHandler = () => {
    if (socketState) {
      socket.current = socketState;  
      socket.current.on('online', users => {
        getActiveStatus(users);
      });
      socket.current.on('offline', user => {
        userIsOffline(user);
      });
      // socket.current.on('message', message => {
      //   if (username !== message.message.user.name && screen.current !== 'ChatDetail') {
      //     console.log('update message count will focus')
      //     updateChatState({ chat: message.chat, updateUnreadMessageCount: true });
      //     updateMessages({ chatId: message.message.chatId, message: message.message });
      //   }       
      // });
      socket.current.on('is_typing', username => {
        setIsTyping(true);
        setTypingUser(username);
      });
      socket.current.on('is_not_typing', () => {
        setIsTyping(false);
        setTypingUser(null);
      });
      socket.current.on('new_group', () => {
        getChats({ username });
      });
    }
  };

  const closeModal = () => {
    setNewGroupMode(false);
  };

  const renderActivityIndicator = () => {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
       </View>
    );
  };

  const closeAllOpenRows = () => {
    openRowRefs.forEach(ref => {
      ref.closeRow && ref.closeRow();
    });
  };

  const modalCloseHandler = () => {
    setModalVisible(false);
  };

  const onRowOpen = (rowKey, rowMap, toValue) => {
    const listItem = previousChats[rowKey];
    // if (rowOpenValue.current < -200 && isRowOpen) {
    //    deleteRow(rowKey, rowMap, listItem);
    // }
    // if (rowOpenValue.current > 200 && isRowOpen) {
    //   muteChatHandler(rowKey, rowMap, listItem);
    // }
  };

  const onSwipeValueChange = (swipeData) => {
    const { key, value, isOpen } = swipeData;

    // let animationIsRunning;

    // if (
    //     value < -Dimensions.get('window').width / 3 && !animationIsRunning
    // ) {
    //     animationIsRunning = true;
    //     Animated.timing(rowTranslateAnimatedHeightValues[key], {
    //         toValue: 0,
    //         duration: 200,
    //     }).start(() => {
    //       console.log('deleted')
    //         // const newData = [...previousChats];
    //         // const prevIndex = previousChats.findIndex(item => item.key === key);
    //         // newData.splice(prevIndex, 1);
    //         // setListData(newData);
    //         // // this.animationIsRunning = false;
    //     });
    // }



    rowOpenValue.current = value;
    isRowOpen.current = false;

    if (value > 200) {
      Animated.timing(
        rowTranslateAnimatedValues[key].left,
        {
          toValue: value,
          duration: 50,
          easing: Easing.inOut(Easing.ease)
        },
      ).start();
      isRowOpen.current = true;
    } else if (value > 0) {
      rowTranslateAnimatedValues[key].left.setValue(value);
    } else if (value < -200) {
       Animated.timing(
        rowTranslateAnimatedValues[key].right,
        {
          toValue: Math.abs(value),
          duration: 50,
          easing: Easing.inOut(Easing.ease)
        },
      ).start();
       isRowOpen.current = true;
    } else if (value < 0) {
      rowTranslateAnimatedValues[key].right.setValue(Math.abs(value));
    } 

    // if (Math.abs(value) > 200 && isOpen) {
    //   onRowOpen();
    // }
  };

  const closeRow = (index, rowMap) => {
    if (rowMap[index]) {
      rowMap[index].closeRow();
    }
  };

  const deleteRow = (rowKey, rowMap, selectedChat) => {
    openRowRefs.push(rowMap[rowKey]);
    setSelectedChat(selectedChat);
    setModalVisible(true);
    // closeRow(rowMap, index);
    // const newData = previousChats.filter(
    //   item => item !== previousChats[index]
    // );
  };

  const deleteChatHandler = () => {
    setIsLoading(true);
    deleteChat(username, selectedChat.chatId, selectedChat.type).then(res => {
      setIsLoading(false);
      setModalVisible(false);
      closeAllOpenRows();
    });
  };

  const muteChatHandler = (rowKey, rowMap, selectedChat) => {
    openRowRefs.push(rowMap[rowKey]);
    toggleMuteChat(username, selectedChat.chatId, selectedChat.type, selectedChat.muted)
      .then(res => {
        // setPinAnimate(true);
        closeAllOpenRows();
      });
  };

  const renderLastMessageText = (item) => {
    if (isTyping && typingUser == item.contact) {
      return 'is typing...';
    } else if (item.groupOwner && item.groupOwner === username) {
      return item.text.replace(username, 'You');
    } else if (!item.text) {
        if (item.from === username) {
          return 'You sent a photo'; 
        } else {
          return `${item.from} sent a photo`; 
        }  
    } else {
      return item.text
    }
  };

  const renderChatsList = () => {
    return (
      <SwipeListView
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              // for (let val in rowTranslateAnimatedValues) delete rowTranslateAnimatedValues[val];
              getChats({ username })
            }}
            refreshing={isLoading}
            tintColor={Colors.primary} />
        }
        data={previousChats}
        keyExtractor={(data, index) => index.toString()}
        renderItem={ (rowData, rowMap) => {
          return (
            <TouchableWithoutFeedback
              onPress={() => {
                markMessagesAsRead({ username, recipient: rowData.item.contact });
                if (rowData.item.type === 'group') {
                  getCurrentGroupId(rowData.item.chatId);
                }
                navigation.navigate('ChatDetail', {
                  username: rowData.item.contact,
                  image: rowData.item.profile ? rowData.item.profile.imgPath : '',
                  type: rowData.item.type,
                  chatId: rowData.item.chatId,
                  origin: 'ChatsList'
                });
            }}>
            <View>
              <View style={{
               flexDirection: 'row', 
               alignItems: 'center', 
               paddingHorizontal: 10, 
               paddingVertical: 5,
               backgroundColor: '#fff' }}>
                <View style={{ overflow: 'hidden', width: 56, height: 56, borderRadius: 4, backgroundColor: '#F0F0F0' }}>
                  { rowData.item.profile && rowData.item.profile.imgPath ? (
                    <Image source={{ uri: rowData.item.profile.imgPath }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Image
                      source={rowData.item.type === 'private' ? require('../../assets/avatar-small.png') : require('../../assets/group-small.png') } 
                      style={{ width: '100%', height: '100%' }} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 10, height: 70, justifyContent: 'center' }}>
                  <View style={styles.itemContainer}>
                    <HeadingText numberOfLines={1} style={rowData.item.groupOwner ? styles.groupName : styles.name}>{rowData.item.contact}</HeadingText>
                    <View style={{ flexDirection: 'row', alignItems: 'center'}}>  
                      <BodyText style={styles.date}>{formatDate(rowData.item.date)}</BodyText>
                      {rowData.item.muted && (
                        <View>
                          <Octicons style={{marginLeft: 5}} name="mute" size={20} color='lightgrey' />
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.itemContainer}>
                    <BodyText
                      numberOfLines={2}
                      ellipsize="tail"
                      style={rowData.item.unreadMessageCount > 0 ? styles.unreadMessage : styles.text}>
                      {renderLastMessageText(rowData.item)}
                    </BodyText>
                    {rowData.item.unreadMessageCount !== 0 && (
                      <View style={styles.unreadBadge}>
                        <HeadingText style={styles.unreadBadgeText}>{rowData.item.unreadMessageCount > 99 ? '99+' : rowData.item.unreadMessageCount }</HeadingText>
                      </View>
                    )}
                  </View>
                </View>
                 <View style={{
                  position: 'absolute',
                  bottom: 0,
                   marginHorizontal: 10, 
                   width: '100%',
                   height: 1,
                   backgroundColor: '#F0F0F0'}}>
                  </View>
              </View>
              {onlineContacts.includes(rowData.item.contact) && (
                <Badge
                  badgeStyle={styles.badge}
                  containerStyle={styles.badgeContainer}
                />
              )}  
              </View>
            </TouchableWithoutFeedback>
        )}}
        renderHiddenItem={ (data, rowMap) => {
         return (
            <View style={styles.rowBack}>
              <View style={{
                backgroundColor: data.item.muted ? Colors.secondary : 'grey', 
                width: '50%', 
                height: '100%',
                justifyContent: 'center'
              }}>
               <TouchableOpacity style={{ }} onPress={() => muteChatHandler(data.index, rowMap, data.item)}>
                  <Animated.View style={{
                    width: 54,
                    height: 54,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [
                      { translateX: rowTranslateAnimatedValues[`${data.index}`] ? (rowTranslateAnimatedValues[`${data.index}`].left.interpolate({
                        inputRange: [0, 25, 50, 75, 100, 150, 200, screenWidth / 2 + 70],
                        outputRange: [-20, -10, 0, 8.5, 19, 27, 29, screenWidth / 2 + 70],
                        extrapolate: 'clamp'
                      })) : (new Animated.Value(0)) 
                      }
                    ] }}>
                    {data.item.muted ? 
                      <Octicons name="unmute" size={28} color='#fff' />:
                      <Octicons name="mute" size={28} color='#fff' />}
                    {data.item.muted ? 
                      <HeadingText style={{ flex: 1, color: '#fff', fontSize: 14 }}>Unmute</HeadingText> :
                      <HeadingText style={{ flex: 1, color: '#fff', fontSize: 14 }}>Mute</HeadingText>}
                  </Animated.View>
                </TouchableOpacity>
              </View>
              <View style={{
                backgroundColor: Colors.tertiary, 
                width: '50%', 
                height: '100%',
                justifyContent: 'center',
                alignItems: 'flex-end'
              }}>
              <TouchableOpacity style={{ }} onPress={() => {deleteRow(data.index, rowMap, data.item)}}>
                <Animated.View style={{
                  width: 54,
                  height: 54,
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [
                    { translateX: rowTranslateAnimatedValues[`${data.index}`] ? (rowTranslateAnimatedValues[`${data.index}`].right.interpolate({
                        inputRange: [0, 25, 50, 75, 100, 150, 200, screenWidth / 2 + 70],
                        outputRange: [20, 10, 0, -8.5, -19, -27, -29, -screenWidth / 2 - 60],
                        extrapolate: 'clamp'
                    })) : (new Animated.Value(0)) 
                    }
                  ] }}>
                    <Entypo name="trash" size={24} color="#fff" />
                    <HeadingText style={{ flex: 1, color: '#fff', fontSize: 14 }}>Delete</HeadingText>
                </Animated.View>
              </TouchableOpacity>
              </View>
            </View>
        )}}
        leftOpenValue={66}
        rightOpenValue={-66}
        stopLeftSwipe={screenWidth / 2}
        stopRightSwipe={-screenWidth / 2}
        onSwipeValueChange={onSwipeValueChange}
        onRowOpen={onRowOpen}
        tension={30}  
        // recalculateHiddenLayout={true}
        />
    );
  };

  const renderStarterView = () => {
    return (
      <View style={styles.imageContainer}>
        <ScaleImageAnim style={styles.image} source={require('../../assets/icons_256_chat.png')} />
        <TranslateFadeViewAnim>
          <BodyText style={styles.imageCaption}>Stay in touch with your loved ones</BodyText>
        </TranslateFadeViewAnim>
      </View>
    );
  };

  return (
    <View style={styles.container}>
     <StatusBar barStyle={statusBarColor === 1 ? 'light-content' : 'dark-content'} />
     <NavigationEvents onDidFocus={didFocusHandler} onWillFocus={willFocusHandler} />
      <Modal
        style={{ alignItems: "center", justifyContent: "center" }}
        isVisible={modalVisible}
        onBackdropPress={modalCloseHandler}
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationInTiming={200}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.overlayContainer}>
          <View style={{borderBottomColor: 'lightgrey', borderBottomWidth: 1, paddingBottom: 6 }}>
            <BodyText 
            style={styles.overlayText}>Are you sure you want to delete this chat?</BodyText>
          </View>
          <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-end', 
              alignItems: 'center', 
              marginTop: 15}}>
            <TouchableOpacity  onPress={modalCloseHandler}>
              <BodyText style={styles.overlayText}>Cancel</BodyText>
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteChatHandler}>
              <View style={styles.overlayItem}>
                <BodyText style={styles.overlayDeleteText}>Delete</BodyText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    <AddGroupScreen visible={newGroupMode} closeModal={closeModal} />
    {/*} <Animated.View
            {...panResponder.panHandlers}
            style={[
              {transform: position.getTranslateTransform()},
              styles.appStyles,
            ]}>
        </Animated.View> */}
      <View style={styles.background} />
      <View style={styles.headerContainer}>
        <HeadingText style={styles.header}>My Chats</HeadingText>
        <TouchableOpacity onPress={() => setNewGroupMode(true)}>
          <MaterialIcons style={{ marginBottom: 10 }} name="group-add" size={38} color="#fff" />
        </TouchableOpacity>   
      </View>

      {isLoading ?
        renderActivityIndicator() :
        previousChats.length > 0 ?
          renderChatsList() :
          renderStarterView()
      } 
    </View>
  );
};

ChatsListScreen.navigationOptions = {
  header: null
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    // paddingHorizontal: 20
  },
  appStyles: {
    backgroundColor: Colors.primary,
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    zIndex: 2
  },
  background: {
    width: '100%',
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 0,
    left: 0,
    height: 80
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 15
  },
  header: {
    fontSize: 22,
    paddingBottom: 30,
    marginTop: 15,
    paddingLeft: 20,
    color: '#fff'
  },
  name: {
    fontSize: 17,
    color: Colors.primary,
    maxWidth: '55%'
  },
  groupName: {
    fontSize: 17,
    color: Colors.secondary,
    maxWidth: '55%'
  },
  text: {
    color: 'grey',
    maxWidth: '90%',
    fontSize: 15
  },
  date: {
    color: 'grey'
  },
  unreadMessage: {
    fontFamily: 'open-sans-semi-bold',
    maxWidth: '90%',
    fontSize: 15
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'grey',
  },
  divider: {
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 2
  },
  spinnerContainer: {
    padding: 40
  },
  badgeContainer: {
    position: 'absolute', 
    top: 15, 
    left: 9
  },
  unreadBadge: {
    backgroundColor: Colors.tertiary,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 100,
    height: 100
  },
  imageCaption: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10
  },
  badge: {
    backgroundColor: '#32CD32', 
    width: 16, 
    height: 16, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: 'white',
    position: 'absolute', 
    top: 42, 
    left: 46
  },
  unreadBadge: {
    backgroundColor: Colors.tertiary,
    borderRadius: 10,
    paddingHorizontal: 5.5,
  },
  unreadBadgeText: {
    color: '#fff'
  },
   rowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    justifyContent: 'center',
    height: 50,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayContainer: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 4,
    width: '90%',
    maxWidth: 400
  },
  overlayText: {
    fontSize: 16
  },
  overlayDeleteText: {
    fontSize: 16,
    color: '#fff'
  },
  overlayItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.tertiary,
    borderRadius: 4,
    marginLeft: 20
  }
});

export default ChatsListScreen;