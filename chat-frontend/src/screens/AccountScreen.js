import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AsyncStorage } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NavigationEvents } from 'react-navigation';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import HeadingText from '../components/HeadingText';
import ImagePicker from '../components/ImagePicker';

const AccountScreen = ({ navigation }) => {
  const {
    state: { username, userId, socketState }, 
    signout,
    setStatusBarColor 
  } = useContext(AuthContext);
  const socket = useRef(null);

   useEffect(() => {
    if (socketState) {
      socket.current = socketState; 
    }
  }, [socketState]);

  const signoutHandler = () => {
    socket.current.emit('offline');
    signout(userId);
  }; 

  const willFocusHandler = () => {
    setStatusBarColor(1);
  }

  return (
    <View style={styles.container}>
      <NavigationEvents onWillFocus={willFocusHandler} />
      <View style={styles.background} />
      <View style={styles.innerContainer}>
        <View style={styles.signout}>
          <TouchableOpacity onPress={signoutHandler}>
            <HeadingText style={styles.text}>Sign Out</HeadingText>
          </TouchableOpacity>
        </View>
       {/* <Image style={styles.image} resizeMode="cover" source={require('../../assets/profile-min.jpg')} /> */}
        <ImagePicker />
        <Text style={styles.user}>{username}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  innerContainer: {
    width: '100%',
    paddingHorizontal: 20
  },
  background: {
    width: '100%',
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 0,
    left: 0,
    height: 200
  },
  user: {
    fontSize: 34,
    marginTop: 10,
    textAlign: 'center'
  },
  signout: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingBottom: 30
  },
  text: {
    fontSize: 20,
    color: 'white'
  }
});

export default AccountScreen;
