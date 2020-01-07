import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import Colors from '../constants/colors';
import HeadingText from '../components/HeadingText';
import PrimaryButton from '../components/PrimaryButton';

const StarterScreen = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <Image style={styles.image}  source={require('../../assets/starter-icon-min.jpg')} />
      <View style={styles.textWrapper}>
        <HeadingText style={styles.textLeft}>You & Me</HeadingText><HeadingText style={styles.textRight}> Chat</HeadingText>
      </View>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          style={styles.signupButton}
          onPress={() => navigation.navigate('Signup')}>Get Started
        </PrimaryButton>
        <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('Signin')}>
          <HeadingText style={styles.signinButtonText}>Sign In</HeadingText>
        </TouchableOpacity>
      </View>
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
  buttonContainer: {
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
