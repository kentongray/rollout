import {Injectable}  from 'angular2/core';
import {Http} from "angular2/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
/**
 * Handles getting location data from street address or coordinates
 **/
@Injectable()
export class AddressLookup {
    private $http;
    constructor($http:Http) {
        this.$http = $http;
    }

    lookupCoordinates(suggestion) {
        if(!suggestion) {
            return Promise.reject(null);
        }
        return this.$http.get(`http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?&Address=${suggestion.text}&State=TX&f=json&City=Houston&maxLocations=10&maxResultSize=1&outFields=StreetType&magicKey=${suggestion.magicKey}&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson`)
          .map(res => res.json())
          .toPromise()
          .then((r)=>  r.candidates[0].location);
    }

    lookupAddress(address) {
        //http://mycity.houstontx.gov/ArcGIS10/rest/services/addresslocators/COH_COMPOSITE_LOCATOR_WM/GeocodeServer/findAddressCandidates?&Address=1904%20Oakdale&State=TX&f=json&City=Houston&maxLocations=10&maxResultSize=1&outFields=StreetType
        //http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=oakdale&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson
        return this.$http.get(`http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${address}&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson`)
          .map(res => res.json())
          .toPromise()
          .then((r)=> r.suggestions);
    }
}