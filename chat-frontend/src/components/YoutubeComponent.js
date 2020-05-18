import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
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
import { MaterialIcons, MaterialCommunityIcons, Ionicons, AntDesign, EvilIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';
import Modal from "react-native-modal";
import Constants from 'expo-constants';
import { formatDate } from '../helpers/formatDate';
const decode = require('unescape');

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
  const [showYoutubeResults, setShowYoutubeResults] = useState([]);

  const topNavHeight = 50;
  const playerHeightSmall = 50;
  const playerHeightBig = 80;
  const bottomNavHeight = getTabBarHeight();
  const deviceWidth = Dimensions.get('window').width;
  const deviceHeight = Dimensions.get('window').height;
  const playerRatio = 1.78;
  const statusBarHeight = Constants.statusBarHeight;
  const scrollPos = useRef(new Animated.Value(0)).current;
  let initalScrollPos;

  const [videoDuration, setVideoDuration] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

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
      if (e.nativeEvent.pageY >= 130 && e.nativeEvent.pageY <= deviceHeight - topNavHeight - 40) {
        scrollPos.setValue(e.nativeEvent.pageY);
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (e.nativeEvent.pageY < deviceHeight * 1 / 3) {
        Animated.timing(
          scrollPos,
          {
            toValue: topNavHeight + playerHeightBig,
            duration: 100
          },
        ).start();
      }
       if (e.nativeEvent.pageY > deviceHeight * 1 / 3 && e.nativeEvent.pageY < deviceHeight * 2 / 3 ) {
        Animated.timing(
          scrollPos,
          {
            toValue: topNavHeight + deviceWidth / playerRatio + playerHeightSmall,
            duration: 100
          },
        ).start();
      }
      if (e.nativeEvent.pageY > deviceHeight * 2 / 3) {
        Animated.timing(
          scrollPos,
          {
            toValue: deviceHeight - topNavHeight - 40,
            duration: 100
          },
        ).start();
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

    getYoutubeResults('').then(results => {
      setShowYoutubeResults(results.slice(0, 5));
    });

  }, []);

  useEffect(() => {
    if (props.inputFocused) {
      Animated.timing(
        scrollPos,
        {
          toValue: topNavHeight + playerHeightBig,
          duration: 350
        },
      ).start();
    }
  }, [props.inputFocused]);

  const onPlayerReadyHandler = () => {
    if (playerRef.current) {
      playerRef.current.getCurrentTime()
        .then(currentTime => setTimeElapsed(currentTime));
      playerRef.current.getDuration()
        .then(duration => setVideoDuration(duration));
    }
  };

  const youtubeSearchHander = (term) => {
    getYoutubeResults(term).then(results => {
      setShowYoutubeResults(results.slice(0, 5));
    });
    Keyboard.dismiss();
  };

  const playerOnChangeState = event => {
    // console.log(event)
    if (event === 'playing') {
      setPlaying(true);
    } else if (event === 'paused') {
      setPlaying(false);
    }
  };



  // const renderPlayerTime = (seconds) => {
  //   if (seconds < 3600) {
  //     return moment.utc(seconds * 1000).format('m:ss');
  //   } else {
  //     return moment.utc(seconds * 1000).format('HH:mm:ss')
  //   } 
  // };

  return (
     <Animated.View
        style={[
          // {height: props.isBackground ?
          //   '100%' : 
          {
            height: scrollPos.interpolate({
              inputRange: [
                130, 
                topNavHeight + deviceWidth / playerRatio + playerHeightSmall,
                deviceHeight - topNavHeight
              ],
              outputRange: [
                playerHeightBig, 
                topNavHeight + deviceWidth / playerRatio,
                deviceHeight - topNavHeight - statusBarHeight
              ]
            }),
            width: '100%'
          },
          props.isVisible && props.isBackground ? styles.youtubeBackground : styles.youtubePane
        ]}>
        <Modal
          style={{ alignItems: "center", justifyContent: "center", marginHorizontal: 10, marginVertical: 35 }}
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
                <EvilIcons name="close" size={34} color="#989898" />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder="Search YouTube"
                placeholderTextColor='#989898'
                autoCorrect={false}
                value={searchTerm}
                onChangeText={setSearchTerm}
               />  
              <TouchableOpacity onPress={() => youtubeSearchHander(searchTerm)}>
                <Ionicons name="ios-arrow-round-forward" size={38} color="#989898" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={showYoutubeResults}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => {
                return (
                  <TouchableWithoutFeedback key={item.etag} onPress={() => {
                    getCurrentVideo(item);
                    setSearchMode(false);
                  }}>
                    <View style={styles.item}>
                      <Image source={{ uri: item.snippet.thumbnails.high.url }} style={styles.img} />
                      <View style={styles.itemInfo}>
                        <HeadingText numberOfLines={3} style={{ flexShrink: 1, fontSize: 16 }}>{decode(item.snippet.title)}</HeadingText>
                        <View style={styles.itemMeta}>
                          <BodyText numberOfLines={2} style={styles.channelTitle}>{decode(item.snippet.channelTitle)}</BodyText>
                          <BodyText style={styles.date}>{formatDate(item.snippet.publishedAt)}</BodyText>
                        </View>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                );
              }}
              onEndReached={() => {
                setShowYoutubeResults([ 
                  ...showYoutubeResults, 
                  ...youtubeResults.slice(showYoutubeResults.length, showYoutubeResults.length + 5) 
                ]);
              }} />  
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
                deviceHeight - topNavHeight
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
                deviceHeight - topNavHeight
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
            // onPlaybackQualityChange={q => console.log(q)}
            volume={50}
            // webViewProps={{allowsInlineMediaPlayback: false}}
            // allowWebViewZoom={true}
            playbackRate={1}
            playerParams={{
              cc_lang_pref: "us",
              showClosedCaptions: true
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
                  deviceHeight - topNavHeight
                ],
                outputRange: [
                  80, 
                  50,
                  50
                ]
              }),
            }
          ]}>
            <Animated.View
              style={{
                 flexDirection: 'row', justifyContent: 'space-around',
                 alignItems: 'center',
                width: scrollPos.interpolate({
                  inputRange: [
                    130, 
                    topNavHeight + deviceWidth / playerRatio + 50,
                    deviceHeight - topNavHeight
                  ],
                  outputRange: [
                    deviceWidth - 80 * playerRatio, 
                    deviceWidth,
                    deviceWidth
                  ]
              })
            }}>
              <Animated.View style={{
                  transform: [
                    { translateX: scrollPos.interpolate({
                      inputRange: [
                        130, 
                        topNavHeight + deviceWidth / playerRatio + 50,
                        deviceHeight - topNavHeight
                      ],
                      outputRange: [
                        30, 
                        10,
                        0
                      ]
                    })}
                  ]
                }}>
             {/*   <View style={{ alignSelf: 'flex-end', marginRight: 14 }}>
                  <BodyText style={{ color: '#989898' }}>{renderPlayerTime(timeElapsed)}</BodyText>
                </View> */}
                <TouchableOpacity onPress={() => setSearchMode(true)}>
                  <Ionicons name="ios-search" size={32} color="#989898" />
                </TouchableOpacity>
              </Animated.View>
  
                <Animated.View style={{
                  transform: [
                    { translateX: scrollPos.interpolate({
                      inputRange: [
                        130, 
                        topNavHeight + deviceWidth / playerRatio + 50,
                        deviceHeight - topNavHeight
                      ],
                      outputRange: [
                        deviceWidth / 8.5, 
                        0,
                        0
                      ]
                    })}
                  ],
                  opacity: scrollPos.interpolate({
                    inputRange: [ 130, 190 ],
                    outputRange: [ 0, 1 ]
                  }),
                  height: scrollPos.interpolate({
                    inputRange: [ 130, 130 ],
                    outputRange: [ 0, 36 ]
                  })
                }}>
                  <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => setPlaying(true)}>
                    <MaterialIcons name="skip-previous" size={36} color="#989898" />
                  </TouchableOpacity>
                </Animated.View> 
                {!playing && (
                  <TouchableOpacity onPress={() => setPlaying(true)}>
                    <Ionicons style={{ left: 2, top: 1.5 }} name="ios-play" size={34} color="#989898" />
                  </TouchableOpacity>
                )}
                {playing && (
                  <TouchableOpacity  onPress={() => setPlaying(false)}> 
                    <Ionicons style={{ top: 1.5 }} name="ios-pause" size={34} color="#989898" />                
                  </TouchableOpacity>
                )}
                 <Animated.View style={{
                  transform: [
                    { translateX: scrollPos.interpolate({
                      inputRange: [
                        130, 
                        topNavHeight + deviceWidth / playerRatio + 50,
                         deviceHeight - topNavHeight
                      ],
                      outputRange: [
                        -deviceWidth / 8.5, 
                        0,
                        0
                      ]
                    })}
                  ],
                  opacity: scrollPos.interpolate({
                    inputRange: [ 130, 190 ],
                    outputRange: [ 0, 1 ]
                  }),
                  height: scrollPos.interpolate({
                    inputRange: [ 130, 130 ],
                    outputRange: [ 0, 36 ]
                  })
                }}>
                  <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => setPlaying(true)}>
                    <MaterialIcons name="skip-next" size={36} color="#989898" />
                  </TouchableOpacity>
                </Animated.View>
  
                <Animated.View style={{
                  transform: [
                    { translateX: scrollPos.interpolate({
                      inputRange: [
                        130, 
                        topNavHeight + deviceWidth / playerRatio + 50,
                        deviceHeight - topNavHeight
                      ],
                      outputRange: [
                        -30, 
                        -10,
                        0
                      ]
                    })}
                  ]
                }}>
                <TouchableOpacity onPress={() => props.youtubeBackgroundHandler(props.isBackground)}>
                  <MaterialCommunityIcons name="flip-to-back" size={32} color={props.isBackground ? Colors.tertiary : "#989898"}/>
                </TouchableOpacity>
               {/* <View style={{ alignSelf: 'flex-end', marginLeft: 14 }}>
                  <BodyText  style={{ color: '#989898' }}>{renderPlayerTime(videoDuration)}</BodyText>
                </View> */}
              </Animated.View>
            </Animated.View>
        </Animated.View>}
        <FlatList
          style={{ marginTop: deviceWidth / playerRatio + 15, flex: 1, marginBottom: 50 }}
          data={showYoutubeResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            return (
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
                    <HeadingText numberOfLines={2} style={{ flexShrink: 1 }}>{decode(item.snippet.title)}</HeadingText>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            );
          }}
          onEndReached={() => {
            setShowYoutubeResults([ 
              ...showYoutubeResults, 
              ...youtubeResults.slice(showYoutubeResults.length, 5) 
            ]);
          }} />
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
    color: '#989898',
    fontSize: 20,
    bottom: 1
  },
  img: {
    width: '100%',
    height: (Dimensions.get('window').width - 20) / 1.333
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
  channelTitle: {
    maxWidth: '60%',
    flexShrink: 1
  }, 
  date: {
    maxWidth: '40%'
  }
});

export default YoutubeComponent;
