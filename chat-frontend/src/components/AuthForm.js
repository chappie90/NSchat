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
import PrimaryButton from '../components/PrimaryButton';

const AuthForm = ({ header, submitBtn, navLink, routeName, onSubmit, navigation, resetForm }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  let secondTextInput;

  return (
    <View style={styles.container}>
      <HeadingText style={styles.header}>{header}</HeadingText>
      <TextInput 
        style={styles.input} 
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        returnKeyType="next"
        onSubmitEditing={() => { secondTextInput.focus(); }} 
        autoCapitalize="none"
        autoCorrect={false} />
      <TextInput
        style={styles.input} 
        placeholder="Password" 
        value={password}
        onChangeText={setPassword}
        autoCorrect={false}
        autoCapitalize="none"
        secureTextEntry
        ref={(input) => { secondTextInput = input; }} />
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