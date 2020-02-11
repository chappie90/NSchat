import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import HeadingText from '../components/HeadingText';
import FadeViewAnim from '../components/animations/FadeViewAnim';

const ResolveAuthScreen = () => {
  const { autoLogin } = useContext(AuthContext);

  useEffect(() => {
    autoLogin();
  }, []);

  return (
    <FadeViewAnim style={styles.container}>
      <Image style={styles.image}  source={require('../../assets/starter-icon.jpg')} />
      <View style={styles.textWrapper}>
        <HeadingText style={styles.textLeft}>You & Me</HeadingText><HeadingText style={styles.textRight}> Chat</HeadingText>
      </View>
    </FadeViewAnim>
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
  textLeft: {
    fontSize: 30,
    color: Colors.primary
  },
  textRight: {
    fontSize: 30
  }
});

export default ResolveAuthScreen;