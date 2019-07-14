import React, {Component} from 'react';
import {Button, Text, View} from "react-native";
import Voice from 'react-native-voice'
import Tts from 'react-native-tts'
import { db } from "../firebase";

class AudioListener extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
      isListening: false
    };

    //TTS Configuration
    Tts.setDefaultLanguage('en-US')
    Tts.setIgnoreSilentSwitch("ignore");
    Tts.setDucking(true)

    this.isListeningForComment = false
    this.commentTimeout = null
    this.oldTranscript = null
  }

  componentDidMount() {
    try {
      Voice.start('en-US')
      Voice.onSpeechResults = this.handleSpeechResult
      Voice.onSpeechStart = this.handleSpeechStart
      Voice.onSpeechEnd = this.handleSpeechEnd
      Tts.addEventListener('tts-finish', this.onTTSFinish);
    } catch (e) {
      console.log('ERROR', e)
    }
  }

  handleSpeechEnd = async () => {
    this.setState({
      isListening: false
    })
  }

  handleSpeechStart = async () => {
    this.setState({
      isListening: true
    })
  }


  onTTSFinish = async () => {
    if (this.isListeningForComment) {
      await this.triggerCommentListeningFinish()
    }
  }

  handleSpeechResult = async (data = '') => {
    const transcript = data.value[0]
    //Avoid duplication of execution
    if (transcript === this.oldTranscript) return null
    this.oldTranscript = transcript

    if (this.isListeningForComment) {
      clearTimeout(this.commentTimeout)
      this.commentTimeout = setTimeout(() => this.onCommentEnd(transcript), 1000)
    } else if (transcript.toUpperCase().includes('LEAVE A COMMENT')) {
      await this.triggerCommentListening()
    }
  }

  onCommentEnd = async (transcript) => {
    clearTimeout(this.commentTimeout)
    await Voice.stop()
    this.isListeningForComment = false
    this.setState({
      comment: transcript
    })
    await this.props.handlePlay()
    await Voice.start()
  }

  triggerCommentListening = async () => {
    this.isListeningForComment = true
    await Voice.stop()
    await this.props.handlePause()
    Tts.stop()
    //  Stop playback, TTS playback and reset Voice
    Tts.speak('Speak your comment')
    //  Next part will be picked up and triggered by the onTTSFinish handler
  }

  triggerCommentListeningFinish = async () => {
    await Voice.start()
  }

  submitComment = async () => {
    await this.props.handleLeaveComment(this.state.comment)
    this.setState({
      comment: ''
    })
  }

  render() {
    return (
      <View>
        <Text>Comment: {this.state.comment}</Text>
        {
          this.state.comment
            ? <Button title={'Submit'} onPress={this.submitComment} />
            : null
        }
        {
          this.state.isListening
            ? <Text>Listening ....</Text>
            : <Text>NOT Listening ....</Text>
        }
      </View>
    );
  }
}

AudioListener.propTypes = {};

export default AudioListener;
