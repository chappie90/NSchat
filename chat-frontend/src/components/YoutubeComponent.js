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
  const [activeVideo, setActiveVideo] = useState(null);
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const height = useRef(new Animated.Value(0)).current;
  const deviceHeight = Dimensions.get('window').height;
  const bottomNavHeight = getTabBarHeight();

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
      // offset.setValue(100);
      height.setValue(e.nativeEvent.pageY - 50);
    },
    onPanResponderRelease: (e, gestureState) => {
      if (e.nativeEvent.pageY > (deviceHeight - 30 - bottomNavHeight) / 2) {
        Animated.spring(
          height,
          {
            toValue: deviceHeight - 70 - bottomNavHeight
          },
        ).start();
      }
      if (e.nativeEvent.pageY < (deviceHeight - 30 - bottomNavHeight) / 2) {
        Animated.spring(
          height,
          {
            toValue: 0
          },
        ).start();
      }
      height.flattenOffset();
    },
  }), []);

  useEffect(() => {
    if (currentVideo === null) {
      setSearchMode(true);
    }
  }, []);

  const youtubeSearchHander = (term) => {
    getYoutubeResults(term);
    Keyboard.dismiss();
  };

  const playerOnChangeState = event => {
    console.log(event)
    if (event === 'playing') {
      setPlaying(true)
    } else if (event === 'paused') {
      setPlaying(false);
    }
  };

  return (
     <Animated.View
        style={[
          {height: props.isBackground ? '100%' : height, maxHeight: deviceHeight - 70 - bottomNavHeight},
          props.isVisible && props.isBackground ? styles.youtubeBackground : styles.youtubePane
        ]}>
        <Modal
          style={{ alignItems: "center", justifyContent: "center" }}
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
                <TouchableOpacity key={item.etag} onPress={() => {
                  setActiveVideo(item);
                  setSearchMode(false);
                  getCurrentVideo(item.id.videoId);
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
          </View>
        </Modal>
       {/* <WebView
          mediaPlaybackRequiresUserAction={true}
          allowsFullscreenVideo={true} 
          allowsInlineMediaPlayback={true} 
           automaticallyAdjustContentInsets={false}
          style={{ flex: 1 }} source={{ uri: 'https://www.youtube.com' }} /> */}
      {activeVideo && ( 
        <YoutubePlayer
          ref={playerRef}
          height={Dimensions.get('window').width / 1.7778}
          width={'100%'}
          videoId={activeVideo.id.videoId}
          play={playing}
          onChangeState={playerOnChangeState}   
          onReady={() => console.log("ready")}
          onError={e => console.log(e)}
          onPlaybackQualityChange={q => console.log(q)}
          volume={50}
          playbackRate={1}
          playerParams={{
            cc_lang_pref: "us",
            showClosedCaptions: true
          }}
        />
      )}  
      {searchMode && (
        <ScrollView>
          {youtubeResults && youtubeResults.map(item => (
            <TouchableOpacity key={item.etag} onPress={() => {
              // console.log(item)
              setActiveVideo(item);
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
      {!props.isBackground && currentVideo !== null && <View
          { ...panResponder.panHandlers }
          style={[
            styles.youtubeNav
          ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
            {!searchMode && <TouchableOpacity style={{ marginRight: 8 }} onPress={() => setSearchMode(true)}>
              <Ionicons name="ios-search" size={30} color="#989898" />
            </TouchableOpacity>
            }
            {searchMode && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={{ marginRight: 12 }} onPress={() => setSearchMode(false)}>
                  <Ionicons name="ios-close" size={46} color="#989898" />
                </TouchableOpacity>
              </View>
            )}
            {!searchMode && (
              <TouchableOpacity onPress={() => props.youtubeBackgroundHandler(props.isBackground)}>
                <MaterialCommunityIcons name="flip-to-back" size={30} color={props.isBackground ? Colors.tertiary : "#989898"}/>
              </TouchableOpacity>
            )}
             <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => setPlaying(true)}>
              <Ionicons name="ios-play" size={30} color="#989898" />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => setPlaying(false)}>
              <Ionicons name="ios-pause" size={30} color="#989898" />
            </TouchableOpacity>
          </View>
        </View>}
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
    width: '100%',
    height: 40,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10
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
