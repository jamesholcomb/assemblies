import _                from 'underscore';
import Icon             from 'react-native-vector-icons/Ionicons';
import moment           from 'moment';
import {truncate}       from 'underscore.string';
import Colors           from '../styles/colors';
import Swipeout         from '../third_party/swipeout/index';
import {BASE_URL, DEV, HEADERS} from '../utilities/fixtures';

import React, {
  ScrollView,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableOpacity,
  Dimensions,
  NativeModules,
  InteractionManager,
  ActivityIndicatorIOS,
} from 'react-native';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

export default class EventList extends Component{
  constructor(props){
    super(props);
    let rows = this._mapEvents(props.events);
    if (DEV) {console.log('ROWS', rows, props.events);}
    let ds = new ListView.DataSource({rowHasChanged: (row1, row2) => true})
    this.state = {
      dataSource: ds.cloneWithRows(rows),
      scrollEnabled: true
    }
  }
  _mapEvents(events){
    return events.map((evt) => {
      return {
        event: evt,
        right: [
          {
            text: 'Going',
            type: 'primary',
            onPress: ()=>{
              this._updateEvent(evt, 'going');
            },
          },
          {
            text: 'Maybe',
            type: 'secondary',
            onPress: ()=>{
              this._updateEvent(evt, 'maybe');
            },
          },
          {
            text: 'Not Going',
            type: 'delete',
            onPress: ()=>{
              this._updateEvent(evt, 'not going');
            },
           }
        ]
      }
    })
  }
  _loadData(events){
    let rows = this._mapEvents(events);
    this._updateDataSource(rows);
  }
  componentWillReceiveProps(nextProps){
    if (nextProps.events != this.props.events){
      this._loadData(nextProps.events);
    }
  }
  _going(event){
    let {currentUser} = this.props;
    let attending = event.attending;
    let maybe = event.maybe;
    let notAttending = event.notAttending;
    if (notAttending[currentUser.id]) {
      delete notAttending[currentUser.id];
    }
    if (maybe[currentUser.id]){
      delete maybe[currentUser.id]
    }
    attending[currentUser.id] = true;
    event.attending = attending;
    event.maybe = maybe;
    event.notAttending = notAttending;
    this.props.changeEvent(event);
    fetch(`${BASE_URL}/events/${event.id}`, {
      method    : 'PUT',
      headers   : HEADERS,
      body      : JSON.stringify({
        attending     : attending,
        maybe         : maybe,
        notAttending  : notAttending
      })
    })
    .then((response) => response.json())
    .then((data) => {
      if (DEV) {console.log('RES', data);}
      // let {events} = this.props;
      // let eventIndex = _.indexOf(events.map((evt) => evt.id), event.id)
      // events[eventIndex] = data;
      // this._loadData(events);
    })
    .catch((err) => {
      if (DEV) {console.log('ERR:', err);}
    }).done();
  }
  _maybe(event){
    let {currentUser} = this.props;
    let attending = event.attending;
    let maybe = event.maybe;
    let notAttending = event.notAttending;
    if (attending[currentUser.id]) {
      delete attending[currentUser.id];
    }
    if (notAttending[currentUser.id]){
      delete notAttending[currentUser.id]
    }
    maybe[currentUser.id] = true;
    event.attending = attending;
    event.maybe = maybe;
    event.notAttending = notAttending;
    this.props.changeEvent(event);
    fetch(`${BASE_URL}/events/${event.id}`, {
      method    : 'PUT',
      headers   : HEADERS,
      body      : JSON.stringify({
        attending     : attending,
        maybe         : maybe,
        notAttending  : notAttending
      })
    })
    .then((response) => response.json())
    .then((data) => {
      if (DEV) {console.log('RES', data);}
      // let {events} = this.props;
      // let eventIndex = _.indexOf(events.map((evt) => evt.id), event.id)
      // events[eventIndex] = data;
      // this._loadData(events);
    })
    .catch((err) => {
      if (DEV) {console.log('ERR:', err);}
    }).done();
  }
  _notGoing(event){
    if (DEV) {console.log('NOT GOING EVENT', event);}
    let {currentUser} = this.props;
    let attending = event.attending;
    let maybe = event.maybe;
    let notAttending = event.notAttending;
    if (attending[currentUser.id]) {
      delete attending[currentUser.id];
    }
    if (maybe[currentUser.id]){
      delete maybe[currentUser.id]
    }
    notAttending[currentUser.id] = true;
    event.attending = attending;
    event.maybe = maybe;
    event.notAttending = notAttending;
    this.props.changeEvent(event);
    fetch(`${BASE_URL}/events/${event.id}`, {
      method    : "PUT",
      headers   : HEADERS,
      body      : JSON.stringify({
        attending     : attending,
        maybe         : maybe,
        notAttending  : notAttending
      })
    })
    .then((response) => response.json())
    .then((data) => {
      if (DEV) {console.log('RES', data);}
      // let {events} = this.props;
      // let eventIndex = _.indexOf(events.map((evt) => evt.id), event.id)
      // events[eventIndex] = data;
      // this._loadData(events);
    })
    .catch((err) => {
      if (DEV) {console.log('ERR:', err);}
    }).done();
  }
  _updateEvent(evt, type){
    if (DEV) {console.log('UPDATE EVENT', evt, type);}
    switch(type) {
      case 'going':
        this._going(evt);
      break;
      case 'maybe':
        this._maybe(evt);
      break;
      case 'not going':
        this._notGoing(evt);
      break;
    }
  }
  _allowScroll(scrollEnabled){
    this.setState({scrollEnabled: scrollEnable})
  }
  _handleSwipeout(sectionID, rowID) {
    for (var i = 0; i < rows.length; i++) {
      if (i != rowID) rows[i].active = false
      else rows[i].active = true
    }
    this._updateDataSource(rows)
  }
  _updateDataSource(data) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data)
    })
  }
  _renderWantToGo(event){
    return (
      <TouchableOpacity onPress={()=>{
          this._updateEvent(event, 'going')
        }}>
        <Icon name="plus-circled" size={30} color={Colors.brandPrimary}/>
      </TouchableOpacity>
    )
  }
  _renderRow(rowData: string, sectionID: number, rowID: number) {
    let {currentUser} = this.props;
    let attending = rowData.event.attending;
    let notAttending = rowData.event.notAttending;
    let maybe = rowData.event.maybe;
    let going = !! attending[currentUser.id];
    let goingCount = Object.keys(attending).length;
    let maybeCount = Object.keys(maybe).length;
    return (
      <Swipeout
        backgroundColor="white"
        rowID={rowID}
        right={rowData.right}
        sectionID={sectionID}>
        <View style={styles.eventContainer}>
          <TouchableOpacity style={styles.eventInfo}
            onPress={()=>{
              this.props.navigator.push({
                name    : 'Event',
                event   : rowData.event,
                group   : this.props.group,
              })
            }}
          >
            <Text style={styles.h5}>{rowData.event.name}</Text>
            <Text style={styles.h4}>{moment(rowData.event.start).format('dddd, MMM Do')}</Text>
            <Text style={styles.h4}>{goingCount} Going, {maybeCount} maybe</Text>
          </TouchableOpacity>
          <View style={styles.goingContainer}>
            <Text style={styles.goingText}>{!! going ? "You're Going" : "Want to go?"}</Text>
            {going ? <Icon name="checkmark-circled" size={30} color={Colors.brandPrimary} /> : this._renderWantToGo(rowData.event) }
          </View>
        </View>
      </Swipeout>
    )
  }
  render(){
    let {group, currentUser, events, navigator} = this.props;
    if (DEV) {console.log('EVENT LIST', this.state.dataSource);}
    return (
      <View style={styles.container}>
        <View style={styles.statusbar}/>
        <ListView
          scrollEnabled={this.state.scrollEnabled}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow.bind(this)}
          style={styles.listview}/>
      </View>
    )
  }
}

let styles = StyleSheet.create({
  backButton: {
    paddingLeft: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  addButton: {
    backgroundColor: 'transparent',
    paddingRight: 20,
    paddingBottom: 10,
  },
  topImage: {
    width: deviceWidth,
    height: 200,
    flexDirection: 'column',
  },
  overlayBlur: {
    backgroundColor: '#333',
    opacity: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  container: {
    backgroundColor: '#f2f2f2',
    flex: 1,
  },
  listview: {
    flex: 1,
  },
  li: {
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderColor: 'transparent',
    borderWidth: 1,
    paddingLeft: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  liContainer: {
    flex: 2,
  },
  liText: {
    color: '#333',
    fontSize: 16,
  },
  navbar: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderColor: 'transparent',
    borderWidth: 1,
    justifyContent: 'center',
    height: 44,
  },
  navbarTitle: {
    color: '#444',
    fontSize: 16,
    fontWeight: "500",
  },
  statusbar: {
    backgroundColor: '#fff',
    height: 22,
  },
  h1: {
    fontSize: 22,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomPanel: {
    flex: 0.3,
    backgroundColor: 'white',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberText: {
    textAlign: 'center',
    color: Colors.brandPrimary,
    fontSize: 18,
    fontWeight: '400',
  },
  h4: {
    fontSize: 16,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  h3: {
    fontSize: 18,
    color: Colors.brandPrimary,
    paddingHorizontal: 18,
    paddingVertical: 5,
    fontWeight: '500',
  },
  break: {
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginHorizontal: 15,
    marginVertical: 5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '300',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  eventContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  joinContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: Colors.brandPrimary,
  },
  joinText: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlign: 'center',
  },
  joinIcon: {
    paddingVertical: 10,
  },
  eventInfo: {
    flex: 1,
  },
  h5: {
    fontSize: 18,
    fontWeight: '400',
  },
  goingContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goingText: {
    fontSize: 17,
    color: Colors.brandPrimary
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  avatar: {
    height: 70,
    width: 70,
    borderRadius: 35,
  },
  memberInfo: {
    paddingLeft: 30,
  },
});
