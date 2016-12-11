'use strict';

angular.
    module('common.gamesService').
    factory('GamesService', ['$window',
        function($window) {

            var storage = $window.localStorage;

            function toString(value) {
                return JSON.stringify(value);
            }

            function parse(string) {
                return JSON.parse(string);
            }

            return {
                getAll: function() {
                    var games = [];

                    for (var i = 0; i < storage.length; i++) {
                        games.push( this.get(localStorage.key(i)) );
                        //is get working
                    }

                    return games;
                },

                clear: function(){
                    storage.clear();
                },

                get: function(key) {
                    return parse( storage.getItem(key) );
                },

                remove: function(key){
                    storage.removeItem(key);
                },

                set: function(key, value) {
                    storage.setItem(key, toString(value));
                }
            }

        }
    ]);


