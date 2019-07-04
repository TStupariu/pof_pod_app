import React, {Component} from 'react';
import {SafeAreaView, Text, View} from "react-native";

class Player extends Component {
  constructor(props) {
    super(props);

    this.state = {};
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
