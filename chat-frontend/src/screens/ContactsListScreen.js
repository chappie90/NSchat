import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  Image,
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  StyleSheet, 
  FlatList,
  Animated,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons, AntDesign, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { ListItem, Badge } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
 
import AddContactScreen from './AddContactScreen';
import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ContactsContext } from '../context/ContactsContext';
import PrimaryButton from '../components/PrimaryButton';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import ScaleImageAnim from '../components/animations/ScaleImageAnim';
import TranslateFadeViewAnim from '../components/animations/TranslateFadeViewAnim';

const ContactsListScreen = ({ navigation }) => {
  const { state: { contacts, onlineContacts }, getContacts, getActiveStatus, userIsOffline } = useContext(ContactsContext);
  const { state: { username, socketState } } = useContext(AuthContext);
  const [newContactMode, setNewContactMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useRef(null);
    
  useEffect(() => {
    getContacts({ username }).then(res => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (socketState) {
      socket.current = socketState;
      socket.current.on('online', users => {
        getActiveStatus(users);
      });
      socket.current.on('offline', user => {
        userIsOffline
      });
    }
  }, [socketState]);

  const closeModal = () => {
    setNewContactMode(false);
  };

   const onSwipeValueChange = (swipeData) => {
    console.log(swipeData);
  }

  return (
    <View style={styles.container}>
      <AddContactScreen visible={newContactMode} closeModal={closeModal} />
      <View style={styles.background} />
      <View style={styles.headerContainer}>
        <HeadingText style={styles.header}>My Contacts</HeadingText>
        <TouchableOpacity onPress={() => setNewContactMode(true)}>
          <FontAwesome5 name="user-plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : 
        contacts.length > 0 ? (
        <SwipeListView
          refreshControl={
            <RefreshControl
              onRefresh={() => getContacts({ username })}
              refreshing={isLoading}
              tintColor={Colors.primary} />
          }
          data={contacts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={ (rowData, rowMap) => {
            return (
              <TouchableWithoutFeedback 
                style={{ marginTop: 10, borderRadius: 5, overflow: 'hidden' }} 
                onPress={() => {
                  navigation.navigate('ChatDetail', {
                    username: rowData.item.user.username,
                    image: rowData.item.user.profile ? rowData.item.user.profile.imgPath : '',
                    type: 'private'
                  })
                }}>
                <View 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center', 
                    paddingVertical: 2, 
                    paddingHorizontal: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F0F0',
                    marginHorizontal: 20
                  }}
                >
                  <View style={{ overflow: 'hidden', width: 48, height: 48, borderRadius: 24}}>
                    {rowData.item.user.profile ?
                      <Image 
                        style={{ width: 48, height: 48 }} 
                        placeholderStyle={styles.placeholder}
                        source={{ uri: rowData.item.user.profile.imgPath }}
                        /> : 
                      <Image style={{ width: 48, height: 48 }} source={require('../../assets/avatar-small.png')} />
                    }
                  </View>                  
                  <View style={styles.itemContainer}>
                    <HeadingText style={styles.name}>{rowData.item.user.username}</HeadingText>
                  </View>
                 
                  <View style={styles.badge} />
                </View>
              </TouchableWithoutFeedback>
            );
          }}
          renderHiddenItem={ (rowData, rowMap) => {
            <View style={styles.rowBack}>
             <TouchableOpacity style={{ }} onPress={() => {}}>
                <View style={{
                  backgroundColor: Colors.secondary,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  marginHorizontal: 10,
                  alignItems: 'center',
                  justifyContent: 'center' }}>
                    <AntDesign name="pushpin" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ }} onPress={() => {}}>
                <View style={{
                  backgroundColor: Colors.tertiary,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  marginHorizontal: 10,
                  alignItems: 'center',
                  justifyContent: 'center' }}>
                    <Entypo name="trash" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          }}
          leftOpenValue={65}
          rightOpenValue={-65}
          onSwipeValueChange={onSwipeValueChange}
           />
        ) : (
        <View style={styles.imageContainer}>
          <ScaleImageAnim style={styles.image} source={require('../../assets/icons_256_contact.png')} />
          <TranslateFadeViewAnim>
            <BodyText style={styles.imageCaption}>Stay in touch with your loved ones</BodyText>
          </TranslateFadeViewAnim>
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
    paddingVertical: 20,
  },
  name: {
    fontSize: 16,
    color: Colors.primary
  },
  textButton: {
    fontSize: 22,
    color: 'white'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 15
  },
  background: {
    width: '100%',
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 0,
    left: 0,
    height: 80
  },
  header: {
    fontSize: 22,
    paddingBottom: 20,
    marginTop: 15,
    paddingLeft: 20,
    color: '#fff'
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
  itemContainer: {
     marginLeft: 20
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
  badge: {
    backgroundColor: '#32CD32', 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    borderWidth: 2, 
    borderColor: 'white',
     position: 'absolute', 
    top: 36, 
    left: 52
  },
   rowBack: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ContactsListScreen;