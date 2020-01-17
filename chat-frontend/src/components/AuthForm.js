import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity
} from 'react-native';
import { withNavigation } from 'react-navigation';

import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';

const AuthForm = ({ header, submitBtn, navLink, routeName, onSubmit, navigation, resetForm }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameIsValid, setUsernameIsValid] = useState(true);
  const [passwordIsValid, setPasswordIsValid] = useState(true);

  let secondTextInput;

  const usernameChanged = text => {
    text.trim().length === 0 ? setUsernameIsValid(false) : setUsernameIsValid(true);
  
    setUsername(text); 
  };

  const passwordChanged = text => {
    text.trim().length < 8 ? setPasswordIsValid(false) : setPasswordIsValid(true);

    setPassword(text);
  };

  return (
    <View style={styles.container}>
      <HeadingText style={styles.header}>{header}</HeadingText>
      <TextInput 
        style={styles.input} 
        placeholder="Username"
        value={username}
        onChangeText={usernameChanged}
        returnKeyType="next"
        onSubmitEditing={() => { secondTextInput.focus(); }} 
        autoCapitalize="none"
        // blurOnSubmit={false}
        autoCorrect={false} />
      {!usernameIsValid && <BodyText style={styles.inputError}>Username can't be an empty value</BodyText>}
      <TextInput
        style={styles.input} 
        placeholder="Password" 
        value={password}
        onChangeText={passwordChanged}
        autoCorrect={false}
        autoCapitalize="none"
        secureTextEntry
        ref={(input) => { secondTextInput = input; }} />
      {!passwordIsValid && <BodyText style={styles.inputError}>Password must be at least 8 characters long</BodyText>}
      <PrimaryButton style={styles.button} onPress={() => onSubmit({ username, password })}>
        {submitBtn}
      </PrimaryButton>
      <TouchableOpacity onPress={() => navigation.navigate(routeName)}>
        <Text style={styles.navLink}>{navLink}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: {
    paddingHorizontal: 30
  },
  header: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 30,
    color: 'orange'
  },
  input: {
    height: 60,
    fontSize: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'lightgrey'
  },
  inputError: {
    color: 'red',
    fontSize: 16
  },
  button: {
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 25
  },
  navLink: {
    fontSize: 17,
    textAlign: 'center'
  }
});

export default withNavigation(AuthForm);