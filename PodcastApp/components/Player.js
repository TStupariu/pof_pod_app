import React, {Component} from 'react';
import {Button, Image, SafeAreaView, Text, View} from "react-native";
import TrackPlayer from "react-native-track-player";
import TrackProgress from "./TrackProgress";

class Player extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  async componentDidMount() {
    const { audioTrack, description, id, title, image, author } = this.props.data
    const track = {
      id: id.toString(),
      url: audioTrack,
      title: title,
      artist: author,
      artwork: image
    }
    await TrackPlayer.add([track]);
    await TrackPlayer.play();
  }

  handlePause = async () => {
    await TrackPlayer.pause()
  }

  handlePlay = async () => {
    await TrackPlayer.play()
  }

  handleSeek = async (percentage) => {
    const duration = await TrackPlayer.getDuration()
    await TrackPlayer.seekTo(percentage * duration)
  }

  render() {
    const { audioTrack, description, id, title, image, author } = this.props.data
    return (
      <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image source={{uri: image}} style={{ height: 200, width: 200 }} />
        <Text style={{ fontSize: 20 }}>{title}</Text>
        <TrackProgress onSeek={this.handleSeek}/>
        <Button
          onPress={this.handlePause}
          title={'Pause'}
        />
        <Button
          onPress={this.handlePlay}
          title={'Play'}
        />
        <Text>{description}</Text>
      </SafeAreaView>
    );
  }
}

Player.propTypes = {};

export default Player;
