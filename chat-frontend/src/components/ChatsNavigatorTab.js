import React, { useState, useContext, useEffect } from 'react';
import { View } from 'react-native';
import { Badge } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import { Context as ChatContext } from '../context/ChatContext';

const ChatsNavigatorTab = props => {
  const { state: { previousChats }, markMessagesAsRead } = useContext(ChatContext);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    const unreadMsgsArr = previousChats.filter(item => item.unreadMessageCount > 0);
    setUnreadMsgCount(unreadMsgsArr.length);
  }, [previousChats]);

  return (
    <View style={{ flexDirection: 'row' }}>
      {unreadMsgCount > 0 && (
        <Badge
          value={unreadMsgCount} 
          containerStyle={{ position: 'absolute', top: 8, right: -10, zIndex: 1 }} 
          badgeStyle={{ backgroundColor: Colors.tertiary }} />
      )}
      <MaterialIcons color={props.color} name="chat" size={26} />
    </View>
  );
};

export default ChatsNavigatorTab;