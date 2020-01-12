import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import ResolveAuthScreen from '../screens/ResolveAuthScreen';
import StarterScreen from '../screens/StarterScreen';
import SignupScreen from '../screens/SignupScreen';
import SigninScreen from '../screens/SigninScreen';
import ChatsListScreen from '../screens/ChatsListScreen';
import ContactsListScreen from '../screens/ContactsListScreen';
import AccountScreen from '../screens/AccountScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
// import SpeechToTextScreen from '../screens/SpeechToTextScreen';

const ChatsFlow = createStackNavigator({
  ChatsList: ChatsListScreen,
  ChatDetail: ChatDetailScreen
});

ChatsFlow.navigationOptions = {
  title: 'Chats',
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="chat" size={30} />,
  tabBarOptions: { activeTintColor: 'orange' }
};

const ContactsListFlow = createStackNavigator(
  {
    ContactsList: ContactsListScreen,
    ChatDetail: ChatDetailScreen
  },
  {
    headerMode: 'screen'
  }
);

ContactsListFlow.navigationOptions = {
  title: 'Contacts',
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="import-contacts" size={30} />,
  tabBarOptions: { activeTintColor: 'orange' }
};

AccountScreen.navigationOptions = {
  title: 'Account',
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="account-box" size={30} />,
  tabBarOptions: { activeTintColor: 'orange' }
};

const ChatNavigator = createSwitchNavigator({
  ResolveAuth: ResolveAuthScreen,
  LoginFlow: createStackNavigator({
    Starter: StarterScreen,
    Signup: SignupScreen,
    Signin: SigninScreen
  }),
  MainFlow: createBottomTabNavigator({
    ChatsFlow,
    ContactsListFlow,
    Account: AccountScreen,
    // SpeechToText: SpeechToTextScreen
  })
});

export default createAppContainer(ChatNavigator);
