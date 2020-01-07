import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import Colors from '../constants/colors';
import HeadingText from '../components/HeadingText';

const StarterScreen = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <Image style={styles.image}  source={require('../../assets/starter-icon-min.jpg')} />
      <View style={styles.textWrapper}>
        <HeadingText style={styles.text1}>You & Me</HeadingText><HeadingText style={styles.text2}> Chat</HeadingText>
      </View>
      <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signupTextButton}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('Signin')}>
        <Text style={styles.signinTextButton}>Sign In</Text>
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
  text1: {
    fontSize: 30,
    color: Colors.primary
  },
  text2: {
    fontSize: 30
  },
  signupButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 3 ,
    marginTop: 'auto',
    marginBottom: 5
  },
  signupTextButton: {
    fontSize: 23,
    color: 'white'
  },
  signinButton: {
    padding: 5
  },
  signinTextButton: {
    fontSize: 23
  }
});

export default StarterScreen;
