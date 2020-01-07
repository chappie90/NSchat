import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';

const AccountScreen = () => {
  const { state: { username }, signout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.image} resizeMode="cover" source={require('../../assets/profile-min.jpg')} />
        <Text style={styles.user}>{username}</Text>
      </View>
      <PrimaryButton onPress={signout}>Sign Out</PrimaryButton>
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
    borderColor: Colors.primary   
  },
  user: {
    fontSize: 34,
    marginTop: 10,
    textAlign: 'center'
  }
});

export default AccountScreen;
