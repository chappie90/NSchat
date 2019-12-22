import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AccountScreen = () => {
  return (
    <View>
      <Text>Account Screen</Text>
    </View>
  );
};

AccountScreen.navigationOptions = {
  title: 'Account',
  tabBarIcon: <MaterialIcons name="account-box" size={30} />
};

const styles = StyleSheet.create({

});

export default AccountScreen;
