import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';

import { Context as AuthContext } from '../context/AuthContext';

const AccountScreen = () => {
  const { state, signout } = useContext(AuthContext);

  // useEffect(() => {
  //   setUsername(state.username);
  // }, [state]);

  const username = state.username;

  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.image} resizeMode="cover" source={require('../../assets/profile.jpg')} />
        <Text>{username}</Text>
      </View>
      <TouchableOpacity style={styles.signoutButton} onPress={() => signout()}>
        <Text style={styles.signoutTextButton}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

AccountScreen.navigationOptions = {
  title: 'Account',
  tabBarIcon: <MaterialIcons name="account-box" size={30} />
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: 'orange'   
  },
  signoutButton: {
    backgroundColor: 'orange',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 3
  },
  signoutTextButton: {
    fontSize: 22,
    color: 'white'
  },
});

export default AccountScreen;
