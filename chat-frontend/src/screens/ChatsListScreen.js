import React, { useEffect, useState, useRef, useContext } from 'react';
import { 
  View, 
  ScrollView,
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';
import { ListItem, Badge, Image } from 'react-native-elements';
import { formatDate } from '../helpers/formatDate';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import { connectToSocket } from '../socket/chat';

const ChatsListScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { 
    state: { previousChats, chatsIsLoading, onlineContacts },
    getChats, 
    getActiveStatus,
    markMessagesAsRead } = useContext(ChatContext);
  const socket = useRef(null);

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
  }, []);

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
              navigation.navigate('ChatDetail', { username: item.contact });
            }}>
              <ListItem
                key={index}
                leftAvatar={{ source: require('../../assets/avatar2.png'), rounded: true }}
                title={
                  <View style={styles.itemContainer}>
                    <HeadingText style={styles.name}>{item.contact}</HeadingText><BodyText style={styles.date}>{formatDate(item.date)}</BodyText>
                  </View>
                }
                subtitle={
                  <View style={styles.itemContainer}>
                    <BodyText>{item.text}</BodyText>
                    {item.unreadMessageCount !== 0 && (
                      <Badge value={item.unreadMessageCount} badgeStyle={styles.unreadBadge} />
                    )}
                  </View>
                }
                subtitleStyle={styles.subtitle}
                bottomDivider
              />
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
        <Image style={styles.image} source={require('../../assets/talk.png')} />
        <BodyText style={styles.imageCaption}>Stay in touch with your loved ones</BodyText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeadingText style={styles.header}>My Chats</HeadingText>   
      <View style={styles.divider} />
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
    paddingVertical: 30,
    paddingHorizontal: 20
  },
  header: {
    fontSize: 22,
    paddingVertical: 5,
    marginTop: 15,
    paddingLeft: 10
  },
  name: {
    fontSize: 15
  },
  date: {
    color: 'grey'
  },
  subtitle: {
    color: 'grey', 
    marginTop: 2
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
    top: 43, 
    left: 43
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
  }
});

export default ChatsListScreen;