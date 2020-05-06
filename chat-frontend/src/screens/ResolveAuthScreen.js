import React, { useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import LottieView from 'lottie-react-native';
import { NavigationEvents } from 'react-navigation';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import HeadingText from '../components/HeadingText';
import FadeViewAnim from '../components/animations/FadeViewAnim';

const ResolveAuthScreen = () => {
  const { state: { statusBarColor }, autoLogin, setStatusBarColor } = useContext(AuthContext);
  const animation = useRef(null);

  useEffect(() => {
    animation.current.play();
  }, []);

  const willFocusHandler = () => {
    setStatusBarColor(1);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarColor === 1 ? 'light-content' : 'dark-content'} />
      <NavigationEvents onWillFocus={willFocusHandler} />
      <LottieView
        ref={animation}
        style={{
          width: '100%',
          height: '100%',
        }}
        loop={false}
        source={require('../../assets/splash.json')}
        onAnimationFinish={autoLogin}
      />
      </View>
  );
};  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#202020'
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