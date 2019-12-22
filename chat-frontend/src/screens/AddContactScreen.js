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

const styles = StyleSheet.create({
  input: {

  }
});

export default AddContactScreen;