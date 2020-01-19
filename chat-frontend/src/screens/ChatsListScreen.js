import React, { useEffect, useState, useContext } from 'react';
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
                  leftAvatar={{ source: require('../../assets/avatar2.png') }}
                  title={
                    <View style={styles.itemContainer}>
                      <Text style={styles.name}>{item.contact}</Text><Text>{Moment(item.date).format('d MMM HH:mm')}</Text>
                    </View>
                  }
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