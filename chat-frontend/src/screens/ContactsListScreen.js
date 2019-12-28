import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ListItem } from 'react-native-elements';

import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';

const ContactsListScreen = ({ navigation }) => {
  const { state: { contacts }, getContacts } = useContext(ChatContext);
  const { state: { username } } = useContext(AuthContext);

  useEffect(() => {
    getContacts({ username });
  }, []);

  function getAvatar(username) {
    if (username === 'Stoyan') {
      return <Image source={require('../../assets/profile.jpg')} style={styles.image} />;
    } else if (username === 'Nora') {
      return <Image source={require('../../assets/nora.jpg')} style={styles.image} />;
    } else {
      return <Image source={require('../../assets/avatar2.png')} style={styles.image2} />;
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddContact')}>
        <Text style={styles.textButton}>Add New Contact</Text>
      </TouchableOpacity>
      <Text style={styles.header}>My Contacts</Text>
      <View style={styles.divider} />
      {
        contacts.map((item, index) => (
          <TouchableOpacity key={item} onPress={() => navigation.navigate('ChatDetail', { username: item })}>
            <ListItem
              key={item}
              leftAvatar={{ source: require('../../assets/avatar2.png') }}
              title={
                <View style={styles.itemContainer}>
                  <Text style={styles.name}>{item}</Text>
                </View>
              }
              bottomDivider
              chevron
            />
          </TouchableOpacity>
        ))
      }  
    </View>
  );
};

ContactsListScreen.navigationOptions = {
  header: null
  // title: 'Contacts',
  // tabBarIcon: <MaterialIcons name="import-contacts" size={30} />
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30
  },
  name: {
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: 'orange',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 3 ,
    margin: 15,
    alignSelf: 'center'
  },
  textButton: {
    fontSize: 22,
    color: 'white'
  },
  header: {
    fontSize: 22,
    paddingVertical: 5,
    marginTop: 15,
    paddingLeft: 10
  },
  divider: {
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 2
  },
  list: {
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey'
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  image2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  username: {
    fontSize: 20
  }
});

export default ContactsListScreen;