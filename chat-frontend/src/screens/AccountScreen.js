import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';

import { Context as AuthContext } from '../context/AuthContext';

const AccountScreen = () => {
  const { state: { username }, signout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.image} resizeMode="cover" source={require('../../assets/profile-min.jpg')} />
        <Text style={styles.user}>{username}</Text>
      </View>
      <TouchableOpacity style={styles.signoutButton} onPress={() => signout()}>
        <Text style={styles.signoutTextButton}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
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
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'orange'   
  },
  user: {
    fontSize: 34,
    marginTop: 10,
    textAlign: 'center'
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
