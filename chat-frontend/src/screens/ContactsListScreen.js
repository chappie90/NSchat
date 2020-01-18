import React, { useEffect, useState, useContext, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ListItem } from 'react-native-elements';

import AddContactScreen from './AddContactScreen';
import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import PrimaryButton from '../components/PrimaryButton';
import HeadingText from '../components/HeadingText';

const ContactsListScreen = ({ navigation }) => {
  const { state: { contacts, contactsIsLoading }, getContacts } = useContext(ChatContext);
  const { state: { username } } = useContext(AuthContext);
  const [newContactMode, setNewContactMode] = useState(false);

  useEffect(() => {
    getContacts({ username });
  }, []);

  function getAvatar(username) {
    if (username === 'Stoyan') {
      return <Image source={require('../../assets/profile.jpg')} style={styles.image} />;
    } else if (username === 'Nora') {
      return <Image source={require('../../assets/nora.jpg')} style={styles.image} />;
    } else {
      return <Image source={require('../../assets/avatar2.png')} style={styles.image2} />;
    }
  }

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
      ) : (
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
                  bottomDivider
                  chevron
                />
              </TouchableOpacity>
            );
          }} />
      )}
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
  }
});

export default ContactsListScreen;