import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Context as AuthContext } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import Colors from '../constants/colors';

const SigninScreen = (props) => {
  const { state: { errorMessage }, signin, clearErrorMessage } = useContext(AuthContext);

  return (
    <Modal visible={props.visible} animationType="slide">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <View style={styles.closeModalContainer}>
            <TouchableOpacity onPress={() => {
              props.closeModal();
            }}>
              <MaterialIcons name="close" size={35} color={Colors.tertiary} />
            </TouchableOpacity>
          </View>
          <AuthForm
            header="Welcome back"
            submitBtn="Sign In"
            navLink="Don't have an account yet? Sign up here"
            routeName="Signup"
            onSubmit={signin}
            toggleModal={props.toggleModal}
            />
          {errorMessage ?
            Alert.alert('Signin unsuccessful!', errorMessage, [{ text: 'Try again', onPress: () => clearErrorMessage }]) :
            null
          }
          {Platform.OS === 'ios' && <KeyboardAvoidingView behavior="padding" />}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeModalContainer: {
    width: '100%',
    alignItems: 'flex-end',
    padding: 20
  }
});

export default SigninScreen;