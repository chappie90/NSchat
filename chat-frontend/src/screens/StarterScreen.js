import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import Colors from '../constants/colors';
import HeadingText from '../components/HeadingText';
import PrimaryButton from '../components/PrimaryButton';
import SignupScreen from '../screens/SignupScreen';
import SigninScreen from '../screens/SigninScreen';

const StarterScreen = ({ navigation }) => {
  const [signupMode, setSignupMode] = useState(false);
  const [signinMode, setSigninMode] = useState(false);

  const closeModal = () => {
    setSignupMode(false);
    setSigninMode(false);
  };

  const toggleModal = () => {
    if (signinMode) {
      setSigninMode(false);
      setSignupMode(true);
    }
    if (signupMode) {
      setSigninMode(true);
      setSignupMode(false);
    }
  };

  return (
    <View style={styles.container}>
      <SignupScreen visible={signupMode} toggleModal={toggleModal} closeModal={closeModal} />
      <SigninScreen visible={signinMode} toggleModal={toggleModal} closeModal={closeModal} />
      <Image style={styles.image}  source={require('../../assets/starter-icon-min.jpg')} />
      <View style={styles.textWrapper}>
        <HeadingText style={styles.textLeft}>You & Me</HeadingText><HeadingText style={styles.textRight}> Chat</HeadingText>
      </View>
      <PrimaryButton style={styles.signupButton} onPress={() => setSignupMode(true)}>Get Started</PrimaryButton>
      <TouchableOpacity style={styles.signinButton} onPress={() => setSigninMode(true)}>
        <HeadingText style={styles.signinButtonText}>Sign In</HeadingText>
      </TouchableOpacity>
    </View>
  );
};

StarterScreen.navigationOptions = {
  header: null
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 30
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
  },
  signupButton: {
    marginTop: 'auto'
  },
  signinButton: {
    padding: 10
  },
  signinButtonText: {
    fontSize: 20,
    textAlign: 'center'
  }
});

export default StarterScreen;
