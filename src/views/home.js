import React, { Component } from 'react';


/**
 * open data
 * /


 /**
  * actual react components here
  */
class RouteSelector extends Component {
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

export default class Viewer extends Component {
    render() {
        return (
            <div style={{ width: '50vw'}}>
            <RouteSelector/>
            </div>
        )
    }
} 