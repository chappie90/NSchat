import React, { useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView } from 'react-native';

import { Context as AuthContext } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

const SignupScreen = () => {
  const { state, signup } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <AuthForm 
        header="Join the chat"
        submitBtn="Sign Up"
        navLink="Already have an account? Sign in here"
        onSubmit={signup}
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