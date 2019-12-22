import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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