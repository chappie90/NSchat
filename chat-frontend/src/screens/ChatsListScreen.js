import React, { useEffect, useState, useRef, useContext } from 'react';
import { 
  View, 
  ScrollView,
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  RefreshControl, 
  ActivityIndicator,
  StatusBar,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';
import { Badge } from 'react-native-elements';
import { formatDate } from '../helpers/formatDate';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import { Context as ContactsContext } from '../context/ContactsContext';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import { connectToSocket } from '../socket/chat';
import ScaleImageAnim from '../components/animations/ScaleImageAnim';
import TranslateFadeViewAnim from '../components/animations/TranslateFadeViewAnim';
import AddGroupScreen from './AddGroupScreen';

const ChatsListScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { 
    state: { previousChats, chatsIsLoading },
    getChats, 
    markMessagesAsRead } = useContext(ChatContext);
  const { state: { onlineContacts }, getActiveStatus } = useContext(ContactsContext);
  const socket = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [newGroupMode, setNewGroupMode] = useState(false);

  useEffect(() => {
    getChats({ username });
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

  const renderChatsList = () => {
    return (
      <FlatList
        refreshControl={
          <RefreshControl
            onRefresh={() => getChats({ username })}
            refreshing={chatsIsLoading}
            tintColor={Colors.primary} />
        }
        data={previousChats}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity onPress={() => {
              markMessagesAsRead({ username, recipient: item.contact });
              navigation.navigate('ChatDetail', {
                username: item.contact,
                image: item.profile ? item.profile.imgPath : ''
              });
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 10, paddingVertical: 5 }}>
                <View style={{ overflow: 'hidden', width: 52, height: 52, borderRadius: 4 }}>
                  { item.profile.imgPath ? (
                    <Image source={{ uri: item.profile.imgPath }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Image source={require('../../assets/avatar2.png')} style={{ width: '100%', height: '100%' }} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 10, height: 70 }}>
                  <View style={styles.itemContainer}>
                    <HeadingText numberOfLines={1} style={styles.name}>{item.contact}</HeadingText>
                    <BodyText style={styles.date}>{formatDate(item.date)}</BodyText>
                  </View>
                  <View style={styles.itemContainer}>
                    <BodyText
                      numberOfLines={2}
                      ellipsize="tail"
                      style={item.unreadMessageCount > 0 ? styles.unreadMessage : styles.text}>
                      {isTyping && typingUser == item.contact ? 'is typing...' : item.text}
                    </BodyText>
                    {item.unreadMessageCount !== 0 && (
                      <View style={styles.unreadBadge}>
                        <HeadingText style={styles.unreadBadgeText}>{item.unreadMessageCount > 99 ? '99+' : item.unreadMessageCount }</HeadingText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              {onlineContacts.includes(item.contact) && (
                <Badge
                  badgeStyle={styles.badge}
                  containerStyle={styles.badgeContainer}
                />
              )}  
            </TouchableOpacity>
          );
      }} />
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
      <View style={styles.background} />
      <View style={styles.headerContainer}>
        <HeadingText style={styles.header}>My Chats</HeadingText>
        <TouchableOpacity onPress={() => setNewGroupMode(true)}>
          <MaterialIcons style={{ marginBottom: 10 }} name="group" size={36} color="#fff" />
        </TouchableOpacity>   
      </View>
      {chatsIsLoading ?
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
  }
});

export default ChatsListScreen;