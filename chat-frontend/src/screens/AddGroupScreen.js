import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  StyleSheet,
  FlatList, 
  ScrollView, 
  Text, 
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Modal, 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ContactsContext } from '../context/ContactsContext';
import ScaleImageAnim from '../components/animations/ScaleImageAnim';
import TranslateFadeViewAnim from '../components/animations/TranslateFadeViewAnim';
import HeadingText from '../components/HeadingText';

const AddGroupScreen = props => {
  const [groupName, setGroupName] = useState('');

  return (
    <Modal visible={props.visible} transparent={true} animationType="slide">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <HeadingText style={styles.heading}>Add people to group</HeadingText>
              <TouchableOpacity onPress={() => props.closeModal()}>
                <MaterialIcons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerMiddle}>
              <TextInput
                style={styles.input} 
                selectionColor={'white'}
                placeholder="Group Name"
                placeholderTextColor="white"
                autoFocus
                value={groupName}
                onChangeText={(name) => setGroupName(name)}
                autoCapitalize="none"
                autoCorrect={false} />
              <TouchableOpacity onPress={() => {}}>
                <MaterialIcons color="#800040" name="camera-alt" size={40} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 90
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#ff99cc',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    flex: 1,
    textAlign: 'center'
  },
  headerMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    backgroundColor: '#800040',
    paddingHorizontal: 15,
    height: 32,
    borderRadius: 4,
    fontSize: 16,
    fontFamily: 'open-sans',
    flex: 1,
    marginRight: 8
  }
});

export default AddGroupScreen;