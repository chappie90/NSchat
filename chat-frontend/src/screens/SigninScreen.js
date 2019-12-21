import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView } from 'react-native';

import AuthForm from '../components/AuthForm';

const SigninScreen = () => {
  return (
    <View style={styles.container}>
      <AuthForm
        header="Welcome back"
        submitBtn="Sign In"
        navLink="Don't have an account yet? Sign up here"
        />
      {Platform.OS === 'ios' && <KeyboardAvoidingView behaviour="padding" />}
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

export default SigninScreen;