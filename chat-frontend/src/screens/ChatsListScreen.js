import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';

const ChatsListScreen = () => {

  return (
    <View>
      <Text>Chats List</Text>
    </View>
  );
};

ChatsListScreen.navigationOptions = {
  title: 'Chats',
  tabBarIcon: <MaterialIcons name="chat" size={30} />
};

const styles = StyleSheet.create({

});

export default ChatsListScreen;