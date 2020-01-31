import React, { useState } from 'react';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';

import ChatNavigator from './src/navigation/ChatNavigator';
import { Provider as AuthProvider } from './src/context/AuthContext';
import { Provider as ChatProvider } from './src/context/ChatContext';
import { Provider as ProfileProvider } from './src/context/ProfileContext'; 
import { Provider as ContactsProvider } from './src/context/ContactsContext';
import { setNavigator } from './src/components/navigationRef';
import { init } from './src/database/db';

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
    <ContactsProvider>
      <ProfileProvider>
        <ChatProvider>
          <AuthProvider>
            <ChatNavigator ref={(navigator) => { setNavigator(navigator) }} />
          </AuthProvider>
        </ChatProvider>
      </ProfileProvider>
    </ContactsProvider>
  );
};