import React, { useState } from 'react';
import { View, TouchableWithoutFeedback, Image, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { MaterialIcons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import PrimaryButton from './PrimaryButton';
import BodyText from './BodyText';

const ImgPicker = props => {
  const [pickedImage, setPickedImage] = useState(null);

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

    setPickedImage(image.uri);
    props.onImageTaken(image.uri);
  };

  return (
    <View style={styles.imagePickerContainer}>
      <TouchableWithoutFeedback onPress={imageSelected}>
        <View style={styles.imagePreview}>
          {pickedImage ?
            <Image source={{ uri: pickedImage}} style={styles.image} /> : 
            <Image source={require('../../assets/avatar2.png')} style={styles.image} />
          }
          <View style={styles.cameraIconContainer}>
            <MaterialIcons style={styles.cameraIcon} name="camera-alt" size={36} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  imagePickerContainer: {
    alignItems: 'center'
  },
  imagePreview: {
    width: '100%',
    height: 150,
    marginBottom: 40,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: 'white'
  },
  cameraIconContainer: {
    backgroundColor: 'lightgrey',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
    top: '80%',
    right: 0,
    padding: 5
  }
});

export default ImgPicker;