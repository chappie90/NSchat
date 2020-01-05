import React from 'react';

import ChatNavigator from './src/navigation/ChatNavigator';
import { Provider as AuthProvider } from './src/context/AuthContext';
import { Provider as ChatProvider } from './src/context/ChatContext'; 
import { setNavigator } from './src/components/navigationRef';

export default () => {
  return (
    <ChatProvider>
      <AuthProvider>
        <ChatNavigator ref={(navigator) => { setNavigator(navigator) }} />
      </AuthProvider>
    </ChatProvider>
  );
};