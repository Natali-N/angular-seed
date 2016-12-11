'use strict';

angular.
    module('dartsApp').
    config(['$locationProvider' ,'$routeProvider',
        function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.
                when('/current-game', {
                    template: '<current-game></current-game>'
                }).
                when('/games-info', {
                    template: '<games-info></games-info>'
                }).
                otherwise('/current-game');
        }
    ]);