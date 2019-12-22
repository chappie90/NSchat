import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpactiy, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AddContactScreen = () => {
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
          onChangeText={setSearch}
          autoCorrect={false} />
        </View>
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