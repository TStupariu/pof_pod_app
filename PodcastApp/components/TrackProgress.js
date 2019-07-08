import React from 'react';
import { ProgressComponent } from "react-native-track-player";
import {View} from "react-native";
import Slider from 'react-native-slider'

class TrackProgress extends ProgressComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <View style={{ height: 40, width: '100%' }}>
        <Slider value={this.getProgress()} onSlidingComplete={this.props.onSeek} />
      </View>
    );
  }
}

TrackProgress.propTypes = {};

export default TrackProgress;
