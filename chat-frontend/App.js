import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, AppState, AsyncStorage } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';

import ChatNavigator from './src/navigation/ChatNavigator';
import { Provider as AuthProvider } from './src/context/AuthContext';
import { Provider as ChatProvider } from './src/context/ChatContext';
import { Provider as ProfileProvider } from './src/context/ProfileContext'; 
import { Provider as ContactsProvider } from './src/context/ContactsContext';
import { Provider as GroupsProvider } from './src/context/GroupsContext';
import { setNavigator } from './src/components/navigationRef';
import { init } from './src/database/db';
import { connectToSocket } from './src/socket/chat';

init().then(() => {
  console.log('Successfully initialized database');
}).catch(err => {
  console.log(`Database failed due to ${err}`);
});

const fetchFonts = () => {
  return Font.loadAsync({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-semi-bold': require('./assets/fonts/OpenSans-SemiBold.ttf')
  });
};

export default () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const socket = useRef(null);
  // const [appState, setAppState] = useState(AppState.currentState);

  const checkAuth = async () => {
    let data = await AsyncStorage.getItem('data');
    data = JSON.parse(data);

    if (data && data.username) {
      console.log('auth active')
      socket.current = connectToSocket(data.username);
    }    
  };

  const _handleAppStateChange = nextAppState => { 
    if ((nextAppState === undefined && AppState.currentState === 'active') || nextAppState === 'active') {
      checkAuth();
    }

    if (nextAppState === 'inactive') {
      if (socket.current) {
        console.log('auth inactive')
        socket.current.disconnect();
      }
      
    }
    // setAppState(nextAppState);
  };

  useEffect(() => {
    _handleAppStateChange();
    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={(err) => console.log(err)}
      />
    );
  }

  return (
    <GroupsProvider>
      <ContactsProvider>
        <ProfileProvider>
          <ChatProvider>
            <AuthProvider>
              <ChatNavigator ref={(navigator) => { setNavigator(navigator) }} />
            </AuthProvider>
          </ChatProvider>
        </ProfileProvider>
      </ContactsProvider>
    </GroupsProvider>
  );
};
