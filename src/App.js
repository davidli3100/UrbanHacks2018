import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer,
  Marker
} = require("react-google-maps");
const { compose, withProps, lifecycle } = require("recompose");
const google = window.google;


var currentPos = {
  lat: 0,
  lng: 0
};

/**
 * icon pics
 * traffic lights: https://image.flaticon.com/icons/svg/1167/1167993.svg
 */



const MyMapComponent = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDwSW_09He1CaVw65Btpn0p4VKrLMCZibE&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap,
  lifecycle({
    componentDidMount() {
      const DirectionsService = new google.maps.DirectionsService();
      new google.maps.
      DirectionsService.route({
        origin: new google.maps.LatLng(currentPos.lat, currentPos.lng),
        destination: new google.mapsznc.LatLng(41.8525800, -87.6514100),
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result,            
          });
          console.log(result)
        } else {
          console.error(`error fetching directions ${result}`);
        }
      });
    }
  })
)((props) =>
  <GoogleMap
    defaultZoom={8} 
    defaultCenter={currentPos}
    center={currentPos}
    // center={this.props.center}
  >
    {console.log(props.directions)}
    {props.directions && <DirectionsRenderer directions={props.directions} />}
    {props.isMarkerShown && <Marker position={currentPos} onClick={props.onMarkerClick} />}
  </GoogleMap>
);

class RouteSelector extends Component {
  constructor(props) {
    super(props)
    this.state= {

    }
  }
  handleSubmit = (event) => {
      event.preventDefault()
      console.log(this.startingNode.value)
      console.log(this.destinationNode.value)
      this.setState({
          navigationProps: {
              start: this.startingNode.value,
              destination: this.destinationNode.value
          }
      })     
  }
  render() {
      return (
          <div className="selector-container" >
          <form id="address-form" onSubmit={this.handleSubmit}>
              <div className="starting-container">
                  <span className="label col-sm-4">Start</span>
                  <div className="destination-div col-sm-8">
                  <input ref={node => (this.startingNode = node)} name="startingLocation" type="text"className="starting-field location-field" placeholder="Choose a starting point"></input>
                  </div>          
              </div>
              <div className="destination-container">
                  <span className="label col-sm-4">Destination</span>
                  <div className="destination-div col-sm-8">
                  <input ref={node => (this.destinationNode = node)} name="destinationLocation" type="text"className="destination-field location-field" placeholder="Choose a destination"></input>
                  </div>
              </div>
              <div className="submit-btn-container">
                  <button type="submit" className="submit-btn">Navigate</button>    
              </div>
          </form>
          </div>
      )
  }
}
  
class App extends Component {
  state = {
    isMarkerShown: false,
  }

  componentWillMount() {
    this.getGeoLocation()
    console.log(currentPos);
  }

  componentDidMount() {
    this.delayedShowMarker()
  }

  delayedShowMarker = () => {
    setTimeout(() => {
      this.setState({ isMarkerShown: true })
    }, 3000)
  }
 
  handleSubmit = (event) => {
    event.preventDefault()
    console.log(this.startingNode.value)
    console.log(this.destinationNode.value)
    this.setState({
        navigationProps: {
            start: this.startingNode.value,
            destination: this.destinationNode.value
        }
    })     
}

  handleMarkerClick = () => {
    this.setState({ isMarkerShown: false })
    this.delayedShowMarker();
  }

  drawDirections = () => {

  }

  getGeoLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
              console.log(position.coords);
              currentPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }
        )
    }
    else {
      console.log(' location error')
    }
    console.log(currentPos);
  }

  render() {
    const posMarker = {
      position: 'absolute',
      transform: 'translate(-50%, -50%)'
    }
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '75vh', posMarker}}>
        <div style={{ width: '50vw'}}>
           <div className="selector-container" >
          <form id="address-form" onSubmit={this.handleSubmit}>
              <div className="starting-container">
                  <span className="label col-sm-4">Start</span>
                  <div className="destination-div col-sm-8">
                  <input ref={node => (this.startingNode = node)} name="startingLocation" type="text"className="starting-field location-field" placeholder="Choose a starting point"></input>
                  </div>          
              </div>
              <div className="destination-container">
                  <span className="label col-sm-4">Destination</span>
                  <div className="destination-div col-sm-8">
                  <input ref={node => (this.destinationNode = node)} name="destinationLocation" type="text"className="destination-field location-field" placeholder="Choose a destination"></input>
                  </div>
              </div>
              <div className="submit-btn-container">
                  <button type="submit" className="submit-btn">Navigate</button>    
              </div>
          </form>
          </div>
        </div>        
        <MyMapComponent
        isMarkerShown={true}
        onMarkerClick={this}
      />
      </div>
    )
  }
}

export default App;