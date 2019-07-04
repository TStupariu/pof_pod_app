import React, {Component} from 'react';
import {View} from 'react-native';
import MainNavigator from "./navigators";

export default class App extends Component<Props> {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <MainNavigator />
      </View>
    );
  }
}
