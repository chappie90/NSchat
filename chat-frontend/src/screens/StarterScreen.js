import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';

const StarterScreen = () => {
  return (
    <View style={styles.container}>
      <Image style={styles.image}  source={require('../../assets/starter-icon.jpg')} />
      <View style={styles.textWrapper}>
        <Text style={styles.text1}>You & Me</Text><Text style={styles.text2}> Chat</Text>
      </View>
      <TouchableOpacity style={styles.signupButton}>
        <Text style={styles.signupTextButton}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signinButton}>
        <Text style={styles.signinTextButton}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30
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
  },
  signupButton: {
    backgroundColor: 'orange',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 3 ,
    marginTop: 'auto',
    marginBottom: 10
  },
  signupTextButton: {
    fontSize: 22,
    color: 'white'
  },
  signinTextButton: {
    color: 'black',
    fontSize: 22
  }
});

export default StarterScreen;
