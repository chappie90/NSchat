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
  Animated
} from 'react-native';
import { MaterialIcons, Entypo, AntDesign } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';
import { Badge } from 'react-native-elements';
import { formatDate } from '../helpers/formatDate';
import { SwipeListView } from 'react-native-swipe-list-view';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import { Context as ContactsContext } from '../context/ContactsContext';
import { Context as GroupsContext } from '../context/GroupsContext';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import { connectToSocket } from '../socket/chat';
import ScaleImageAnim from '../components/animations/ScaleImageAnim';
import TranslateFadeViewAnim from '../components/animations/TranslateFadeViewAnim';
import AddGroupScreen from './AddGroupScreen';

const ChatsListScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { 
    state: { previousChats },
    getChats, 
    markMessagesAsRead } = useContext(ChatContext);
  const { state: { onlineContacts }, getActiveStatus } = useContext(ContactsContext);
   const { getCurrentGroupId } = useContext(GroupsContext);
  const socket = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [newGroupMode, setNewGroupMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;
  const panResponder = React.useMemo(() => PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e, gestureState) => {
        position.setOffset({ x: position.x._value, y: position.y._value });
        position.setValue({x: 0, y: 0});
      },
      onPanResponderStart: (e, gestureState) => {
      
      },
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({x: gestureState.dx, y: gestureState.dy});
      },
      onPanResponderRelease: (evt, gestureState) => {
        position.flattenOffset();
      },
    }), []);


  useEffect(() => {
    getChats({ username }).then(res => {
      setIsLoading(false);
    });
    socket.current = connectToSocket(username);   
    socket.current.on('online', users => {
      const onlineUsers = JSON.parse(users);
      if (Array.isArray(onlineUsers)) {
        getActiveStatus(onlineUsers);
      } else {
        // refactor to get new array - concat?
        onlineContacts.push(users);
        getActiveStatus(onlineContacts);
      }
    });
    socket.current.on('offline', user => {
      const updatedContacts = onlineContacts.filter(item => item !== user);
      getActiveStatus(updatedContacts);
    });
    socket.current.on('message', message => {
      getChats({ username });
    });
    socket.current.on('is_typing', username => {
      setIsTyping(true);
      setTypingUser(username);
    });
    socket.current.on('is_not_typing', () => {
      setIsTyping(false);
      setTypingUser(null);
    });
  }, []);

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

  const renderLastMessageText = (item) => {
    if (isTyping && typingUser == item.contact) {
      return 'is typing...';
    } else if (item.groupOwner && item.groupOwner === username) {
      return item.text.replace(username, 'You');
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
                if (rowData.item.groupId) {
                  getCurrentGroupId(rowData.item.groupId);
                }
                navigation.navigate('ChatDetail', {
                  username: rowData.item.contact,
                  image: rowData.item.profile ? rowData.item.profile.imgPath : ''
                });
            }}>
            <View>
              <View style={{
               flexDirection: 'row', 
               alignItems: 'flex-start', 
               paddingHorizontal: 10, 
               paddingVertical: 5,
               backgroundColor: '#fff' }}>
                <View style={{ overflow: 'hidden', width: 52, height: 52, borderRadius: 4 }}>
                  { rowData.item.profile.imgPath ? (
                    <Image source={{ uri: rowData.item.profile.imgPath }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Image source={require('../../assets/avatar2.png')} style={{ width: '100%', height: '100%' }} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 10, height: 70 }}>
                  <View style={styles.itemContainer}>
                    <HeadingText numberOfLines={1} style={rowData.item.groupOwner ? styles.groupName : styles.name}>{rowData.item.contact}</HeadingText>
                    <BodyText style={styles.date}>{formatDate(rowData.item.date)}</BodyText>
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
        renderHiddenItem={ (rowData, rowMap) => (
            <View style={styles.rowBack}>
             <TouchableOpacity style={{ }} onPress={() => {}}>
                <View style={{
                  backgroundColor: Colors.secondary,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  marginHorizontal: 10,
                  alignItems: 'center',
                  justifyContent: 'center' }}>
                    <AntDesign name="pushpin" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ }} onPress={() => {}}>
                <View style={{
                  backgroundColor: Colors.tertiary,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  marginHorizontal: 10,
                  alignItems: 'center',
                  justifyContent: 'center' }}>
                    <Entypo name="trash" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
        )}
        leftOpenValue={65}
        rightOpenValue={-65}
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
    <StatusBar backgroundColor="blue" barStyle="light-content" />
    <AddGroupScreen visible={newGroupMode} closeModal={closeModal} />
     <Animated.View
            {...panResponder.panHandlers}
            style={[
              {transform: position.getTranslateTransform()},
              styles.appStyles,
            ]}>
        </Animated.View>
      <View style={styles.background} />
      <View style={styles.headerContainer}>
        <HeadingText style={styles.header}>My Chats</HeadingText>
        <TouchableOpacity onPress={() => setNewGroupMode(true)}>
          <MaterialIcons style={{ marginBottom: 10 }} name="group" size={36} color="#fff" />
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
  badge: {
    backgroundColor: '#32CD32', 
    width: 15, 
    height: 15, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: 'white'
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
    width: 15, 
    height: 15, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: 'white',
    position: 'absolute', 
    top: 32, 
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
});

export default ChatsListScreen;