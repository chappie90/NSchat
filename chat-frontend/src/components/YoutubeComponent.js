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
import { Context as YoutubeContext } from '../context/YoutubeContext';

const YoutubeComponent = () => {
  const { state: { youtubeResults }, getYoutubeResults } = useContext(YoutubeContext);
  const [searchTerm, setSearchTerm] = useState('');
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const youtubeApiKey = 'AIzaSyAlGNuBDZvq0M4LCK3S2Joly3JGwRObMcc';

  const youtubeSearchHander = (term) => {
    getYoutubeResults(term);
  };

  return (
    <View style={styles.container}>
        <View style={{ flexDirection: 'row', width: '90%' }}>
          <TextInput
            style={styles.youtubeSearchInput}
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
      <YoutubePlayer
        ref={playerRef}
        height={Dimensions.get('window').width / 1.7778}
        width={'100%'}
        videoId={youtubeResults ? youtubeResults[0].id.videoId : ''}
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

export default YoutubeComponent;
