import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  ScrollView,
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Image as Img 
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'react-native-elements';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ContactsContext } from '../context/ContactsContext';
import { Context as ProfileContext } from '../context/ProfileContext';
import SecondaryButton from '../components/SecondaryButton';
import BodyText from '../components/BodyText';
import ScaleImageAnim from '../components/animations/ScaleImageAnim';
import TranslateFadeViewAnim from '../components/animations/TranslateFadeViewAnim';
import HeadingText from '../components/HeadingText';

const AddContactScreen = (props) => {
  const { state: { searchResults, contacts }, searchContacts, clearSearchResults, addContact } = useContext(ContactsContext);
  const { state: { username } } = useContext(AuthContext);
  const { state: { profileImage } } = useContext(ProfileContext);
  const [search, setSearch] = useState('');
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const renderActivityIndicator = () => {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  };

  const renderResultsList = () => {
    return (
      <ScrollView>
        {searchResults.map((item, index) => (
          <TouchableWithoutFeedback
            key={item.username}
            style={{ marginTop: 10, borderRadius: 5, overflow: 'hidden' }} 
            onPress={() => {}}>
            <View key={index} style={styles.listItemContainer}>
              <View style={{ overflow: 'hidden', width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F0F0'}}>
                {item.profile ?
                  <Image 
                    style={{ width: '100%', height: '100%' }} 
                    placeholderStyle={styles.placeholder}
                    source={{ uri: item.profile.cloudinaryImgPath_150 }}
                    /> : 
                  <Image style={{ width: '100%', height: '100%' }} source={require('../../assets/avatar-small.png')} />
                }
              </View>                  
               <View style={styles.itemContainer}>
                 <BodyText style={styles.name}>{item.username}</BodyText>
                {contacts.find(c => c.user.username === item.username) ? (
                  <MaterialIcons name="check-circle" size={30} color={Colors.secondary} />
                ) : (
                  <SecondaryButton
                    style={styles.button}
                    onPress={() => {
                      addContact({ username: username, contact: item.username });
                      props.closeModal();
                      setSearch('');
                      clearSearchResults();
                      setIsFirstRender(true);
                    }}>
                      Add
                    </SecondaryButton>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        ))}
      </ScrollView>
    );
  };

  const renderNoResults = () => {
    if (search) {
      return <Text style={styles.noResults}>No users found</Text>;
    } else {
      if (isFirstRender) {
        return (
          <View style={styles.imageContainer}>
            <ScaleImageAnim style={styles.image} source={require('../../assets/icons-05.png')} />
            <TranslateFadeViewAnim>
              <BodyText style={styles.imageCaption}>Stay in touch with your loved ones</BodyText>
            </TranslateFadeViewAnim>
          </View>
        );
      } else {
        return (
          <View style={styles.imageContainer}>
            <Img style={styles.image} source={require('../../assets/icons-05.png')} />
            <View>
              <BodyText style={styles.imageCaption}>Stay in touch with your loved ones</BodyText>
            </View>
          </View>
        );
      }
    }  
  };

  return (
    <Modal visible={props.visible} transparent={true} animationType="slide">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="search" size={40} color="white" />
              <TextInput
                style={styles.input} 
                selectionColor={'grey'}
                placeholder="Find people..."
                placeholderTextColor="white"
                autoFocus
                value={search}
                onChangeText={(search) => {               
                  setSearch(search);
                  setIsFirstRender(false);
                  if (!search) {
                    clearSearchResults();
                    setIsLoading(false);
                  } else {
                    setIsLoading(true);
                  }
                  searchContacts({ username, search })
                    .then(res => setIsLoading(false));
                }}
                autoCapitalize="none"
                autoCorrect={false} />
              <TouchableOpacity onPress={() => {
                props.closeModal();
                setSearch('');
                clearSearchResults();
                setIsFirstRender(true);
              }}>
                <MaterialIcons name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
            {isLoading ? 
              renderActivityIndicator() : 
              searchResults.length > 0 ? 
                renderResultsList() :
                renderNoResults()
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
    backgroundColor: '#fff',
    marginTop: 90
  },
  listItemContainer: {
     flexDirection: 'row', 
     alignItems: 'center', 
     paddingVertical: 6, 
     paddingHorizontal: 15
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 15
  },
  inputContainer: {
    paddingHorizontal: 10,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    // #EE7600
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25
  },
  name: {
    fontSize: 17,
    color: Colors.darkGrey
  },
  input: {
    fontSize: 24,
    height: '100%',
    flex: 1,
    color: 'white',
    paddingLeft: 10
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
  noResults: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: Colors.darkGrey
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 30
  },
  image: {
    width: 100,
    height: 100
  },
  imageCaption: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10
  }
});

export default AddContactScreen;