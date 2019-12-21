import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import StarterScreen from './src/screens/StarterScreen';
import SignupScreen from './src/screens/SignupScreen';
import SigninScreen from './src/screens/SigninScreen';

const stackNavigator = createStackNavigator(
  {
    Starter: StarterScreen,
    Signup: SignupScreen,
    Signin: SigninScreen
  },
  {
    initialRouteName: 'Starter'
  }
);

const App = createAppContainer(stackNavigator);

export default App;