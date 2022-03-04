import { Controller } from "@hotwired/stimulus"
import mapboxgl from "mapbox-gl"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"

export default class extends Controller {
  static values = {
    apiKey: String,
    markers: Array
  }

  static targets = [ 'noSearch', "latitude", "longitude" ]

  connect() {
    // Initialize MapBox.
    mapboxgl.accessToken = this.apiKeyValue
    this.map = new mapboxgl.Map({
      container: this.element,
      style: "mapbox://styles/ayanorii/cl05huof2003o15nuivl7b2y7"
    })

    this.#addMarkersToMap()
    // this.#fitMapToMarkers()

    // Adds the search box if the current page is not /incidents/:id.
    if (!this.isInShowPage()) {
      this.map.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      }))
    }

    // Adds a current location button.
    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }));
    const latitude = document.querySelector(".latitude")
    const longitude = document.querySelector(".longitude")
    this.map.on('result', e => {
        latitude.value = e.result.center[0]
        longitude.value = e.result.center[1]
        console.log(e.result.center);
    });
    this.addMapInputToForm()
  }

  // When adding a new report, gets the the input from MapBox search box and inserts into the simple form.
  addMapInputToForm(){
    const input = document.querySelector(".mapboxgl-ctrl-geocoder--input")
    input.addEventListener("keyup", (e) => {
      document.getElementById("incident_location").value = e.currentTarget.value
    })
    input.addEventListener("change", (e) => {
      document.getElementById("incident_location").value = e.currentTarget.value
    })
  }

  isInShowPage() {
    return (/incidents\/\d+/).test(window.location.pathname);
  }
/* --------------------------------- Private -------------------------------- */
  #addMarkersToMap() {
    this.markersValue.forEach((marker) => {
      const popup = new mapboxgl.Popup(
        {
          closeOnClick: false,
          closeButton: false
        }).setHTML(
          `<a href="incidents/${marker.id}?path=map" class="mapbox-icon"></a>`
        )

      const emptyMarker = document.createElement('div');

      new mapboxgl.Marker(emptyMarker)
        .setLngLat([marker.lng, marker.lat])
        .addTo(this.map)
        .setPopup(popup)
        .togglePopup();
    });
  }

  #fitMapToMarkers() {
    const bounds = new mapboxgl.LngLatBounds()
    this.markersValue.forEach(marker => bounds.extend([ marker.lng, marker.lat ]))
    this.map.fitBounds(bounds, { padding: 70, maxZoom: 15, duration: 0 })
  }
}
