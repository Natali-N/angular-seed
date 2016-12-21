'use strict';

angular.
    module('gamesInfo').
    component('gamesInfo', {
        templateUrl: 'games-info/games-info.template.html',
        controller: ['GamesService',
            function CurrentGameController(GamesService) {
                var self = this;
                this.gameStatistics = false;

                function calculatePrecision(arr) {
                    return Math.abs(arr[0]-arr[1]) + Math.abs(arr[1]-arr[2]) + Math.abs(arr[2]-arr[0]);
                }

                function updateStatistics() {
                    var games = GamesService.getAll();

                    function isFinished(game) {
                        return game.status > 0;
                    }

                    if (!games.some(isFinished)) {
                        self.gameStatistics = true;
                        return;
                    }

                    self.players = {};

                    games.forEach(function(game) {
                        if (game.status) {

                            game.players.forEach(function(playerName) {

                                if ( !(playerName in self.players)) {
                                    self.players[playerName] = {
                                        name: playerName,
                                        bestThrow: 0,
                                        worstThrow: 0,
                                        bestPrecision: [],
                                        worstPrecision: [],
                                        winner: [],
                                        games: []
                                    };

                                    self.players[playerName].bestThrow = game.bestThrow[playerName];
                                    self.players[playerName].worstThrow = game.worstThrow[playerName];
                                    self.players[playerName].bestPrecision = game.bestPrecision[playerName];
                                    self.players[playerName].worstPrecision = game.worstPrecision[playerName];

                                } else {
                                    if (self.players[playerName].bestThrow > game.bestThrow[playerName]) {
                                        self.players[playerName].bestThrow = game.bestThrow[playerName];
                                    }

                                    if (self.players[playerName].worstThrow < game.worstThrow[playerName]) {
                                        self.players[playerName].worstThrow = game.worstThrow[playerName];
                                    }

                                    if (calculatePrecision(self.players[playerName].bestPrecision) < calculatePrecision(game.bestPrecision[playerName])) {
                                        self.players[playerName].bestPrecision = game.bestPrecision[playerName];
                                    }

                                    if (calculatePrecision(self.players[playerName].worstPrecision) > calculatePrecision(game.worstPrecision[playerName])) {
                                        self.players[playerName].worstPrecision = game.worstPrecision[playerName];
                                    }
                                }

                                self.players[playerName].games.push(game.title);

                                for (var z=0; z<game.winners.length; z++) {
                                    if (game.winners[z] === playerName) {
                                        self.players[playerName].winner.push(game.title)
                                    }

                                }
                            }, self);
                        }
                    }, self);
                }

                updateStatistics();
            }
        ]
    });
