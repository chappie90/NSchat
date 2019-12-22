import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';

const StarterScreen = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <Image style={styles.image}  source={require('../../assets/starter-icon.jpg')} />
      <View style={styles.textWrapper}>
        <Text style={styles.text1}>You & Me</Text><Text style={styles.text2}> Chat</Text>
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
