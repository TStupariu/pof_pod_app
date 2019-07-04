import React, {Component} from 'react';
import {View} from 'react-native';
import MainNavigator from "./navigators";
import TrackPlayer from "react-native-track-player";

export default class App extends Component {
  async componentDidMount() {
    await TrackPlayer.setupPlayer()
    TrackPlayer.updateOptions({
      capabilities:        [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_STOP,
      ],
      compactCapabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_STOP,
      ],
    });
    TrackPlayer.registerPlaybackService(() => require('./service.js'));
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MainNavigator />
      </View>
    );
  }
}
