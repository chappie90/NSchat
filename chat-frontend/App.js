import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import { Provider as AuthProvider } from './src/context/AuthContext';
import { Provider as ChatProvider } from './src/context/ChatContext'; 
import { setNavigator } from './src/components/navigationRef';
import ResolveAuthScreen from './src/screens/ResolveAuthScreen';
import StarterScreen from './src/screens/StarterScreen';
import SignupScreen from './src/screens/SignupScreen';
import SigninScreen from './src/screens/SigninScreen';
import ChatsListScreen from './src/screens/ChatsListScreen';
import ContactsListScreen from './src/screens/ContactsListScreen';
import AccountScreen from './src/screens/AccountScreen';
import AddContactScreen from './src/screens/AddContactScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';

const chatsFlow = createStackNavigator({
  ChatsList: ChatsListScreen,
  ChatDetail: ChatDetailScreen
});

const contactsListFlow = createStackNavigator({
  ContactsList: ContactsListScreen,
  ChatDetail: ChatDetailScreen,
  AddContact: AddContactScreen
},{
  headerMode: 'screen'
});

chatsFlow.navigationOptions = {
  title: 'Chats',
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="chat" size={30} />,
  tabBarOptions: { activeTintColor: 'orange' }
};

contactsListFlow.navigationOptions = {
  title: 'Contacts',
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="import-contacts" size={30} />,
  tabBarOptions: { activeTintColor: 'orange' }
};

AccountScreen.navigationOptions = {
  title: 'Account',
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="account-box" size={30} />,
  tabBarOptions: { activeTintColor: 'orange' }
};

const switchNavigator = createSwitchNavigator({
  ResolveAuth: ResolveAuthScreen,
  loginFlow: createStackNavigator({
    Starter: StarterScreen,
    Signup: SignupScreen,
    Signin: SigninScreen
  }),
  mainFlow: createBottomTabNavigator({
    chatsFlow,
    contactsListFlow,
    Account: AccountScreen
  })
});

const App = createAppContainer(switchNavigator);

export default () => {
  return (
    <ChatProvider>
      <AuthProvider>
        <App ref={(navigator) => { setNavigator(navigator) }} />
      </AuthProvider>
    </ChatProvider>
  );
};