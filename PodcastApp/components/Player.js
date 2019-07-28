import React, {Component} from 'react';
import {Button, Image, SafeAreaView, Text, View} from "react-native";
import TrackPlayer from "react-native-track-player";
import TrackProgress from "./TrackProgress";
import AudioListener from "./AudioListener";
import {db, sanitize} from "../firebase";

class Player extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interactions: {}
    };
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
    await TrackPlayer.add([track])
    // await TrackPlayer.play()
    const snap = await db.ref(`interactions/${sanitize(id)}`).once('value')
    if (snap.exists) {
      const data = snap.val()
      const interactions = {}
      Object.keys(data).forEach(key => {
        const item = data[key]
        interactions[key/1000000] = item
      })
      this.setState({
        interactions
      })
    }
    const endScreenSnap = await db.ref(`endScreens/${sanitize(id)}`).once('value')
    if (endScreenSnap.exists) {
      const data = endScreenSnap.val()
      console.log(data, this.props.tracks)
      this.setState({
        endScreen: {
          track1: {
            key: data.track1,
            ...this.props.tracks.find(track => track.id === data.track1)
          },
          track2: {
            key: data.track2,
            ...this.props.tracks.find(track => track.id === data.track2)
          }
        }
      })
    }
  }

  handlePollAnswer = (option = 'option1', pollTime = null) => {
    const { id } = this.props.data
    console.log(option, pollTime)
    db.ref(`interactions/${sanitize(id)}/${pollTime * 1000000}/picks`).push(option)
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

  setVolume = async (value) => {
    await TrackPlayer.setVolume(value)
  }

  handleLeaveComment = async (comment) => {
    if (comment) {
      const { audioTrack, description, id, title, image, author } = this.props.data
      const time = await TrackPlayer.getPosition()

      await db
        .ref(`comments/${sanitize(id)}`)
        .update({ [sanitize(time.toFixed(6))]: comment })
    }
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
        <AudioListener
          handlePause={this.handlePause}
          handlePlay={this.handlePlay}
          handleLeaveComment={this.handleLeaveComment}
          interactions={this.state.interactions}
          endScreen={this.state.endScreen}
          handlePollAnswer={this.handlePollAnswer}
        />
      </SafeAreaView>
    );
  }
}

Player.propTypes = {};

export default Player;
