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
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';

import Colors from '../constants/colors';
import youtubeApi from '../api/youtube';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import { Context as YoutubeContext } from '../context/YoutubeContext';
import { getTabBarHeight } from '../components/TabBarComponent';

const YoutubeComponent = (props) => {
  const { state: { youtubeResults }, getYoutubeResults } = useContext(YoutubeContext);
  const [searchTerm, setSearchTerm] = useState('');
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

  const youtubeSearchHander = (term) => {
    getYoutubeResults(term);
  };

  return (
     <Animated.View
        style={[
          {height: props.isBackground ? '100%' : height, maxHeight: deviceHeight - 70 - bottomNavHeight},
          props.isVisible && props.isBackground ? styles.youtubeBackground : styles.youtubePane
        ]}>
       {/* <WebView
          mediaPlaybackRequiresUserAction={true}
          allowsFullscreenVideo={true} 
          allowsInlineMediaPlayback={true} 
           automaticallyAdjustContentInsets={false}
          style={{ flex: 1 }} source={{ uri: 'https://www.youtube.com' }} /> */}
        {/*} <YoutubePlayer
            ref={playerRef}
            height={Dimensions.get('window').width / 1.7778}
            width={'100%'}
            videoId={item.id.videoId}
            play={playing}
            onChangeState={event => console.log(event)}   
            onReady={() => console.log("ready")}
            onError={e => console.log(e)}
            onPlaybackQualityChange={q => console.log(q)}
            volume={50}
            playbackRate={1}
            playerParams={{
              cc_lang_pref: "us",
              showClosedCaptions: true
            }}
          />*/}
      <ScrollView>
        {youtubeResults && youtubeResults.map(item => (
          <View style={styles.item} key={item.etag}>
            <Image source={{ uri: item.snippet.thumbnails.high.url }} style={styles.img} />
            <View style={styles.itemInfo}>
              <HeadingText>{item.snippet.title}</HeadingText>
              <View style={styles.itemMeta}>
                <BodyText style={styles.channelTitle}>{item.snippet.channelTitle}</BodyText>
                <BodyText>{item.snippet.publishedAt.split('T')[0]}</BodyText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      {!props.isBackground && <View
          { ...panResponder.panHandlers }
          style={[
            styles.youtubeNav
          ]}>
          <View style={{ flexDirection: 'row', width: '90%' }}>
            <TouchableOpacity onPress={() => youtubeSearchHander(searchTerm)}>
              <Ionicons name="ios-search" size={30} color="#989898" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search videos"
              placeholderTextColor='#202020'
              autoCorrect={false}
              value={searchTerm}
              onChangeText={setSearchTerm}
             />  
            <TouchableOpacity onPress={() => youtubeSearchHander(searchTerm)}>
              <BodyText>Submit</BodyText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => props.youtubeBackgroundHandler(props.isBackground)}>
            <MaterialCommunityIcons name="flip-to-back" size={30} color={props.isBackground ? Colors.tertiary : "#989898"}/>
          </TouchableOpacity>
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
    width: '80%'
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
