import React, { useState, useContext } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';

const AddContactScreen = () => {
  const { state: { searchResults }, searchContacts, addContact } = useContext(ChatContext);
  const { state: { username } } = useContext(AuthContext);
  const [search, setSearch] = useState('');

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
        style={styles.list}
        data={searchResults}
        keyExtractor={item => item.username}
        renderItem={({ item }) => {
          return <View style={styles.userContainer}> 
            <FontAwesome5 style={styles.icon} name="user-circle" size={32} />
            <Text style={styles.user}>{item.username}</Text>
            <TouchableOpacity style={styles.button} onPress={() => addContact({ username: username, contact: item.username })}>
              <Text style={styles.text}>Add</Text>
            </TouchableOpacity>  
          </View>
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
  },
  list: {
    padding: 20
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'lightgrey'
  },
  user: {
    fontSize: 18,
    flex: 1
  },
  text: {
    fontSize: 18,
    color: 'white'
  },
  button: {
    backgroundColor: 'mediumseagreen',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3
  }
});

export default AddContactScreen;