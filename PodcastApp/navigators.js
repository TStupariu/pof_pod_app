import React from "react";
import { View, Text } from 'react-native'
import { createStackNavigator, createAppContainer } from "react-navigation";
import PodcastSearchScreen from "./screens/PodcastSearchScreen";
import TrackSearch from "./screens/TrackSearch";

const EMPTY = () => <View><Text>EMPTY</Text></View>

const routes = {
  PodcastSearch: {
    screen: PodcastSearchScreen,
    navigationOptions: ({ navigation }) => ({
      title: `Podcast Search`,
    }),
  },
  TrackSearch: {
    screen: TrackSearch,
    navigationOptions: ({ navigation }) => ({
      title: `Track Search`,
    }),
  }
}

const MainNavigator = createAppContainer(createStackNavigator(routes, {}))
export default MainNavigator
