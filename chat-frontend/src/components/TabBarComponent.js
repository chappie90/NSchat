import React from 'react';
import { View } from 'react-native';
import { BottomTabBar } from 'react-navigation-tabs';

let tabBarLayout = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

export function getTabBarHeight() {
  return tabBarLayout.height;
}

export function TabBarComponent(props) {
  return (
    <View
      collapsable={false}
      onLayout={(event) => {
        tabBarLayout = event.nativeEvent.layout;
      }}
    >
      <BottomTabBar {...props} />
    </View>
  );
}