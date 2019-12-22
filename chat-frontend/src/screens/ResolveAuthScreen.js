import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import { Context as AuthContext } from '../context/AuthContext';

const ResolveAuthScreen = () => {
  const { autoLogin } = useContext(AuthContext);

  useEffect(() => {
    autoLogin();
  }, []);

  return (
    <View style={styles.container}>
      <Image style={styles.image}  source={require('../../assets/starter-icon.jpg')} />
      <View style={styles.textWrapper}>
        <Text style={styles.text1}>You & Me</Text><Text style={styles.text2}> Chat</Text>
      </View>
    </View>
  );
};  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 250,
    height: 203.25  
  },
  textWrapper: {
    flexDirection: 'row'
  },
  text1: {
    fontSize: 34,
    color: 'orange'
  },
  text2: {
    fontSize: 34
  }
});

export default ResolveAuthScreen;