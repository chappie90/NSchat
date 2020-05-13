import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { BottomTabBar } from 'react-navigation-tabs';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import Colors from '../constants/colors';
import BodyText from './BodyText';
import ChatsNavigatorTab from './ChatsNavigatorTab';
import { getActiveRouteState } from '../helpers/getCurrentRoute';

let tabBarLayout = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

export function getTabBarHeight() {
  return tabBarLayout.height;
}

export function TabBarComponent({ navigation }) {
  // const activeTab = useRef('ChatsList');
 let activeTab = getActiveRouteState(navigation.state).routeName;

  if (activeTab === 'ChatDetail') {
    return <View></View>;
  }

  return (
    <View
      style={{ 
        backgroundColor: '#202020', 
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        justifyContent: 'space-around',
        height: 50,
        paddingVertical: 2 }}
      collapsable={false}
      onLayout={(event) => {
        tabBarLayout = event.nativeEvent.layout;
      }}
    >
      <TouchableWithoutFeedback onPress={() => navigation.navigate('ChatsList')}>
        <View style={{ height: 44, alignItems: 'center', justifyContent: 'flex-end' }}>
          <ChatsNavigatorTab color={ activeTab === 'ChatsList' ? Colors.primary : '#fff'} />
          <BodyText 
            style={{ 
              marginTop: 2, 
              fontSize: 12, 
              color: activeTab === 'ChatsList' ? Colors.primary : '#fff' }}>
            Chats
          </BodyText>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => navigation.navigate('ContactsList')}>
        <View style={{ height: 44, justifyContent: 'flex-end', alignItems: 'center' }}>
          <FontAwesome5 color={ activeTab === 'ContactsList' ? Colors.primary : '#fff'} name="user-friends" size={22} />
          <BodyText 
            style={{
              marginTop: 2, 
              fontSize: 12, 
              color: activeTab === 'ContactsList' ? Colors.primary : '#fff' }}>
            Contacts
          </BodyText>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => navigation.navigate('Account')}>
        <View style={{ height: 44, justifyContent: 'flex-end', alignItems: 'center'  }}>
          <MaterialIcons color={ activeTab === 'Account' ? Colors.primary : '#fff' } name="account-balance" size={22} />
          <BodyText
            style={{ 
              marginTop: 2, 
              fontSize: 12, 
              color:activeTab === 'Account' ? Colors.primary : '#fff' }}>
            Account
          </BodyText>
        </View>
      </TouchableWithoutFeedback>
     {/* <BottomTabBar {...props} /> */}
    </View>
  );
}