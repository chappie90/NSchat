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

const SigninScreen = () => {
  const { state: { errorMessage }, signin, clearErrorMessage } = useContext(AuthContext);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <AuthForm
          header="Welcome back"
          submitBtn="Sign In"
          navLink="Don't have an account yet? Sign up here"
          routeName="Signup"
          onSubmit={signin}
          />
        {errorMessage ?
          Alert.alert('Signin unsuccessful!', errorMessage, [{ text: 'Try again', onPress: () => clearErrorMessage }]) :
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

export default SigninScreen;