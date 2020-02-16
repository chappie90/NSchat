import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  Modal 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Context as AuthContext } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import Colors from '../constants/colors';
import HeadingText from '../components/HeadingText';

const GroupSettingsScreen = (props) => {
  const { state: { errorMessage }, signup, clearErrorMessage } = useContext(AuthContext);

  return (
    <Modal visible={props.visible} animationType="slide">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <View style={styles.header}>
            <HeadingText style={styles.heading}>Group Info</HeadingText>
              <TouchableOpacity style={styles.closeModalContainer} onPress={() => {
                props.closeModal();
              }}>
                <MaterialIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 24,
    backgroundColor: Colors.primary
  },
  heading: {
    color: '#fff',
    fontSize: 20
  },
  closeModalContainer: {
    position: 'absolute',
    right: 10,
    top: 24
  }
});

export default GroupSettingsScreen;