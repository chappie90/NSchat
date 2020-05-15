import React, { useState, useEffect, useContext } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions
} from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import { NavigationEvents } from 'react-navigation';

import TranslateFadeViewAnim from '../components/animations/TranslateFadeViewAnim';
import { Context as AuthContext } from '../context/AuthContext';
import BodyText from '../components/BodyText';
import ScaleImageAnim from '../components/animations/ScaleImageAnim';
import Colors from '../constants/colors';
import HeadingText from '../components/HeadingText';
import PrimaryButton from '../components/PrimaryButton';
import SignupScreen from '../screens/SignupScreen';
import SigninScreen from '../screens/SigninScreen';
import FadeViewAnim from '../components/animations/FadeViewAnim';

const StarterScreen = ({ navigation }) => {
  const { state: { statusBarColor }, setStatusBarColor } = useContext(AuthContext);
  const [signupMode, setSignupMode] = useState(false);
  const [signinMode, setSigninMode] = useState(false);

  const willFocusHandler = () => {
    if (Platform.OS === 'ios') {
      setStatusBarColor(2);
    } 
  }

  const closeModal = () => {
    setSignupMode(false);
    setSigninMode(false);
  };

  const toggleModal = () => {
    if (signinMode) {
      setSigninMode(false);
      setSignupMode(true);
    }
    if (signupMode) {
      setSigninMode(true);
      setSignupMode(false);
    }
  };

  return (
    <View style={styles.container}>
      <NavigationEvents onWillFocus={willFocusHandler} />
      <StatusBar barStyle={statusBarColor === 1 ? 'light-content' : 'dark-content'} />
      <SignupScreen visible={signupMode} toggleModal={toggleModal} closeModal={closeModal} />
      <SigninScreen visible={signinMode} toggleModal={toggleModal} closeModal={closeModal} />
      <ViewPager showPageIndicator={true} style={styles.viewPager} initialPage={0}>
        <View style={styles.page} key="1">
          <View style={styles.imageContainer}>
          <ScaleImageAnim style={styles.image} source={require('../../assets/Hey_Info-01.png')} />
          <TranslateFadeViewAnim>
            <BodyText style={styles.imageCaption}>Stay in touch with your loved ones</BodyText>
          </TranslateFadeViewAnim>
        </View>
        </View>
        <View style={styles.page} key="2">
          <View style={styles.imageContainer}>
        <ScaleImageAnim style={styles.image} source={require('../../assets/Hey_Info-02.png')} />
        <TranslateFadeViewAnim>
          <BodyText style={styles.imageCaption}>Stay in touch with your loved ones</BodyText>
        </TranslateFadeViewAnim>
      </View>
      </View>
        <View style={styles.page} key="3">
          <View style={styles.imageContainer}>
        <ScaleImageAnim style={styles.image} source={require('../../assets/Hey_Info-01.png')} />
        <TranslateFadeViewAnim>
          <BodyText style={styles.imageCaption}>Stay in touch with your loved ones</BodyText>
        </TranslateFadeViewAnim>
      </View>
        </View>
        <View style={styles.page} key="4">
          <View style={styles.imageContainer}>
        <ScaleImageAnim style={styles.image} source={require('../../assets/Hey_Info-02.png')} />
        <TranslateFadeViewAnim>
          <BodyText style={styles.imageCaption}>Stay in touch with your loved ones</BodyText>
        </TranslateFadeViewAnim>
      </View>
        </View>
      </ViewPager>
      <View style={{ alignItems: 'center' }}>
        <PrimaryButton
          style={styles.signupButton} 
          onPress={() => {
            setSignupMode(true);
            setStatusBarColor(2);
          }}>
          Get Started
        </PrimaryButton>
        <TouchableOpacity style={styles.signinButton} onPress={() => {
            setSigninMode(true);
            setStatusBarColor(2);
          }}>
          <HeadingText style={styles.signinButtonText}>Sign In</HeadingText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

StarterScreen.navigationOptions = {
  header: null
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#202020',
    backgroundColor: '#F0F0F0',
    paddingVertical: 8
  },
  viewPager: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#202020'
    backgroundColor: '#F0F0F0'
  },
  textWrapper: {
    flexDirection: 'row'
  },
  textLeft: {
    fontSize: 30,
    color: Colors.primary
  },
  textRight: {
    fontSize: 30
  },
  signupButton: {
    textAlign: 'center',
    paddingHorizontal: 8,
     marginBottom: 12
  },
  signinButton: {
    padding: 10,
    marginBottom: 10
  },
  signinButtonText: {
    fontSize: 20,
    textAlign: 'center',
    // color: '#fff'
    color: '#202020'

  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
   image: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').width * 0.75
  },
   imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
    imageCaption: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    // color: '#fff'
    color: '#202020'
  },
});

export default StarterScreen;
