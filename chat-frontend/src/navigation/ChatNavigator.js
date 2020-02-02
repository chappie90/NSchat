import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import ResolveAuthScreen from '../screens/ResolveAuthScreen';
import StarterScreen from '../screens/StarterScreen';
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
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="chat" size={27} />,
  tabBarOptions: {
    inactiveTintColor: 'white',
    activeTintColor: Colors.primary, 
    keyboardHidesTabBar: false,
    style: {
      backgroundColor: '#202020'
    },
    labelStyle: {
      fontFamily: 'open-sans',
    }  
  }
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
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="import-contacts" size={27} />,
  tabBarOptions: {
    inactiveTintColor: 'white',
    activeTintColor: Colors.primary,
    style: {
      backgroundColor: '#202020'
    },
    labelStyle: {
      fontFamily: 'open-sans',
    }
  }
};

AccountScreen.navigationOptions = {
  title: 'Account',
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="account-box" size={27} />,
  tabBarOptions: {
    inactiveTintColor: 'white',
    activeTintColor: Colors.primary,
    style: {
      backgroundColor: '#202020'
    },
    labelStyle: {
      fontFamily: 'open-sans',
    } 
  }
};

const ChatNavigator = createSwitchNavigator({
  ResolveAuth: ResolveAuthScreen,
  LoginFlow: createStackNavigator({
    Starter: StarterScreen,
  }),
  MainFlow: createBottomTabNavigator({
    ChatsFlow,
    ContactsListFlow,
    Account: AccountScreen,
    // SpeechToText: SpeechToTextScreen
  })
});

export default createAppContainer(ChatNavigator);
