import React, {Component} from 'react';
import {Text, View} from "react-native";
import Voice from 'react-native-voice'

class AudioListener extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    try {
      Voice.start('en-US')
      Voice.onSpeechResults = this.handleSpeechResult
    } catch (e) {
      console.log('ERROR', e)
    }
  }

  handleSpeechResult = (data) => {
    const transcript = data.value[0]
    console.log(transcript)
  }

  render() {
    return (
      <View>
        <Text>Listener HERE</Text>
      </View>
    );
  }
}

AudioListener.propTypes = {};

export default AudioListener;
