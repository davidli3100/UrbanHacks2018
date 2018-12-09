import React, { Component } from 'react';
import math from 'mathjs'
import parser from 'geojson-tools';
// import logo from './logo.svg';
import composeState from 'compose-state';

import './App.css';
import { watchFile, close } from 'fs';
import { MAP, KML_LAYER } from 'react-google-maps/lib/constants';

const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer,
  Marker,
  KmlLayer
} = require("react-google-maps");
const { compose, withProps, lifecycle } = require("recompose");
// var firebase = require('firebase');

// const {googleDrive} = require('googleapis');

const axios = require('axios')
const google = window.google;
const fetch = require('node-fetch');
const routing = require("./routing")
const https = require('https')
var polyline = require('polyline')
const ToKML = require('tokml')
var GeoJSON = require('geojson');
// var createFile = require('create-file');
var fileSystem = require('fs');

var resRoute;
var routeSegs = [];
var closeLights = [];
var closeLightsGeo;
var closeLightsKml;
var stopLights = require('./Traffic_Signals')
var custState = {};

/**
 * manually get and parse geojson data 
 **/

var time = 0;
var timePrev = 0;
 
var currentPos = {
  lat: 43.2557,
  lng: -79.8711
};

// var config = {
//   apiKey: "AIzaSyBMTaXD08HK0EqfXcZMIX5Au1Lo_ZwcCeE",
//   authDomain: "hammermaps-177a3.firebaseapp.com",
//   databaseURL: "https://hammermaps-177a3.firebaseio.com",
//   projectId: "hammermaps-177a3",
//   storageBucket: "hammermaps-177a3.appspot.com",
//   messagingSenderId: "685736535853"
// };
// firebase.initializeApp(config);
// var storage = firebase.storage();
// var storageRef = storage.ref()
// var trafficKmlRef = storageRef.child('traffic.kml')

// var file = closeLightsKml // use the Blob or File API

/**
 * icon pics
 * traffic lights: https://image.flaticon.com/icons/svg/1167/1167993.svg
 **/


function sqr (x) {
  return x * x;
}

function dist2 (v, w) {
  return sqr(v[0] - w[0]) + sqr(v[1] - w[1]);
}

// p - point
// v - start point of segment
// w - end point of segment
function distToSegmentSquared (p, v, w) {
  var l2 = dist2(v, w);
  if (l2 === 0) return dist2(p, v);
  var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, [ v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]) ]);
}

// p - point
// v - start point of segment
// w - end point of segment
function distToSegment (p, v, w) {
  return Math.sqrt(distToSegmentSquared(p, v, w));
}
console.log(distToSegment([0,0], [5,1], [-2,1]))



const MyMapComponent = compose(

  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDwSW_09He1CaVw65Btpn0p4VKrLMCZibE&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `100vh` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap,
  lifecycle({
    componentWillMount(){
      // const refs = MAP ? { GoogleMap } : {};
      // this.setState({
      //   onMapWillMount: ref => {
      //     refs.map = ref;
      //     const currentMap = refs.map;
      //     (window).googleMapsObject = currentMap.context[MAP];
      //     //load the GeoJson to the map
      //     refreshDataFromGeoJson(currentMap);
      //     //set props.currentMap 
      //     this.setState({currentMap: currentMap});
      //   }
      // })
      // console.log(custState)
    },
    componentDidMount() {
      console.log(this.props.origin, this.props.destination)
      var DirectionsService = new google.maps.DirectionsService();
      DirectionsService.route({
        origin: new google.maps.LatLng(currentPos.lat, currentPos.lng),
        destination: new google.maps.LatLng(43.2609, -79.9192),
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result,            
          });
          console.log(result);
          resRoute = polyline.decode(result.routes[0].overview_polyline);
          console.log(resRoute);
          for(var i = 0; i < resRoute.length-1; i++) {
            routeSegs.push({
              lat1: resRoute[i][0],
              lng1: resRoute[i][1],
              lat2: resRoute[i+1][0],
              lng2: resRoute[i+1][1]
            }
            )
          }
          console.log(routeSegs);
        } else {
          console.error(`error fetching directions ${result}`);
        }
      });
      

    }, 

  })
)((props) => 
  <GoogleMap
    defaultZoom={8} 
    defaultCenter={currentPos}
    center={currentPos}
    ref={props.onMapWillMount}
    // center={this.props.center}
  >
      <KmlLayer
      url="https://raw.githubusercontent.com/davidli3100/UrbanHacks2018/master/src/traffic.kmz"
    />
      <KmlLayer
      url="https://raw.githubusercontent.com/davidli3100/UrbanHacks2018/master/src/pedestrian.kml"
    />

    <KmlLayer url="https://raw.githubusercontent.com/davidli3100/UrbanHacks2018/master/src/stop.kml"
    />
    {console.log(props.directions)}
    {props.directions && <DirectionsRenderer directions={props.directions} />}
    {props.isMarkerShown && <Marker position={currentPos} onClick={props.onMarkerClick} />}
  </GoogleMap>
);


const refreshDataGeo = function (currentMap) {
  let newData = new google.maps.Data();

      let overlay = newData.addGeoJson(closeLightsGeo);

      newData.setMap(currentMap.context[MAP]);
}

const refreshDataFromGeoJson=function (currentMap) {
  if (!currentMap) {
    return;
  }
   // Call the Data class in the initial google map API
  let newData = new google.maps.Data();

  // Define the GeoJson object
  try {

    // Call the addGeoJson from the Data class 
    let newFeatures = newData.addGeoJson(closeLightsGeo)
    console.log(closeLightsGeo);
  } catch (error) {
    console.log(error)
    newData.setMap(null);
    return;
  }

  // Set the data to the current map 
  newData.setMap(currentMap.context[MAP]);
}

// class RouteSelector extends Component {
//   constructor(props) {
//     super(props)
//     this.state= {

//     }
//   }
//   handleSubmit = (event) => {
//       event.preventDefault()
//       console.log(this.startingNode.value)
//       console.log(this.destinationNode.value)
//       this.setState({
//           navigationProps: {
//               start: this.startingNode.value,
//               destination: this.destinationNode.value
//           }
//       })     
//   }
//   render() {
//       return (
//           <div className="selector-container" >
//           <form id="address-form" onSubmit={this.handleSubmit}>
//               <div className="starting-container">
//                   <span className="label col-sm-4">Start</span>
//                   <div className="destination-div col-sm-8">
//                   <input ref={node => (this.startingNode = node)} name="startingLocation" type="text"className="starting-field location-field" placeholder="Choose a starting point"></input>
//                   </div>          
//               </div>
//               <div className="destination-container">
//                   <span className="label col-sm-4">Destination</span>
//                   <div className="destination-div col-sm-8">
//                   <input ref={node => (this.destinationNode = node)} name="destinationLocation" type="text"className="destination-field location-field" placeholder="Choose a destination"></input>
//                   </div>
//               </div>
//               <div className="submit-btn-container">
//                   <button type="submit" className="submit-btn">Navigate</button>    
//               </div>
//           </form>
//           </div>
//       )
//   }
// }
  
class App extends Component {
  state = {
    isMarkerShown: false,
    navigationProps: {
      origin: new google.maps.LatLng()
    }
  }
  
  // pathfinder() {
  //   resRoute.routes[0].overview_path.forEach(element => {
  //     var shit = routing.pair(element.lat, element.lng);
  //     var shit = distToSegment() //new function, takes 3 points
      
  //   });
  // }

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

  getDestinationGeocode(originCoding, destinationVal) {
    console.log('getting')
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(destinationVal) + '&key=AIzaSyDwSW_09He1CaVw65Btpn0p4VKrLMCZibE')
    .then(res => res.json()).then(result => {
      console.log(result);
      var startLat = originCoding.results[0].geometry.location.lat
      var startLng = originCoding.results[0].geometry.location.lng
      var destinationLat = result.results[0].geometry.location.lat
      var destinationLng = result.results[0].geometry.location.lng
      this.setState({
        navigationProps: {
          origin: new google.maps.LatLng(startLat,startLng),
          destination: new google.maps.LatLng(destinationLat, destinationLng)
        }
      });
      console.log(this.state)
      timePrev = time;
      time++;
    })

  }
 
  handleSubmit = (event) => {
    event.preventDefault()
    console.log(this.startingNode.value)
    console.log(this.destinationNode.value)
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(this.startingNode.value) + '&key=AIzaSyDwSW_09He1CaVw65Btpn0p4VKrLMCZibE')
    .then(res => res.json()).then(data => {
     console.log(data); 
    this.getDestinationGeocode(data, this.destinationNode.value)
    }     
    )
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

    for(var i =0; i < stopLights.features.length; i++) {
      for(var j = 0; j < routeSegs.length; j++) {
        var foobar = distToSegment([stopLights.features[i].properties.LATITUDE, stopLights.features[i].properties.LONGITUDE], [routeSegs[j].lat1, routeSegs[j].lng1], [routeSegs[j].lat2, routeSegs[j].lng2])
          if(foobar < 0.0002) {
            // console.log(foobar)
            closeLights.push({
              lat: stopLights.features[i].properties.LATITUDE,
              lng: stopLights.features[i].properties.LONGITUDE
            })
          } 

          
        }
      }
    closeLightsGeo = GeoJSON.parse(closeLights, {Point: ['lat', 'lng']});
    closeLightsKml = ToKML(closeLightsGeo);
    // createFile('./traffic.kml', closeLightsKml, function(err) {
    // }); 

    // var fileContent = closeLightsKml
    // var filepath = "./traffic.kml"
    // fs.writeFile(filepath, fileContent, (err) => {
    //   if (err) throw err;

    //   console.log('saved')
    // })
    // trafficKmlRef.put(fi).then(function(snapshot) {
    //   console.log('Uploaded traffic!');
    // });
    // axios.get('https://developer.nps.gov/api/v0/parks?parkCode=yell', {headers: 'Authorization: AIzaSyDwSW_09He1CaVw65Btpn0p4VKrLMCZibE' })


  //   const drive = googleDrive.drive({
  //     version: 'v3',
  //     auth: 'AIzaSyDwSW_09He1CaVw65Btpn0p4VKrLMCZibE'

  //   });
  //   async function main() {
  //   const res = await drive.files.create({
  //     requestBody: {
  //       name: 'Traffic',
  //       mimeType: 'text/plain'
  //     },
  //     media: {
  //       mimeType: 'application/vnd.google-earth.kml+xml',
  //       body: closeLightsKml
  //     }
  //   });
  // }
  // main()
    console.log(closeLightsKml);
    console.log(closeLightsGeo);
    console.log(closeLights)
    console.log(this.state)
    console.log(stopLights);
    
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '100vh', posMarker}}>
        {/* <div style={{ width: '50vw'}}>
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
    </div>   */}     
        <MyMapComponent
        origin={this.state.navigationProps.origin}
        destination={this.state.navigationProps.destination}
        isMarkerShown={true}
        onMarkerClick={this}
      />
      </div>
    )
  }
}

export default App;