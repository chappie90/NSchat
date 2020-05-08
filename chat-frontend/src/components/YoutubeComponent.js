import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
  PanResponder,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';
import Modal from "react-native-modal";
import Constants from 'expo-constants';

import Colors from '../constants/colors';
import youtubeApi from '../api/youtube';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import { Context as YoutubeContext } from '../context/YoutubeContext';
import { getTabBarHeight } from '../components/TabBarComponent';

const YoutubeComponent = (props) => {
  const {
    state: { youtubeResults, currentVideo }, 
    getYoutubeResults, 
    getCurrentVideo 
  } = useContext(YoutubeContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const height = useRef(new Animated.Value(0)).current;
  const playerHeight = useRef(new Animated.Value(0)).current;
  const playerWidth = useRef(new Animated.Value(0)).current;
  const smallPlayerWidth = useRef(new Animated.Value(0)).current;
  // const showSmallPlayer = useRef(false);
  const [showSmallPlayer, setShowSmallPlayer] = useState(false);



  const topNavHeight = 50;
  const bottomNavHeight = getTabBarHeight();
  const deviceWidth = Dimensions.get('window').width;
  const deviceHeight = Dimensions.get('window').height;
  const playerRatio = 1.78;
  const statusBarHeight = Constants.statusBarHeight;
  const scrollPos = useRef(new Animated.Value(0)).current;
  // const playerControlsPos = useRef(0);
  let initalScrollPos;

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (e, gestureState) => {
    },
    onPanResponderStart: (e, gestureState) => {   

    },
    onPanResponderMove: (e, gestureState) => {
      console.log(e.nativeEvent.pageY + '- native event page Y')
      console.log(bottomNavHeight + ' - bottomNavHeight')
      console.log(deviceHeight + ' - deviceHeight');
      
      // topHeight.setValue(gestureState.moveY > (deviceHeight - 40) ? 40 : deviceHeight - gestureState.moveY);
      // offset.setValue(100);
      if (e.nativeEvent.pageY >= 130 && e.nativeEvent.pageY <= deviceHeight - topNavHeight - bottomNavHeight) {
        scrollPos.setValue(e.nativeEvent.pageY);
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (e.nativeEvent.pageY < deviceHeight * 1 / 3) {
        Animated.spring(
          scrollPos,
          {
            toValue: topNavHeight + 80
          },
        ).start();
      }
       if (e.nativeEvent.pageY > deviceHeight * 1 / 3 && e.nativeEvent.pageY < deviceHeight * 2 / 3 ) {
        Animated.spring(
          scrollPos,
          {
            toValue: topNavHeight + deviceWidth / playerRatio + 50
          },
        ).start();
      }
      if (e.nativeEvent.pageY > deviceHeight * 2 / 3) {
        Animated.spring(
          scrollPos,
          {
            toValue: deviceHeight - topNavHeight - bottomNavHeight
          },
        ).start();
        setShowSmallPlayer(false);
      }
      scrollPos.flattenOffset();
    },
  }), []);

  useEffect(() => {
    if (currentVideo === null) {
      initalScrollPos = topNavHeight + deviceWidth / playerRatio + 50;
      scrollPos.setValue(initalScrollPos);
    } else {
      initalScrollPos = topNavHeight + 80;
      scrollPos.setValue(initalScrollPos);
    }

    getYoutubeResults('');
    if (currentVideo === null) {
      setSearchMode(true);
    } else {
      setShowSmallPlayer(true);
    }
  }, []);

  const youtubeSearchHander = (term) => {
    getYoutubeResults(term);
    Keyboard.dismiss();
  };

  const playerOnChangeState = event => {
    // console.log(event)
    if (event === 'playing') {
      setPlaying(true)
    } else if (event === 'paused') {
      setPlaying(false);
    }
  };

  return (
     <Animated.View
        style={[
          // {height: props.isBackground ?
          //   '100%' : 
          {
            height: scrollPos.interpolate({
              inputRange: [
                130, 
                topNavHeight + deviceWidth / playerRatio + 50,
                deviceHeight - topNavHeight - bottomNavHeight
              ],
              outputRange: [
                80, 
                topNavHeight + deviceWidth / playerRatio,
                deviceHeight - topNavHeight - bottomNavHeight - statusBarHeight
              ]
            }),
          },
          props.isVisible && props.isBackground ? styles.youtubeBackground : styles.youtubePane
        ]}>
        <Modal
          style={{ alignItems: "center", justifyContent: "center", marginHorizontal: 15, marginVertical: 35 }}
          isVisible={searchMode}
          animationIn="fadeIn"
          animationOut="fadeOut"
          animationInTiming={200}
          backdropTransitionOutTiming={0}
          onSwipeComplete={() => setSearchMode(false)}
          swipeThreshold={60}
          // swipeDirection={["left","right"]}  
        >
          <View style={{ backgroundColor: 'white', flex: 1 }}>
            <View style={{ flexDirection: 'row', width: '100%', padding: 15, alignItems: 'center' }}>
              <TouchableOpacity style={{ marginRight: 12 }} onPress={() => {
                setSearchMode(false);
                if (currentVideo === null) {
                  props.isVisibleHandler(false);
                }
              }}>
                <Ionicons name="ios-close" size={46} color="#989898" />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder="Search YouTube"
                placeholderTextColor='#202020'
                autoCorrect={false}
                value={searchTerm}
                onChangeText={setSearchTerm}
               />  
              <TouchableOpacity onPress={() => youtubeSearchHander(searchTerm)}>
                <AntDesign name="arrowright" size={30} color="#989898" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {youtubeResults && youtubeResults.map(item => (
                <TouchableWithoutFeedback key={item.etag} onPress={() => {
                  getCurrentVideo(item);
                  setSearchMode(false);
                  playerWidth.setValue(deviceWidth);
                  playerHeight.setValue(deviceWidth / 1.7778);
                  height.setValue(deviceWidth / 1.7778 + 50);
                }}>
                  <View style={styles.item}>
                    <Image source={{ uri: item.snippet.thumbnails.high.url }} style={styles.img} />
                    <View style={styles.itemInfo}>
                      <HeadingText>{item.snippet.title}</HeadingText>
                      <View style={styles.itemMeta}>
                        <BodyText style={styles.channelTitle}>{item.snippet.channelTitle}</BodyText>
                        <BodyText>{item.snippet.publishedAt.split('T')[0]}</BodyText>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              ))}
            </ScrollView>
          </View>
        </Modal>
      {currentVideo && ( 
        <Animated.View
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            flex: 1,
            zIndex: 2, 
            width: scrollPos.interpolate({
              inputRange: [
                130, 
                topNavHeight + deviceWidth / playerRatio + 50,
                deviceHeight - topNavHeight - bottomNavHeight
              ],
              outputRange: [
                80 * playerRatio, 
                deviceWidth,
                deviceWidth
              ]
            }),  
            height: scrollPos.interpolate({
              inputRange: [
                130, 
                topNavHeight + deviceWidth / playerRatio + 50,
                deviceHeight - topNavHeight - bottomNavHeight
              ],
              outputRange: [
                80, 
                deviceWidth / 1.778,
                deviceWidth / 1.778
              ]
            }),
            opacity: scrollPos.interpolate({
              inputRange: [ 130, deviceWidth / playerRatio - 20, deviceWidth / playerRatio + 50, topNavHeight + deviceWidth / playerRatio + 50 ],
              outputRange: [ 1, 0.5, 0.7, 1 ]
            }) 
        }}>
          <YoutubePlayer
            ref={playerRef}
            height='100%'
            width='100%'
            videoId={currentVideo.id.videoId}
            play={playing}
            onChangeState={playerOnChangeState}   
            onReady={() => console.log("ready")}
            onError={e => console.log(e)}
            onPlaybackQualityChange={q => console.log(q)}
            volume={50}
            playbackRate={1}
            playerParams={{
              cc_lang_pref: "us",
              showClosedCaptions: true,
            }}
          />
        </Animated.View>
      )}  
      {searchMode && (
        <ScrollView>
          {youtubeResults && youtubeResults.map(item => (
            <TouchableOpacity key={item.etag} onPress={() => {
              getCurrentVideo(item);
            }}>
              <View style={styles.item}>
                <Image source={{ uri: item.snippet.thumbnails.high.url }} style={styles.img} />
                <View style={styles.itemInfo}>
                  <HeadingText>{item.snippet.title}</HeadingText>
                  <View style={styles.itemMeta}>
                    <BodyText style={styles.channelTitle}>{item.snippet.channelTitle}</BodyText>
                    <BodyText>{item.snippet.publishedAt.split('T')[0]}</BodyText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {!props.isBackground && currentVideo !== null && <Animated.View
          { ...panResponder.panHandlers }
          style={[
            styles.youtubeNav,
            {
              height: scrollPos.interpolate({
                inputRange: [
                  130, 
                  topNavHeight + deviceWidth / playerRatio + 50,
                  deviceHeight - topNavHeight - bottomNavHeight
                ],
                outputRange: [
                  80, 
                  50,
                  50
                ]
              })
            }
          ]}>
            <Animated.View
             style={{
               flexDirection: 'row', paddingHorizontal: 8, justifyContent: 'space-between',
               alignItems: 'center',
              width: scrollPos.interpolate({
                inputRange: [
                  130, 
                  topNavHeight + deviceWidth / playerRatio + 50,
                  deviceHeight - topNavHeight - bottomNavHeight
                ],
                outputRange: [
                  deviceWidth - 80 * playerRatio, 
                  deviceWidth,
                  deviceWidth
                ]
              })
            }}>
               <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => setPlaying(true)}>
                <Ionicons name="ios-play" size={34} color="#989898" />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => setPlaying(false)}>
                <Ionicons name="ios-pause" size={34} color="#989898" />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => setSearchMode(true)}>
                <Ionicons name="ios-search" size={34} color="#989898" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => props.youtubeBackgroundHandler(props.isBackground)}>
                <MaterialCommunityIcons name="flip-to-back" size={34} style={{ marginHorizontal: 8 }} color={props.isBackground ? Colors.tertiary : "#989898"}/>
              </TouchableOpacity>
            </Animated.View>
        </Animated.View>}
      </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  searchInput: {
    flex: 1,
    fontSize: 18
  },
  item: {
    // alignItems: 'center'
  },
  img: {
    width: '100%',
    height: Dimensions.get('window').width / 1.333
  },
  itemInfo: {
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 15
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  youtubeNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
    // paddingHorizontal: 10
  },
  youtubePane: {
    backgroundColor: '#fff',
    width: '100%',
    position: 'absolute',
    left: 0,
    zIndex: 2
  },
  youtubeBackground: {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    bottom: 0, 
    right: 0 
  },
});

export default YoutubeComponent;
