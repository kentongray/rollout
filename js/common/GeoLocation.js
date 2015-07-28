/**
 * Handles getting location data from street address or coordinates
 **/
export class GeoLocation {
    constructor($http, $q) {
        this.$http = $http;
        this.$q = $q;
    }

    lookupCoordinates(suggestion) {
        if(!suggestion) {
            return this.$q.reject();
        }
        return this.$http.get(`http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?&Address=${suggestion.text}&State=TX&f=json&City=Houston&maxLocations=10&maxResultSize=1&outFields=StreetType&magicKey=${suggestion.magicKey}&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson`)
            .then((r)=> {console.log(r);return r.data.candidates[0].location});
    }

    lookupAddress(address) {
        //http://mycity.houstontx.gov/ArcGIS10/rest/services/addresslocators/COH_COMPOSITE_LOCATOR_WM/GeocodeServer/findAddressCandidates?&Address=1904%20Oakdale&State=TX&f=json&City=Houston&maxLocations=10&maxResultSize=1&outFields=StreetType
        //http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=oakdale&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson
        return this.$http.get(`http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${address}&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson`)
        .then((r)=> r.data.suggestions);
    }
}