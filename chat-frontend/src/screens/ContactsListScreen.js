import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ListItem, Image, Badge } from 'react-native-elements';

import AddContactScreen from './AddContactScreen';
import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ContactsContext } from '../context/ContactsContext';
import PrimaryButton from '../components/PrimaryButton';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import { connectToSocket } from '../socket/chat';

const ContactsListScreen = ({ navigation }) => {
  const { state: { contacts, contactsIsLoading, onlineContacts }, getContacts, getActiveStatus } = useContext(ContactsContext);
  const { state: { username } } = useContext(AuthContext);
  const [newContactMode, setNewContactMode] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    getContacts({ username });
    socket.current = connectToSocket(username);
    socket.current.on('online', users => {
      const onlineUsers = JSON.parse(users);
      if (Array.isArray(onlineUsers)) {
        getActiveStatus(onlineUsers);
      } else {
        // refactor to get new array - concat?
        onlineContacts.push(users);
        getActiveStatus(onlineContacts);
      }
    });
    socket.current.on('offline', user => {
      const updatedContacts = onlineContacts.filter(item => item !== user);
      getActiveStatus(updatedContacts);
    });
  }, []);

  const closeModal = () => {
    setNewContactMode(false);
  };

  return (
    <View style={styles.container}>
      <AddContactScreen visible={newContactMode} closeModal={closeModal} />
      <View style={styles.headerContainer}>
        <HeadingText style={styles.header}>My Contacts</HeadingText>
        <TouchableOpacity onPress={() => setNewContactMode(true)}>
          <FontAwesome5 name="user-plus" size={23} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      {contactsIsLoading ? (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : 
        contacts.length > 0 ? (
        <FlatList
          refreshControl={
            <RefreshControl
              onRefresh={() => getContacts({ username })}
              refreshing={contactsIsLoading}
              tintColor={Colors.primary} />
          }
          data={contacts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity onPress={() => navigation.navigate('ChatDetail', { username: item })}>
                <ListItem
                  key={index}
                  leftAvatar={{ source: require('../../assets/avatar2.png') }}
                  title={
                    <View style={styles.itemContainer}>
                      <Text style={styles.name}>{item}</Text>
                    </View>
                  }
                  // subtitle={
                  //   <View style={styles.iconWrapper}>
                  //     <MaterialCommunityIcons name="hand-peace" size={28} color={Colors.tertiary} />
                  //   </View>
                  // }
                  chevron={{ color: Colors.secondary }}
                  bottomDivider
                />
                {onlineContacts.includes(item.contact) && (
                  <Badge
                    badgeStyle={styles.badge}
                    containerStyle={styles.badgeContainer}
                  />
                )}
              </TouchableOpacity>
            );
          }} />
        ) : (
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={require('../../assets/team.png')} />
          <BodyText style={styles.imageCaption}>Stay in touch with your loved ones</BodyText>
        </View>
        )
      }
    </View>
  );
};

ContactsListScreen.navigationOptions = {
  header: null
  // title: 'Contacts',
  // tabBarIcon: <MaterialIcons name="import-contacts" size={30} />
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 20
  },
  name: {
    fontWeight: 'bold'
  },
  textButton: {
    fontSize: 22,
    color: 'white'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10
  },
  header: {
    fontSize: 22,
    paddingVertical: 5
  },
  divider: {
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 2
  },
  spinnerContainer: {
    padding: 40
  },
  list: {
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey'
  },
  image: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 20,
  },
  image2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  username: {
    fontSize: 20
  },
  iconWrapper: {
    alignSelf: 'flex-end'
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 100,
    height: 100
  },
  imageCaption: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10
  },
  badgeContainer: {
    position: 'absolute', 
    top: 43, 
    left: 43
  },
  badge: {
    backgroundColor: '#32CD32', 
    width: 15, 
    height: 15, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: 'white'
  },
});

export default ContactsListScreen;