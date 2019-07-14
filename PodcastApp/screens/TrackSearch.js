import React, {Component} from 'react';
import {StyleSheet, FlatList, Image, ScrollView, Text, View, TouchableOpacity, Modal} from "react-native";
import XMLParser from 'react-xml-parser'
import { get } from 'lodash'
import Player from "../components/Player";

class TrackSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracks: [],
      playingTrack: {},
      modalVisible: false,
    };
  }

  getDataFromItem = (item) => {
    return ({
    id: get(item.getElementsByTagName('guid'), '0.value', null),
    title: get(item.getElementsByTagName('title'), '0.value', null),
    description: get(item.getElementsByTagName('description'), '0.value', null),
    audioTrack: get(item.getElementsByTagName('enclosure'), '0.attributes.url', null),
    image: get(item.getElementsByTagName('itunes:image'), '0.attributes.href', null),
    author: get(item.getElementsByTagName('itunes:author'), '0.value', null),
  })}

  async componentDidMount() {
    const data = this.props.navigation.getParam('data')
    const { feedUrl } = data
    const result = await fetch(feedUrl)
    const resultXML = await result.text()
    const xml = new XMLParser().parseFromString(resultXML)
    const xmlTracks = xml.getElementsByTagName('item')
    console.log('???', xmlTracks)
    const tracks = xmlTracks.map(this.getDataFromItem)
    this.setState({
      tracks
    })
  }

  handlePressTrack = (track) => () => {
    console.log('TRACK', track)
    this.setState({
      modalVisible: true,
      playingTrack: track
    })
  }

  renderDescription() {
    const data = this.props.navigation.getParam('data')
    const { trackName, artworkUrl100, artistName } = data
    return (
      <View style={{ alignItems: 'center' }}>
        <Image source={{uri: artworkUrl100}} style={{ height: 150, width: 150, marginBottom: 10 }}/>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{trackName}</Text>
        <Text style={{ fontSize: 16, fontWeight: 'normal' }}>Artist: {artistName}</Text>
      </View>
    )
  }

  renderTrack = ({item, index}) => {
    const {title, description} = item
    return (
      <TouchableOpacity style={styles.trackContainer} onPress={this.handlePressTrack(item)}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{index + 1}: {title}</Text>
        <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: 'normal' }}>{description}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <ScrollView>
        {
          this.renderDescription()
        }
        <FlatList
          data={this.state.tracks}
          renderItem={this.renderTrack}
          keyExtractor={(item, index) => `${item.id}_track${index}`}
        />
        <Modal visible={this.state.modalVisible}>
          <Player data={this.state.playingTrack}/>
        </Modal>
      </ScrollView>
    );
  }
}

TrackSearch.propTypes = {};

const styles = StyleSheet.create({
  trackContainer: {
    padding: 10,
    margin: 5,
    shadowOffset: {
      height: 5,
      width: 5
    },
    shadowColor: 'black',
    shadowOpacity: 0.3,
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 8
  }
})

export default TrackSearch;
