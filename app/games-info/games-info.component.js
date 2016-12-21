'use strict';

angular.
    module('gamesInfo').
    component('gamesInfo', {
        templateUrl: 'games-info/games-info.template.html',
        controller: ['GamesService',
            function CurrentGameController(GamesService) {

                this.gameStatistics = false;

                function calculatePrecision(arr) {
                    return Math.abs(arr[0]-arr[1]) + Math.abs(arr[1]-arr[2]) + Math.abs(arr[2]-arr[0]);
                }

                this.updateStatistics = function() {
                    var games = GamesService.getAll();

                    function isFinished(game) {
                        return game.status > 0;
                    }

                    if (!games.some(isFinished)) {
                        this.gameStatistics = true;
                        return;
                    }

                    this.players = {};

                    games.forEach(function(game) {
                        if (game.status) {

                            game.players.forEach(function(playerName) {

                                if ( !(playerName in this.players)) {
                                    this.players[playerName] = {
                                        name: playerName,
                                        bestThrow: 0,
                                        worstThrow: 0,
                                        bestPrecision: [],
                                        worstPrecision: [],
                                        winner: [],
                                        games: []
                                    };

                                    this.players[playerName].bestThrow = game.bestThrow[playerName];
                                    this.players[playerName].worstThrow = game.worstThrow[playerName];
                                    this.players[playerName].bestPrecision = game.bestPrecision[playerName];
                                    this.players[playerName].worstPrecision = game.worstPrecision[playerName];

                                } else {
                                    if (this.players[playerName].bestThrow > game.bestThrow[playerName]) {
                                        this.players[playerName].bestThrow = game.bestThrow[playerName];
                                    }

                                    if (this.players[playerName].worstThrow < game.worstThrow[playerName]) {
                                        this.players[playerName].worstThrow = game.worstThrow[playerName];
                                    }

                                    if (calculatePrecision(this.players[playerName].bestPrecision) < calculatePrecision(game.bestPrecision[playerName])) {
                                        this.players[playerName].bestPrecision = game.bestPrecision[playerName];
                                    }

                                    if (calculatePrecision(this.players[playerName].worstPrecision) > calculatePrecision(game.worstPrecision[playerName])) {
                                        this.players[playerName].worstPrecision = game.worstPrecision[playerName];
                                    }
                                }

                                this.players[playerName].games.push(game.title);

                                for (var z=0; z<game.winners.length; z++) {
                                    if (game.winners[z] === playerName) {
                                        this.players[playerName].winner.push(game.title)
                                    }

                                }
                            }, this);
                        }
                    }, this);
                };

                this.updateStatistics();
            }
        ]
    });
