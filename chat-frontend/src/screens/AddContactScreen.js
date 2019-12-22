import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpactiy, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AddContactScreen = () => {
  const [search, setSearch] = useState('');

  return (
    <View>
      <TextInput
        style={styles.input} 
        placeholder="Find people..."
        value={search}
        onChangeText={setSearch}
        autoCorrect={false} />
    </View>
  );
};

AddContactScreen.navigationOptions = {
  title: 'New Contact'
};

const styles = StyleSheet.create({
  input: {
    height: 100,
    backgroundColor: 'orange'
  }
});

export default AddContactScreen;