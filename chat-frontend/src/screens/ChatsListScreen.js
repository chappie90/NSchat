import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';
import { ListItem } from 'react-native-elements';
import Moment from 'moment';

import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';

const ChatsListScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { previousChats }, getChats } = useContext(ChatContext);

  useEffect(() => {
    getChats({ username });
  }, [previousChats]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Chats</Text>   
      <View style={styles.divider} />
      {
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
});

export default ChatsListScreen;