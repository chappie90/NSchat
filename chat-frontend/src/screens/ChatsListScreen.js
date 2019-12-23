import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';

const ChatsListScreen = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('ChatDetail')}>
        <Text>Chats List</Text>
      </TouchableOpacity>
    </View>
  );
};

ChatsListScreen.navigationOptions = {
  title: 'Chats',
  tabBarIcon: <MaterialIcons name="chat" size={30} />
};

const styles = StyleSheet.create({
  cotainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ChatsListScreen;