import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { Button } from 'react-native-elements';

import AuthForm from '../components/AuthForm';

const SignupScreen = () => {
  return (
    <View style={styles.container}>
      <AuthForm 
        header="Join the chat"
        submitBtn="Sign Up"
        navLink="Don't have an account yet? Sign up here"
        />
      {Platform.OS === 'ios' && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default SignupScreen;