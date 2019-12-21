import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView } from 'react-native';

import AuthForm from '../components/AuthForm';

const SignupScreen = () => {
  return (
    <View style={styles.container}>
      <AuthForm 
        header="Join the chat"
        submitBtn="Sign Up"
        navLink="Already have an account? Sign in here"
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