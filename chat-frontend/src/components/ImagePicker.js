import React, { useState, useContext, useEffect } from 'react';
import {
  View, 
  TouchableWithoutFeedback, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert
} from 'react-native';
import { Image } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import Modal from "react-native-modal";

import Colors from '../constants/colors';
import PrimaryButton from './PrimaryButton';
import BodyText from './BodyText';
import HeadingText from './HeadingText';
import { Context as AuthContext } from '../context/AuthContext';
import { Context as ProfileContext } from '../context/ProfileContext';

const ImgPicker = props => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { profileImage }, saveImage, getImage, deleteImage } = useContext(ProfileContext);
  const [modalVisible, setModalVisible] = useState(false);

  const modalCloseHandler = () => {
    setModalVisible(false);
  };  

  useEffect(() => {
    getImage(username);
  }, [profileImage]);

  const avatarClickHandler = () => {
    setModalVisible(true);
  };

  const getCameraPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    if (response.status !== 'granted') {
      Alert.alert('You don\'t have the required permissions to access the camera', [{text: 'Okay'}]);
      return false;
    }
    return true;
  };

  const getImageLibraryPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (response.status !== 'granted') {
      Alert.alert('You don\'t have the required permissions to access the image library', [{text: 'Okay'}]);
      return false;
    }
    return true;
  };

  const takePhotoHandler = async () => {
    const hasCameraPermissions = await getCameraPermissions();
    if (!hasCameraPermissions) {
      return;
    }
    const cameraImage = await ImagePicker.launchCameraAsync({
      allowsEditing: true
    });
    if (!cameraImage.uri) {
      return;
    }
    setModalVisible(false);
    saveImage(username, cameraImage.uri);
  };

  const choosePhotoHandler = async () => {
    const hasImageLibraryPermissions = await getImageLibraryPermissions();
    if (!hasImageLibraryPermissions) {
      return;
    }
    const libraryImage = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
    });
    if (!libraryImage.uri) {
      return;
    }
    setModalVisible(false);
    saveImage(username, libraryImage.uri);
  };

  const deletePhotoHandler = () => {
    if (profileImage) {
      deleteImage(username);
    }
    setModalVisible(false);
  };


  return (
    <View style={styles.imagePickerContainer}>
      <Modal
        style={{ alignItems: 'center', justifyContent: 'center'}}
        isVisible={modalVisible}
        onBackdropPress={modalCloseHandler}
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationInTiming={200}
        backdropTransitionOutTiming={0}>
        <View style={styles.overlayContainer}>
          <TouchableOpacity style={styles.overlayItemWrapper} onPress={takePhotoHandler}>
            <View style={styles.overlayItem}>
              <View style={styles.iconWrapper}>
                <MaterialIcons color="white" name="camera-alt" size={24} />
              </View>
              <BodyText style={styles.overlayText}>Take Photo</BodyText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.overlayItemWrapper} onPress={choosePhotoHandler}>
            <View style={styles.overlayItem}>
              <View style={styles.iconWrapper}>
                <Ionicons color="white" name="md-images" size={24} />
              </View>
              <BodyText style={styles.overlayText}>Choose Photo</BodyText>
            </View>  
          </TouchableOpacity>
          <TouchableOpacity style={styles.overlayItemWrapper} onPress={deletePhotoHandler}>
            <View style={styles.overlayItem}>
              <View style={styles.deleteIconWrapper}>
                <AntDesign color="white" name="delete" size={24} />
              </View>
              <BodyText style={styles.overlayDelete}>Delete Photo</BodyText>
            </View>
          </TouchableOpacity>
          <View style={styles.cancel}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <BodyText style={styles.cancelText}>Cancel</BodyText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.profileContainer}>
        <TouchableWithoutFeedback onPress={avatarClickHandler}>
          <View>
            <View style={styles.imagePreview}>
              {profileImage ?
                <Image 
                  placeholderStyle={styles.placeholder}
                  source={{ uri: profileImage }}
                  style={styles.image} /> : 
                <Image source={require('../../assets/avatar2.png')} style={styles.image} />
              }
            </View>   
            <View style={styles.cameraIconContainer}>
              <MaterialIcons style={styles.cameraIcon} name="camera-alt" size={36} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imagePickerContainer: {
    alignItems: 'center'
  },
  profileContainer: {
    marginTop: 30,
    marginBottom: 30,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'white',
    overflow: 'hidden'
  },
  placeholder: {
    backgroundColor: 'white'
  },
  image: {
    width: 200,
    height: 200,
  },
  cameraIconContainer: {
    backgroundColor: 'lightgrey',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
    top: '68%',
    right: 10,
    padding: 5
  },
  overlayContainer: {
    width: 230,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 4
  },
  overlayItemWrapper: {
    marginBottom: 10,
  },
  overlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1 
  },
  overlayText: {
    fontSize: 18,
    marginLeft: 8,
    color: 'grey'
  },
  overlayDelete: {
    fontSize: 18,
    marginLeft: 8,
    color: Colors.tertiary
  },
  iconWrapper: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteIconWrapper: {
    backgroundColor: Colors.tertiary,
    borderRadius: 100,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancel: {
    marginTop: 10,
    padding: 5,
    alignSelf: 'center',
  },
  cancelText: {
    color: 'grey',
    fontSize: 18
  }
});

export default ImgPicker;