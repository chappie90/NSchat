import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

import ChatNavigator from './src/navigation/ChatNavigator';
import { Provider as AuthProvider } from './src/context/AuthContext';
import { Provider as ChatProvider } from './src/context/ChatContext';
import { Provider as ProfileProvider } from './src/context/ProfileContext'; 
import { Provider as ContactsProvider } from './src/context/ContactsContext';
import { Provider as GroupsProvider } from './src/context/GroupsContext';
import { Provider as YoutubeProvider } from './src/context/YoutubeContext';
import { setNavigator } from './src/components/navigationRef';
import { init } from './src/database/db';

// const sentryAuthToken = 'ef9d17b7b1964db8bba5712827dbe6f5a3fad9b5e43747cfad0c7700d4454d7c';

Sentry.init({
  dsn: 'https://dcfc8929b68542a5923769730189dd81@o400837.ingest.sentry.io/5259628',
  enableInExpoDevelopment: true,
  debug: true,
});

Sentry.setRelease(Constants.manifest.revisionId);


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
    <YoutubeProvider>
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
    </YoutubeProvider>
  );
};
