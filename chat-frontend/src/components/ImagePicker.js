import React, { useState, useContext, useEffect } from 'react';
import { View, TouchableWithoutFeedback, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Image, Tooltip, Overlay } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';

import Colors from '../constants/colors';
import PrimaryButton from './PrimaryButton';
import BodyText from './BodyText';
import HeadingText from './HeadingText';
import { Context as AuthContext } from '../context/AuthContext';

const ImgPicker = props => {
  const {state: { username, profileImage }, saveImage, getImage} = useContext(AuthContext);
  const [overlayMode, setOverlayMode] = useState(false);

  useEffect(() => {
    getImage(username);
  }, []);

  const getPermissions = async () => {
    // for access to galary CAMERA_ROLL
    const result = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    if (result.status !== 'granted') {
      Alert.alert('You don\'t have required permissions', [{text: 'Okay'}]);
      return false;
    }

    return true;
  };

  const imageSelected = async () => {
    const hasPermission = await getPermissions();
    if (!hasPermission) {
      return;
    } 
    // we get the image when the promise resolves
    const image = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      // aspect: [16, 9]
      // quality: 0.5 // between 0 and 1

    });

    if (!image.uri) {
      return;
    }

    saveImage(username, image.uri);
  };

  return (
    <View style={styles.imagePickerContainer}>
      <View style={styles.profileContainer}>
        <TouchableWithoutFeedback onPress={() => setOverlayMode(true)}>
          <View>
            <View style={styles.imagePreview}>
              {profileImage ?
                <Image 
                  placeholderStyle={styles.placeholder}
                  source={{ uri: profileImage}}
                  style={styles.image} /> : 
                <Image source={require('../../assets/avatar2.png')} style={styles.image} />
              }
            </View>
            <Overlay
              isVisible={overlayMode}
              width="auto"
              height="auto"
              onBackdropPress={() => setOverlayMode(false)}>
                <View style={styles.overlayContainer}>
                  <View style={styles.overlayItem}>
                    <MaterialIcons color="#6495ED" name="camera-alt" size={26} />
                    <BodyText style={styles.overlayText}>Take Photo</BodyText>
                  </View>
                  <View style={styles.overlayItem}>
                    <Ionicons color="#6495ED" name="md-images" size={26} />
                    <BodyText style={styles.overlayText}>Choose Photo</BodyText>
                  </View>
                  <View style={styles.overlayItem}>
                    <AntDesign color={Colors.tertiary} name="delete" size={26} />
                    <BodyText style={styles.overlayDelete}>Delete Photo</BodyText>
                  </View>
                  <View style={styles.cancel}>
                    <TouchableOpacity onPress={() => setOverlayMode(false)}>
                      <BodyText style={styles.cancelText}>Cancel</BodyText>
                    </TouchableOpacity>
                  </View>
                </View>
            </Overlay>
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
    padding: 15,
    paddingBottom: 10,
  },
  overlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginBottom: 10,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1 
  },
  overlayText: {
    fontSize: 18,
    marginLeft: 8,
    color: '#6495ED'
  },
  overlayDelete: {
    fontSize: 18,
    marginLeft: 8,
    color: Colors.tertiary
  },
  cancel: {
    marginTop: 15,
    padding: 5,
    alignSelf: 'center',
  },
  cancelText: {
    color: 'grey',
    fontSize: 18
  }
});

export default ImgPicker;