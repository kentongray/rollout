export function router($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'templates/home.html',
            controller: 'HomeCtrl as home'
        })

        .state('remindme', {
            url: '/remindme?latitude&longitude',
            controller: 'RemindMeCtrl as remind',
            templateUrl: 'templates/remindme.html'
        })

        .state('locations', {
            url: '/locations',
            templateUrl: 'templates/locations.html',
            controller: 'LocationsCtrl'
        });


    $urlRouterProvider.otherwise('/home');

}