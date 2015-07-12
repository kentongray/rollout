export class LocationsCtrl {
    constructor($scope, $ionicLoading, $sce) {
        $scope.mapType = "electronics";
        $scope.types = [
            {code: 'electronics', name: 'Electronics'},
            {code: 'oil', name: 'Oil'}, {
                code: 'plastics',
                name: 'Plastics'
            }, {code: 'groceryBags', name: 'Grocery Bags'},
            {code: 'cardboard', name: 'Cardboard'}];
        this.$inject = ['$scope', '$ionicLoading'];
        $scope.maps = {
            electronics: $sce.trustAsResourceUrl("http://m.arcgis.com/apps/Embed/index.html?webmap=" + "858d1f87e2874ad79eaef0af7fd12b7f" + "&extent=-95.5763,29.687,-95.2207,29.878&zoom=true&scale=true&theme=light"),
            cardboard: $sce.trustAsResourceUrl("http://m.arcgis.com/apps/Embed/index.html?webmap=" + "67510ecf5a3c4bef8aa30a4d4ae996f5" + "&extent=-95.5763,29.687,-95.2207,29.878&zoom=true&scale=true&theme=light"),
            aerosalCans: $sce.trustAsResourceUrl("http://m.arcgis.com/apps/Embed/index.html?webmap=" + "14c28a9ac5014ec3a98aa8f9735c6e5d" + "&extent=-95.5763,29.687,-95.2207,29.878&zoom=true&scale=true&theme=light"),
            groceryBags: $sce.trustAsResourceUrl("http://m.arcgis.com/apps/Embed/index.html?webmap=" + "5dd9a4d919024f5783e583e59a061ac5" + "&extent=-95.5763,29.687,-95.2207,29.878&zoom=true&scale=true&theme=light"),
            oil: $sce.trustAsResourceUrl("http://m.arcgis.com/apps/Embed/index.html?webmap=" + "0e6d204a195e48989d1cc475db7be115" + "&extent=-95.5763,29.687,-95.2207,29.878&zoom=true&scale=true&theme=light"),
            plastics: $sce.trustAsResourceUrl("http://m.arcgis.com/apps/Embed/index.html?webmap=" + "510ae9a04de94a929da2a8d896983078" + "&extent=-95.5763,29.687,-95.2207,29.878&zoom=true&scale=true&theme=light")
        };

        $scope.$watch('mapType', function (newValue, oldValue) {
            console.log($scope.mapType, newValue);
            $scope.mapUrl = $sce.trustAsResourceUrl("http://m.arcgis.com/apps/Embed/index.html?webmap=" + $scope.maps[$scope.mapType] + "&extent=-95.5763,29.687,-95.2207,29.878&zoom=true&scale=true&theme=light");
        }, true);

    }
}