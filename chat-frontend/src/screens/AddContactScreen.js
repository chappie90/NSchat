import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ListItem } from 'react-native-elements';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import SecondaryButton from '../components/SecondaryButton';

const AddContactScreen = (props) => {
  const { state: { searchResults, contacts }, searchContacts, clearSearchResults, addContact } = useContext(ChatContext);
  const { state: { username } } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [searchResults]);


  const showActivityIndicator = () => {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  };

  const showResultsList = () => {
    return searchResults.map((item, index) => (
      <ListItem
        key={index}
        leftAvatar={{ source: require('../../assets/avatar2.png') }}
        title={
          <View style={styles.itemContainer}>
            <Text style={styles.name}>{item.username}</Text>
            {!contacts.includes(item.username) && (
              <SecondaryButton onPress={() => {
                addContact({ username: username, contact: item.username });
                props.closeModal();
                setSearch('');
                clearSearchResults();
              }}>
                Add
              </SecondaryButton>
            )}
          </View>
        }
        checkmark={{ value: contacts.includes(item.username), color: Colors.secondary, size: 26 }}
        bottomDivider
      />
    ))
  };

  const showNoResults = () => {
    if (search) {
      return <Text style={styles.noResults}>No users found</Text>;
    }
  };

  return (
    <Modal visible={props.visible} animationType="slide">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="search" size={40} color="white" />
              <TextInput
                style={styles.input} 
                placeholder="Find people..."
                placeholderTextColor="white"
                value={search}
                onChangeText={(search) => {               
                  setSearch(search);
                  if (!search) {
                    clearSearchResults();
                  }
                  setIsLoading(true);
                  searchContacts({ username, search });
                }}
                autoCapitalize="none"
                autoCorrect={false} />
              <TouchableOpacity onPress={() => {
                props.closeModal();
                setSearch('');
                clearSearchResults();
              }}>
                <MaterialIcons name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
            {isLoading ? 
              showActivityIndicator() : 
              searchResults.length > 0 ? 
                showResultsList() :
                showNoResults()
            }
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

AddContactScreen.navigationOptions = {
  title: 'New Contact'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  inputContainer: {
    paddingHorizontal: 10,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary
  },
  input: {
    fontSize: 24,
    height: '100%',
    flex: 1,
    color: 'white',
    paddingLeft: 10
  },
  name: {
    fontWeight: 'bold'
  },
  spinnerContainer: {
    padding: 40
  },
  list: {
    padding: 20
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'lightgrey'
  },
  user: {
    fontSize: 18,
    flex: 1
  },
  text: {
    fontSize: 18,
    color: 'white'
  },
  button: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3
  },
  noResults: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20
  }
});

export default AddContactScreen;