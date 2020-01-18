import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  ScrollView,
  Text, 
  StyleSheet, 
  TouchableOpacity, 
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

const ChatsListScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { previousChats, chatsIsLoading }, getChats } = useContext(ChatContext);

  useEffect(() => {
    getChats({ username });
  }, []);

  return (
    <View style={styles.container}>
      <HeadingText style={styles.header}>My Chats</HeadingText>   
      <View style={styles.divider} />
      <ScrollView>
        {chatsIsLoading ?
          (<View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>) :
          previousChats.map((c, i) => (
            <TouchableOpacity key={i} onPress={() => navigation.navigate('ChatDetail', { username: c.contact })}>
              <ListItem
                key={i}
                leftAvatar={{ source: require('../../assets/avatar2.png') }}
                title={
                  <View style={styles.itemContainer}>
                    <Text style={styles.name}>{c.contact}</Text><Text>{Moment(c.date).format('d MMM HH:mm')}</Text>
                  </View>
                }
                subtitle={c.text}
                bottomDivider
                chevron
              />
            </TouchableOpacity>
          ))
        }
      </ScrollView> 
    </View>
  );
};

ChatsListScreen.navigationOptions = {
  header: null
}; 

const styles = StyleSheet.create({
  container: {
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
  }
});

export default ChatsListScreen;