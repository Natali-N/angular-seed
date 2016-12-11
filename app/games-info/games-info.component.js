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

                    if (!games.length) {
                        this.gameStatistics = true;
                        return;
                    }

                    this.players = {};

                    for (var i=0; i<games.length; i++) {
                        if (games[i].status) {
                            for (var k=0; k<games[i].players.length; k++) {
                                var playerName = games[i].players[k];

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

                                    this.players[playerName].bestThrow = games[i].bestThrow[playerName];
                                    this.players[playerName].worstThrow = games[i].worstThrow[playerName];
                                    this.players[playerName].bestPrecision = games[i].bestPrecision[playerName];
                                    this.players[playerName].worstPrecision = games[i].worstPrecision[playerName];

                                } else {
                                    if (this.players[playerName].bestThrow > games[i].bestThrow[playerName]) {
                                        this.players[playerName].bestThrow = games[i].bestThrow[playerName];
                                    }

                                    if (this.players[playerName].worstThrow < games[i].worstThrow[playerName]) {
                                        this.players[playerName].worstThrow = games[i].worstThrow[playerName];
                                    }

                                    if (calculatePrecision(this.players[playerName].bestPrecision) < calculatePrecision(games[i].bestPrecision[playerName])) {
                                        this.players[playerName].bestPrecision = games[i].bestPrecision[playerName];
                                    }

                                    if (calculatePrecision(this.players[playerName].worstPrecision) > calculatePrecision(games[i].worstPrecision[playerName])) {
                                        this.players[playerName].worstPrecision = games[i].worstPrecision[playerName];
                                    }
                                }

                                this.players[playerName].games.push(games[i].title);

                                for (var z=0; z<games[i].winners.length; z++) {
                                    if (games[i].winners[z] === playerName) {
                                        this.players[playerName].winner.push(games[i].title)
                                    }

                                }
                            }
                        }
                    }
                };

                this.updateStatistics();
            }
        ]
    });
