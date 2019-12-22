import React from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ContactsListScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddContact')}>
        <Text style={styles.textButton}>Add New Contact</Text>
      </TouchableOpacity>
      <Text style={styles.header}>My Contacts</Text>
      <View style={styles.divider} />
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
    paddingVertical: 5
  },
  divider: {
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1
  }
});

export default ContactsListScreen;