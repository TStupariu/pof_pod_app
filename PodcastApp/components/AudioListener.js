import React, {Component} from 'react';
import {Button, Image, Modal, SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import Voice from 'react-native-voice'
import Tts from 'react-native-tts'
import { db } from "../firebase";
import TrackPlayer, {ProgressComponent} from "react-native-track-player";
import { get } from 'lodash'

class AudioListener extends ProgressComponent {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
      isListening: false,
      isEndScreen: false,
    };

    //TTS Configuration
    Tts.setDefaultLanguage('en-US')
    Tts.setIgnoreSilentSwitch("ignore");
    Tts.setDucking(true)

    this.isListeningForComment = false
    this.isListeningForPollOption = false
    this.commentTimeout = null
    this.oldTranscript = null
    this.nextInteraction = null
    this.oldInteraction = null
    this.generator = null
  }

  componentDidUpdate(prevProps) {
    if (prevProps.interactions !== this.props.interactions) {
      this.listenForInteractions(this.props.interactions)
    }
  }

  componentDidMount() {
    setInterval(this.checkForInteraction, 500)
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

  checkForInteraction = async () => {
    const position = await TrackPlayer.getPosition()
    const duration = await TrackPlayer.getDuration()
    if (this.nextInteraction) {
      if (this.nextInteraction && Math.abs(position - this.nextInteraction.time) < 1) {
        this.triggerPollSequence(this.nextInteraction)
        this.setNextInteraction()
      }
    }
    console.log(this.state.isEndScreen, position, duration)
    if (!this.state.isEndScreen && position && duration && Math.abs(position - await TrackPlayer.getDuration()) < 5) {
      console.log('WTF')
      this.setState({
        isEndScreen: true,
      })
    }
  }

  triggerPollSequence = async (poll) => {
    await this.props.handlePause()
    await Voice.cancel()
    await this.handleSpeechEnd()
    Tts.speak(`Question: ${poll.name}`)
    Tts.speak(`First Option: ${poll.option1}`)
    Tts.speak(`Second Option: ${poll.option2}`)
    Tts.speak(`Say the number you want to choose:`)
    await Voice.start()
    this.isListeningForPollOption = true
  }

  listenForInteractions(interactions) {
    this.generator = this.getInteraction(interactions)
    this.setNextInteraction()
  }

  *getInteraction(interactions) {
    for (let key of Object.keys(interactions)) {
      yield {...interactions[key], time: key}
    }
  }


  setNextInteraction = () => {
    const next = this.generator.next()
    this.oldInteraction = this.nextInteraction
    if (!next.done) {
      this.nextInteraction = next.value
    } else {
      this.nextInteraction = null
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

    console.log(transcript, ' > ', this.isListeningForPollOption)
    if (this.isListeningForPollOption) {
      this.onPollEnd(transcript)
    } else if (this.isListeningForComment) {
      clearTimeout(this.commentTimeout)
      this.commentTimeout = setTimeout(() => this.onCommentEnd(transcript), 1000)
    } else if (transcript.toUpperCase().includes('LEAVE A COMMENT')) {
      await this.triggerCommentListening()
    }
  }

  onCommentEnd = async (transcript) => {
    clearTimeout(this.commentTimeout)
    await Voice.cancel()
    await this.handleSpeechEnd()
    this.isListeningForComment = false
    this.setState({
      comment: transcript
    })
    await this.props.handlePlay()
    try {
      await Voice.start()
    } catch (e) {
      console.log('NOT WORKING')
    }
  }

  onPollEnd = async (transcript) => {
    if (transcript.includes('one') || transcript.includes('two')) {
      await Voice.cancel()
      await this.handleSpeechEnd()
      this.isListeningForPollOption = false
      await this.props.handlePlay()
      try {
        await Voice.start()
      } catch (e) {
        console.log('NOT WORKING')
      }
      this.props.handlePollAnswer(transcript.includes('one') ? 'option1' : 'option2', this.oldInteraction.time)
    }
  }

  triggerCommentListening = async () => {
    this.isListeningForComment = true
    await Voice.cancel()
    await this.handleSpeechEnd()
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
    const { track1, track2 } = get(this, 'props.endScreen', {})
    return (
      <View>
        <Modal visible={this.state.isEndScreen}>
          <SafeAreaView>
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Image source={{uri: track1 ? track1.image : null }} style={{ height: 300, width: 300 }} />
              <Text>{track1 ? track1.title : null}</Text>
              <Text>{track1 ? track1.author : null}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 30 }}>
              <Image source={{uri: track2 ? track2.image : null }} style={{ height: 300, width: 300 }} />
              <Text>{track2 ? track2.title : null}</Text>
              <Text>{track2 ? track2.author : null}</Text>
            </TouchableOpacity>
            <Button title={'Close'} onPress={() => this.setState({ isEndScreen: false })}/>
          </SafeAreaView>
        </Modal>
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
