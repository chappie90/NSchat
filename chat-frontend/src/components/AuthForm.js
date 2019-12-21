import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity
} from 'react-native';
import { withNavigation } from 'react-navigation';

const AuthForm = ({ header, submitBtn, navLink, routeName, onSubmit, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{header}</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCorrect={false} />
      <TextInput
        style={styles.input} 
        placeholder="Password" 
        value={password}
        onChangeText={setPassword}
        autoCorrect={false}
        secureTextEntry />
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => onSubmit({ email, password })}>
        <Text style={styles.btnText}>{submitBtn}</Text>
      </TouchableOpacity>
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
    fontSize: 34,
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
    backgroundColor: 'orange',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 20
  },
  btnText: {
    fontSize: 23,
    color: 'white',
    textAlign: 'center'
  },
  signinButton: {
    padding: 5
  },
  signinTextButton: {
    fontSize: 23
  },
  navLink: {
    fontSize: 17,
    textAlign: 'center'
  }
});

export default withNavigation(AuthForm);