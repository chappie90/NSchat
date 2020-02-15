import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Image,
  StyleSheet,
  FlatList, 
  ScrollView, 
  Text, 
  Button,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Modal, 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ContactsContext } from '../context/ContactsContext';
import ScaleImageAnim from '../components/animations/ScaleImageAnim';
import TranslateFadeViewAnim from '../components/animations/TranslateFadeViewAnim';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';

const AddGroupScreen = props => {
  const { state: { contacts }, getContacts } = useContext(ContactsContext);
  const { state: { username } } = useContext(AuthContext);
  const [groupName, setGroupName] = useState('');
  const [checked, setChecked] = useState(false);
  const [search, setSearch] = useState('');
  const [addToGroupArr, setAddToGroupArr] = useState([]);

  useEffect(() => {
    getContacts({ username });
  }, []);

  const updateGroupHandler = contactName => {
    if (addToGroupArr.includes(contactName)) {
      setAddToGroupArr(prevState => addToGroupArr.filter(contact => contact !== contactName));
    } else {
      setAddToGroupArr(prevState => addToGroupArr.concat(contactName));
    }
  };

  return (
    <Modal visible={props.visible} transparent={true} animationType="slide">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <HeadingText style={styles.heading}>New Group</HeadingText>
              <TouchableOpacity onPress={() => props.closeModal()}>
                <MaterialIcons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerMiddle}>
              <TouchableOpacity onPress={() => {}}>
                <View style={{ 
                  height: 40, 
                  width: 40, 
                  borderRadius: 20, 
                  backgroundColor: 'indianred',
                  justifyContent: 'center',
                  alignItems: 'center' }}> 
                  <MaterialIcons color="#ffe6f2" name="camera-alt" size={26} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ }} onPress={() => {}}>
                <View style={{ 
                  height: 36, 
                  width: 105,
                  borderRadius: 4,
                  marginHorizontal: 5,
                  backgroundColor: 'indianred',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center' }}> 
                  <MaterialIcons color="#ffe6f2" name="search" size={28} />
                   <TextInput
                      style={styles.searchInput}
                      selectionColor={'white'}
                      placeholder="Search"
                      placeholderTextColor="white"
                      value={search}
                      onChangeText={(contact) => setSearch(contact)}
                      autoCapitalize="none"
                      autoCorrect={false} />
                  </View>
              </TouchableOpacity>
              <TextInput
                style={styles.input} 
                selectionColor={'white'}
                placeholder="Group Name"
                placeholderTextColor="white"
                value={groupName}
                onChangeText={(name) => setGroupName(name)}
                autoCapitalize="none"
                autoCorrect={false} />
            </View>
          </View>
      <View style={{ flex: 1 }}>
      {contacts.length > 0 ? (
        <FlatList
          data={contacts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity 
                style={{ marginTop: 10, borderRadius: 5, overflow: 'hidden' }} 
                onPress={() => updateGroupHandler(item.user.username)}>
                <View 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2, paddingHorizontal: 15}}
                >
                  <View style={{ overflow: 'hidden', width: 48, height: 48, borderRadius: 24}}>
                    {item.user.profile ?
                      <Image 
                        style={{ width: 48, height: 48 }} 
                        placeholderStyle={styles.placeholder}
                        source={{ uri: item.user.profile.imgPath }}
                        /> : 
                      <Image style={{ width: 48, height: 48 }} source={require('../../assets/avatar2.png')} />
                    }
                  </View>                  
                  <View style={styles.itemContainer}>
                    <HeadingText style={styles.name}>{item.user.username}</HeadingText>
                  </View>
                  {addToGroupArr.includes(item.user.username) ? (
                    <View style={{
                    width: 24, 
                    height: 24, 
                    borderRadius: 12, 
                    backgroundColor: Colors.tertiary,
                    borderWidth: 2,
                    borderColor: Colors.tertiary }}></View>
                  ) : (
                    <View style={{
                      width: 24, 
                      height: 24, 
                      borderRadius: 12, 
                      borderWidth: 2,
                      borderColor: Colors.tertiary }}></View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }} />
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
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 90
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.tertiary,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    flex: 1,
    textAlign: 'center'
  },
  headerMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemContainer: {
    marginLeft: 15,
    flex: 1
  },
  searchInput: {
    fontSize: 16,
    fontFamily: 'open-sans'
  },  
  input: {
    backgroundColor: 'indianred',
    color: '#fff',
    paddingHorizontal: 15,
    height: 36,
    borderRadius: 4,
    fontSize: 16,
    fontFamily: 'open-sans',
    flex: 1,
    marginRight: 8
  },
  image: {
    width: 100,
    height: 100
  },
    imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80
  },
   imageCaption: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    color: '#000'
  },
});

export default AddGroupScreen;