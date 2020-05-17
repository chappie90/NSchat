import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
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
import moment from 'moment';

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

  const topNavHeight = 50;
  const bottomNavHeight = getTabBarHeight();
  const deviceWidth = Dimensions.get('window').width;
  const deviceHeight = Dimensions.get('window').height;
  const playerRatio = 1.78;
  const statusBarHeight = Constants.statusBarHeight;
  const scrollPos = useRef(new Animated.Value(0)).current;
  const showResults = useRef(false);
  let initalScrollPos;

  const [videoDuration, setVideoDuration] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [keepTrack, setKeepTrack] = useState(0);

  const timeElapsedRef = useRef(timeElapsed);

  const increment = useCallback(() => {

    setTimeElapsed(timeElapsedRef.current + 1)
  }, [timeElapsed])

  let timer;

  const startTimer = () => {

    timer = setInterval(() => {
      increment()
    }, 1000);
  };


  const stopTimer = () => {
    console.log('timer stoped')
    clearInterval(timer);
  };

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (e, gestureState) => {
    },
    onPanResponderStart: (e, gestureState) => {   

    },
    onPanResponderMove: (e, gestureState) => {      
      // topHeight.setValue(gestureState.moveY > (deviceHeight - 40) ? 40 : deviceHeight - gestureState.moveY);
      if (e.nativeEvent.pageY >= 130 && e.nativeEvent.pageY <= deviceHeight - topNavHeight - bottomNavHeight) {
        scrollPos.setValue(e.nativeEvent.pageY);
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (e.nativeEvent.pageY < deviceHeight * 1 / 3) {
        Animated.timing(
          scrollPos,
          {
            toValue: topNavHeight + 80,
            duration: 100
          },
        ).start();
      }
       if (e.nativeEvent.pageY > deviceHeight * 1 / 3 && e.nativeEvent.pageY < deviceHeight * 2 / 3 ) {
        Animated.timing(
          scrollPos,
          {
            toValue: topNavHeight + deviceWidth / playerRatio + 50,
            duration: 100
          },
        ).start();
         showResults.current = true;
      }
      if (e.nativeEvent.pageY > deviceHeight * 2 / 3) {
        Animated.timing(
          scrollPos,
          {
            toValue: deviceHeight - topNavHeight - bottomNavHeight,
            duration: 100
          },
        ).start();
        showResults.current = true;
      }
      scrollPos.flattenOffset();
    },
  }), []);

  useEffect(() => {
    if (currentVideo === null) {
      initalScrollPos = topNavHeight + deviceWidth / playerRatio + 50;
      scrollPos.setValue(initalScrollPos);
      setSearchMode(true);
    } else {
      initalScrollPos = topNavHeight + 80;
      scrollPos.setValue(initalScrollPos);
    }

    getYoutubeResults('');

  }, []);

  const onPlayerReadyHandler = () => {
    if (playerRef.current) {
      playerRef.current.getCurrentTime()
        .then(currentTime => setTimeElapsed(currentTime));
      playerRef.current.getDuration()
        .then(duration => setVideoDuration(duration));
    }
  };

  const youtubeSearchHander = (term) => {
    getYoutubeResults(term);
    Keyboard.dismiss();
  };

  const playerOnChangeState = event => {
    let timer;
    // console.log(event)
    if (event === 'playing') {
      setPlaying(true);
      startTimer(true);
    } else if (event === 'paused') {
      setPlaying(false);
      stopTimer();
    }
  };



  // useEffect(() => {
  //   const timer = setInterval(() => {  
  //       setTimeElapsed(timeElapsed + 1);
  //     }, 1000)

  //   return () => {
  //     clearInterval(timer);
  //   }
  // }, []);

  const renderPlayerTime = (seconds) => {
    if (seconds < 3600) {
      return moment.utc(seconds * 1000).format('m:ss');
    } else {
      return moment.utc(seconds * 1000).format('HH:mm:ss')
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
            zIndex: 3, 
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
            onReady={onPlayerReadyHandler}
            onError={e => console.log(e)}
            onPlaybackQualityChange={q => console.log(q)}
            volume={50}
            // allowWebViewZoom={true}
            playbackRate={1}
            playerParams={{
              cc_lang_pref: "us",
              showClosedCaptions: true,
            }}
          />
        </Animated.View>
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
               flexDirection: 'row', justifyContent: 'space-between',
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
              <View style={{ paddingVertical: 2, marginHorizontal: 8, flexDirection: 'row', justifyContent: 'space-around'}}>
                <View style={{ alignSelf: 'flex-end', marginRight: 12 }}>
                  <BodyText style={{ color: '#989898' }}>{renderPlayerTime(timeElapsed)}</BodyText>
                </View>
                <TouchableOpacity onPress={() => setSearchMode(true)}>
                  <Ionicons name="ios-search" size={30} color="#989898" />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ marginHorizontal: 2 }} onPress={() => setPlaying(true)}>
                  <MaterialIcons name="skip-previous" size={36} color="#989898" />
                </TouchableOpacity> 
                {!playing && (
                  <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => setPlaying(true)}>
                    <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor:'#989898' }}>
                      <Ionicons style={{textAlign: 'center', top: 3, left: 1}} name="ios-play" size={30} color="#F5F5F5" />
                    </View>
                  </TouchableOpacity>
                )}
                {playing && (
                  <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => setPlaying(false)}>
                    <View style={{width: 38, height: 38, borderRadius: 19, backgroundColor:'#989898' }}>
                      <Ionicons style={{textAlign: 'center', top: 3 }} name="ios-pause" size={30} color="#F5F5F5" />
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={{ marginHorizontal: 2 }} onPress={() => setPlaying(true)}>
                  <MaterialIcons name="skip-next" size={36} color="#989898" />
                </TouchableOpacity>
              </View>
               <View style={{ paddingVertical: 3, marginHorizontal: 8, flexDirection: 'row', justifyContent: 'space-around'}}>
                <TouchableOpacity onPress={() => props.youtubeBackgroundHandler(props.isBackground)}>
                  <MaterialCommunityIcons name="flip-to-back" size={30} color={props.isBackground ? Colors.tertiary : "#989898"}/>
                </TouchableOpacity>
                <View style={{ alignSelf: 'flex-end', marginLeft: 12 }}>
                  <BodyText  style={{ color: '#989898' }}>{renderPlayerTime(videoDuration)}</BodyText>
                </View>
              </View>
            </Animated.View>
        </Animated.View>}
        {showResults.current && <ScrollView
           style={{
              marginTop: deviceWidth / playerRatio + 15,
              flex: 1,
              marginBottom: 50
          }}>
          {youtubeResults && youtubeResults.map(item => (
            <View style={{ marginBottom: 15 }}  key={item.etag}>
              <TouchableWithoutFeedback onPress={() => {
                getCurrentVideo(item);
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, }}>
                  <Image source={{ uri: item.snippet.thumbnails.high.url }} style={{
                      width: deviceWidth / 3,
                      height: ( deviceWidth / 3 ) / playerRatio,
                      marginRight: 15
                  }} />
                  <HeadingText numberOfLines={2} style={{ flexShrink: 1 }}>{item.snippet.title}</HeadingText>
                </View>
              </TouchableWithoutFeedback>
            </View>
          ))}
        </ScrollView>}
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
    left: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    justifyContent: 'flex-end'
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
