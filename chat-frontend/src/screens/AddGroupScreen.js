import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  StyleSheet,
  FlatList, 
  ScrollView, 
  Text, 
  TextInput,
  TouchableWithoutFeedback,
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
  return (
    <Modal visible={props.visible} transparent={true} animationType="slide">
      <Text>My Modal</Text>
    </Modal>
  );
};

const styles = StyleSheet.create({

});

export default AddGroupScreen;