import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert 
} from 'react-native';

import { Context as AuthContext } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

const SignupScreen = () => {
  const { state: { errorMessage }, signup } = useContext(AuthContext);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} >
      <View style={styles.container}>
        <AuthForm 
          header="Join the chat"
          submitBtn="Sign Up"
          navLink="Already have an account? Sign in here"
          routeName="Signin"
          onSubmit={signup}
          />
        {errorMessage ? 
          Alert.alert('Signup unsuccessful!', errorMessage, [{ text: 'Try again' }]) :
          null
        }
        {Platform.OS === 'ios' && <KeyboardAvoidingView behavior="padding" />}
      </View>
    </TouchableWithoutFeedback>
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