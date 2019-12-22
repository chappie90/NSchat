import React, { useState, useContext } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Context as ChatContext } from '../context/ChatContext';

const AddContactScreen = () => {
  const { state: { contacts }, searchContacts } = useContext(ChatContext);
  const [search, setSearch] = useState('');

  console.log(contacts);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <MaterialIcons style={styles.icon} name="search" size={40} color="white" />
        <TextInput
          style={styles.input} 
          placeholder="Find people..."
          placeholderTextColor="white"
          value={search}
          onChangeText={(search) => {
            setSearch(search);
            searchContacts({ search });
          }}
          autoCorrect={false} />
        </View>
      <FlatList 
        data={contacts}
        keyExtractor={item => item.username}
        renderItem={({ item }) => {
          return <TouchableOpacity>
            <Text>{item.username}</Text>
          </TouchableOpacity>  
        }}/>
    </View>
  );
};

AddContactScreen.navigationOptions = {
  title: 'New Contact'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'orange',
  },
  icon: {
    padding: 10
  },
  input: {
    fontSize: 24,
    color: 'white'
  }
});

export default AddContactScreen;