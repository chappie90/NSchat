import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import { Provider as AuthProvider } from './src/context/AuthContext';
import { setNavigator } from './src/components/navigationRef';
import ResolveAuthScreen from './src/screens/ResolveAuthScreen';
import StarterScreen from './src/screens/StarterScreen';
import SignupScreen from './src/screens/SignupScreen';
import SigninScreen from './src/screens/SigninScreen';
import ChatsListScreen from './src/screens/ChatsListScreen';
import ContactsListScreen from './src/screens/ContactsListScreen';
import AccountScreen from './src/screens/AccountScreen';
import AddContactScreen from './src/screens/AddContactScreen';

const contactsListFlow = createStackNavigator({
  ContactsList: ContactsListScreen,
  AddContact: AddContactScreen,
});

contactsListFlow.navigationOptions = {
  title: 'Contacts',
  tabBarIcon: <MaterialIcons name="import-contacts" size={30} />
};

const switchNavigator = createSwitchNavigator({
  ResolveAuth: ResolveAuthScreen,
  loginFlow: createStackNavigator({
    Starter: StarterScreen,
    Signup: SignupScreen,
    Signin: SigninScreen
  }),
  mainFlow: createBottomTabNavigator({
    ChatsList: ChatsListScreen,
    contactsListFlow,
    Account: AccountScreen
  })
});

const App = createAppContainer(switchNavigator);

export default () => {
  return (
    <AuthProvider>
      <App ref={(navigator) => { setNavigator(navigator) }} />
    </AuthProvider>
  );
};