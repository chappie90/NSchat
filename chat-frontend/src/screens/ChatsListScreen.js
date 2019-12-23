import React from 'react';
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

const styles = StyleSheet.create({
  container: {

  }
});

export default ChatsListScreen;