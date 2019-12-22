import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ContactsListScreen = () => {
  return (
    <View>
      <Text>Contacts List</Text>
    </View>
  );
};

ContactsListScreen.navigationOptions = {
  title: 'Contacts',
  tabBarIcon: <MaterialIcons name="import-contacts" size={30} />
};

const styles = StyleSheet.create({

});

export default ContactsListScreen;