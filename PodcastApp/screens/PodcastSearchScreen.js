import React, {Component} from 'react';
import {Button, FlatList, Image, Text, TextInput, TouchableOpacity, View} from "react-native";

class PodcastSearchScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchQuery: 'Zero',
      podcasts: [],
    };
  }

  handleTextChange = (text) => {
    this.setState({
      searchQuery: text
    })
  }

  handleSearch = async () => {
    const { searchQuery } = this.state
    if (searchQuery) {
      const result = await fetch(`https://itunes.apple.com/search?entity=podcast&term=${encodeURI(searchQuery)}`)
      const resultJS = await result.json()
      const podcasts = resultJS ? resultJS.results : []
      this.setState({
        podcasts
      })
    }
  }

  handlePodcastPress = (item) => () => {
    this.props.navigation.navigate('TrackSearch', {data: item})
  }

  renderPodcastItem = ({ item }) => {
    const { trackName, artworkUrl60, artistName } = item
    return (
      <TouchableOpacity style={{ flex: 1, flexDirection: 'row', height: 60 }} onPress={this.handlePodcastPress(item)}>
        <Image source={{uri: artworkUrl60}} style={{ height: 60, width: 60 }}/>
        <View style={{ justifyContent: 'center', marginLeft: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>{trackName}</Text>
          <Text>{artistName}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    console.log(this.state)
    const { podcasts } = this.state
    return (
      <View>
        <View>
          <TextInput
            style={{ borderColor: 'red', borderBottomWidth: 5, height: 40, padding: 5, color: 'black' }}
            placeholder={'Search...'}
            onChangeText={this.handleTextChange}
            value={this.state.searchQuery}
          />
          <Button title={'Search'} onPress={this.handleSearch} />
        </View>
        <FlatList data={podcasts} renderItem={this.renderPodcastItem} keyExtractor={item => item.trackId.toString()}/>
      </View>
    );
  }
}

PodcastSearchScreen.propTypes = {};

export default PodcastSearchScreen;
