import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';
import { ListItem } from 'react-native-elements';

import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';

const ChatsListScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { previousChats }, getChats } = useContext(ChatContext);

  useEffect(() => {
    getChats({ username });
  }, []);

  const list = [
    {
      name: 'Amy Farha',
      avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
      subtitle: 'Vice President'
    },
    {
      name: 'Chris Jackson',
      avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
      subtitle: 'Vice Chairman'
    },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Chats</Text>   
      {
        previousChats.map((c, i) => (
          <TouchableOpacity key={i} onPress={() => navigation.navigate('ChatDetail')}>
            <ListItem
              key={i}
              // leftAvatar={{ source: { uri: l.avatar_url } }}
              title={c.contact}
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

const styles = StyleSheet.create({
  container: {

  },
  header: {
    fontSize: 22,
    paddingVertical: 5,
    marginTop: 15,
    paddingLeft: 10
  }
});

export default ChatsListScreen;