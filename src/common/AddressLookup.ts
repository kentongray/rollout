import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";

const storageKey = 'previousLocations';

/**
 * Handles getting location data from street address or coordinates
 **/
@Injectable()
export class AddressLookup {
  private $http;

  public previousLocations: FindAddressCandidatesResult[] = [];

  constructor($http: Http) {
    this.$http = $http;
    const storedLocations = localStorage.getItem(storageKey);
    if (storedLocations != null) {
      try {
        this.previousLocations = JSON.parse(storedLocations);
      } catch (e) {
        console.error('Corrupted local storage for key ' + storageKey + '. Clearing');
        localStorage.removeItem(storageKey);
      }

    }
  }

  addPreviousLocation(location: FindAddressCandidatesResult) {
    console.log('adding a location', location);
    this.previousLocations = this.previousLocations
      .filter(l => l.address != location.address)
      .slice(0, 4);
    this.previousLocations.unshift(location);
    localStorage.setItem(storageKey, JSON.stringify(this.previousLocations));
  }

  /**
   * Used to add the location to the top of the list
   * @param {FindAddressCandidatesResult} location
   */
  moveLocationToFront(location: FindAddressCandidatesResult) {
    this.addPreviousLocation(location);
  }

  lookupCoordinates(suggestion, addToPrevious = true) {
    if (!suggestion) {
      return Promise.reject(null);
    }
    return this.$http.get(`http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?&Address=${suggestion.text}&State=TX&f=json&City=Houston&maxLocations=10&maxResultSize=1&outFields=StreetType&magicKey=${suggestion.magicKey}&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson`)
      .map(res => res.json())
      .toPromise()
      .then((r: { candidates: FindAddressCandidatesResult[] }) => {
        if (r.candidates.length) {
          const location = r.candidates[0];
          this.addPreviousLocation(location);
          return r.candidates[0].location;
        }
        else {
          throw "Address Coordinates Not Found";
        }
      });
  }

  lookupAddress(address) {
    //http://mycity.houstontx.gov/ArcGIS10/rest/services/addresslocators/COH_COMPOSITE_LOCATOR_WM/GeocodeServer/findAddressCandidates?&Address=1904%20Oakdale&State=TX&f=json&City=Houston&maxLocations=10&maxResultSize=1&outFields=StreetType
    //http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=oakdale&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson
    return this.$http.get(`http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${address}&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson`)
      .map(res => res.json())
      .toPromise()
      .then((r) => r.suggestions);
  }
}