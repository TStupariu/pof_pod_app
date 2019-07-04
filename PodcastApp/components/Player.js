import React, {Component} from 'react';
import {SafeAreaView, Text, View} from "react-native";
import TrackPlayer from "react-native-track-player";

class Player extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  async componentDidMount() {
    console.log(this.props)
    const { audioTrack, description, id, title } = this.props.data
    console.log(audioTrack, description, id, title)
    const track = {
      id: id.toString(), // Must be a string, required
      url: audioTrack, // Load media from the network
      title: title,
      //TODO: Get artist and artwork
      artist: 'GG'
      // artwork: 'http://example.com/avaritia.png', // Load artwork from the network
    };
    await TrackPlayer.add([track]);
    await TrackPlayer.play();
  }

  render() {
    const { data } = this.props
    return (
      <SafeAreaView>
        <Text>{data.title}</Text>
      </SafeAreaView>
    );
  }
}

Player.propTypes = {};

export default Player;
