import React from 'react';
import { Text, View } from 'react-native';
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
import ChatsNavigatorTab from '../components/ChatsNavigatorTab';
import { TabBarComponent } from '../components/TabBarComponent';

const ChatsFlow = createStackNavigator(
  {
    ChatsList: ChatsListScreen,
    ChatDetail: ChatDetailScreen
  },
  {
    defaultNavigationOptions: {
      headerStyle: {
        height: 50
      },
      // headerMode: 'screen'
    }
  }
);

ChatsFlow.navigationOptions = {
  title: 'Chats',
  tabBarIcon: ({ tintColor }) => (
    <ChatsNavigatorTab color={tintColor} />
  ),
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
    defaultNavigationOptions: {
      headerStyle: {
        height: 50
      },
      // headerMode: 'screen'
    }
  }
);

ContactsListFlow.navigationOptions = {
  title: 'Contacts',
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="import-contacts" size={26} />,
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

AccountScreen.navigationOptions = {
  title: 'Account',
  tabBarIcon: ({ tintColor }) => <MaterialIcons color={tintColor} name="account-box" size={26} />,
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

const BottomTabNavigator = createBottomTabNavigator(
  {
    ChatsFlow,
    ContactsListFlow,
    Account: AccountScreen,
  },
  {
    tabBarComponent: TabBarComponent
  }
);

const ChatNavigator = createSwitchNavigator({
  ResolveAuth: ResolveAuthScreen,
  Starter: StarterScreen,
  MainFlow: BottomTabNavigator
  // {
  //   tabBarComponent: props => <TabBar />,
  //   tabBarOptions: {
  //     activeTintColor: "#4F4F4F",
  //     inactiveTintColor: "#ddd"
  //   }
  // }
});

export default createAppContainer(ChatNavigator);
