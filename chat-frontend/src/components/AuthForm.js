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

const AuthForm = ({ 
  header, 
  submitBtn, 
  navLinkFirst, 
  navLinkSecond,
  routeName, 
  onSubmit, 
  navigation, 
  resetForm, 
  toggleModal 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameIsValid, setUsernameIsValid] = useState(null);
  const [passwordIsValid, setPasswordIsValid] = useState(null);
  const [usernameError, setUsernameError] = useState('');

  let secondTextInput;

  const usernameChanged = text => {
    if (text.trim().length === 0) {
      setUsernameIsValid(false);
      setUsernameError('Username can\'t be an empty value');
    } else if (/[^a-zA-Z0-9 ]/.test(text)) {
      setUsernameIsValid(false); 
      setUsernameError('Username must contain only letters, number and spaces');
    } else {
      setUsernameIsValid(true);
      setUsernameError('');
    }

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
        placeholderTextColor="#A0A0A0"
        // blurOnSubmit={false}
        autoCorrect={false} />
      {
        usernameIsValid !== null 
        && !usernameIsValid 
        && <BodyText style={styles.inputError}>{usernameError}</BodyText>
      }
      <TextInput
        style={styles.input} 
        placeholder="Password" 
        value={password}
        onChangeText={passwordChanged}
        autoCorrect={false}
        autoCapitalize="none"
        secureTextEntry
        placeholderTextColor="#A0A0A0"
        ref={(input) => { secondTextInput = input; }} />
      {
        passwordIsValid !== null 
        && !passwordIsValid 
        && <BodyText style={styles.inputError}>Password must be at least 8 characters long</BodyText>
      }
      <PrimaryButton style={styles.button} onPress={() => {
        usernameChanged(username);
        if (passwordIsValid === null) {
          setPasswordIsValid(false);
        }
        if (!usernameIsValid || !passwordIsValid) {
          return;
        }
        onSubmit({ username, password });
      }}>
        {submitBtn}
      </PrimaryButton>
      <TouchableOpacity style={{ marginTop: 15 }} onPress={() => toggleModal()}>
        <Text style={styles.navLink}>{navLinkFirst}</Text>
        <Text style={styles.navLink}>{navLinkSecond}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: {
    width: '95%',
    paddingTop: '10%',
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
    borderBottomColor: 'lightgrey',
    color: '#000'
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
    textAlign: 'center',
    color: '#202020'
  }
});

export default withNavigation(AuthForm);