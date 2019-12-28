import React, { useState, useContext } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ListItem } from 'react-native-elements';

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
        {
        searchResults.map((item, index) => (
            <ListItem
              key={index}
              leftAvatar={{ source: require('../../assets/avatar2.png') }}
              title={
                <View style={styles.itemContainer}>
                  <Text style={styles.name}>{item.username}</Text>
                  <TouchableOpacity style={styles.button} onPress={() => addContact({ username: username, contact: item.username })}>
                    <Text style={styles.text}>Add</Text>
                  </TouchableOpacity>
                </View>
              }
              bottomDivider
            />
        ))
      }
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  name: {
    fontWeight: 'bold'
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