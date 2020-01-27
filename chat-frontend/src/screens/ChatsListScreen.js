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
import { ListItem } from 'react-native-elements';
import Moment from 'moment';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import HeadingText from '../components/HeadingText';
import { connectToSocket } from '../socket/chat';

const ChatsListScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { previousChats, chatsIsLoading, onlineContacts }, getChats, getActiveStatus } = useContext(ChatContext);
  const socket = useRef(null);

  useEffect(() => {
    getChats({ username });
    socket.current = connectToSocket(username);   
    socket.current.on('online', onlineContacts => {
      getActiveStatus(onlineContacts);
    });
  }, []);

  return (
    <View style={styles.container}>
      <HeadingText style={styles.header}>My Chats</HeadingText>   
      <View style={styles.divider} />
      {chatsIsLoading ? (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
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
              <TouchableOpacity onPress={() => navigation.navigate('ChatDetail', { username: item.contact })}>
                <ListItem
                  key={index}
                  leftAvatar={{ source: require('../../assets/avatar2.png'), rounded: true }}
                  title={
                    <View style={styles.itemContainer}>
                      <Text style={styles.name}>{item.contact}</Text><Text>{Moment(item.date).format('d MMM HH:mm')}</Text>
                    </View>
                  }
                  badge={{ 
                    badgeStyle: styles.badge, 
                    containerStyle: styles.badgeContainer,
                    options: { hidden: true }
                  }}
                  subtitle={item.text}
                  bottomDivider
                  chevron
                />
              </TouchableOpacity>
            );
          }} />
      )} 
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
    fontWeight: 'bold'
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
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
  }
});

export default ChatsListScreen;