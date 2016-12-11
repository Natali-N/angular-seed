'use strict';
// @todo hide data from this
// @todo styles wide/mobile
// @todo switches between screens (save game)
// @todo game type
// @todo перебор массива
// @todo tests
angular.
    module('currentGame').
    component('currentGame', {
        templateUrl: 'current-game/current-game.template.html',
        require: {
            'parent' : '^gamesInfo'
        },
        controller: ['GamesService',
            function CurrentGameController(GamesService) {
                //где лучше объ€вл€ть переменную здесь или через ng-init

                var self = this;
                this.games = [];
                this.unfinishedGame = false;
                this.showCurrentGameInfo = false;
                this.gameTitleError = false;
                this.playerNameError = false;
                this.currentGame = {};
                this.gameOver = false;

                function prepareGameCreationView() {
                    self.currentGame.title = 'Game1';

                    self.currentGame.type = 301;

                    self.currentGame.players = [];
                    self.currentGame.players.push('Player' + (self.currentGame.players.length + 1));
                }

                this.deleteUnfinished = function () {
                    GamesService.remove(this.unfinishedGameTitle);
                    this.unfinishedGameTitle = '';
                    this.games = GamesService.getAll();

                    prepareGameCreationView();

                    this.unfinishedGame = false;
                };

                this.continuePlaying = function() {
                    this.currentGame = GamesService.get(this.unfinishedGameTitle);
                    this.currentGamePlayers = this.currentGame.players;

                    this.showCurrentGameInfo = true;
                };

                this.addPlayer = function() {
                    savePlayerInfo();

                    if (!self.playerNameError) {
                        this.currentGame.players.push('Player' + (this.currentGame.players.length + 1));
                    }
                };

                function savePlayerInfo() {
                    var lastName = self.currentGame.players[self.currentGame.players.length - 1];

                    self.playerNameError = false;

                    if (self.currentGame.players.length > 1) {
                        for (var i=0; i<self.currentGame.players.length-1; i++) {
                            if ( lastName === self.currentGame.players[i]) {
                                self.playerNameError = true;
                                return;
                            }
                        }
                    }
                }

                this.createNewGame = function() {
                    this.gameTitleError = false;

                    savePlayerInfo();

                    if (this.currentGame.title) {
                        for (var i=0; i<this.games.length; i++) {
                            if (this.currentGame.title === this.games[i].title) {
                                this.gameTitleError = true;
                            }
                        }

                    } else {
                        this.gameTitleError = true;
                    }

                    if (!this.playerNameError && !this.gameTitleError) {
                        var gameObj = {
                            title: this.currentGame.title,
                            type: this.currentGame.type,
                            players: this.currentGame.players,
                            remainder: {},
                            bestThrow: {},
                            worstThrow: {},
                            bestPrecision: {},
                            worstPrecision: {},
                            pointers: {
                                playerPointer: this.currentGame.players[0],
                                throwPointer: 0,
                                turnPointer: 0
                            },
                            winners: [],
                            status: 0
                        };

                        for (var k=0; k<this.currentGame.players.length; k++) {
                            var playerName = this.currentGame.players[k];
                            gameObj[playerName] = [ [] ];
                            gameObj.remainder[playerName] = 301;
                            gameObj.bestThrow[playerName] = 0;
                            gameObj.worstThrow[playerName] = 51;
                            gameObj.bestPrecision[playerName] = [];
                            gameObj.worstPrecision[playerName] = [];
                        }

                        GamesService.set(
                            this.currentGame.title,
                            gameObj
                        );

                        this.currentGame = GamesService.get(this.currentGame.title);
                        this.currentGamePlayers = this.currentGame.players;

                        this.showCurrentGameInfo = true;
                    }
                };

                function updatePointers() {
                    if (self.currentGame.pointers.throwPointer === 2) {

                        var playerPosInArray = self.currentGamePlayers.indexOf(self.currentGame.pointers.playerPointer);
                        if (playerPosInArray < self.currentGamePlayers.length-1) {
                            playerPosInArray++;
                        } else {

                            if(self.currentGame.winners.length) {
                                self.currentGame.status = 1;
                                self.gameOver = true;
                                self.parent.updateStatistics();
                                return;
                            }

                            playerPosInArray = 0;
                            self.currentGame.pointers.turnPointer++;

                            for (var k=0; k<self.currentGame.players.length; k++) {
                                var playerName = self.currentGame.players[k];
                                self.currentGame[playerName].push([]);
                            }
                        }

                        self.currentGame.pointers.playerPointer = self.currentGamePlayers[playerPosInArray];
                        self.currentGame.pointers.throwPointer = 0;
                    } else {
                        self.currentGame.pointers.throwPointer++;
                    }
                }

                function updateBestWorstRemainder(points) {

                    var bestThrow = self.currentGame.bestThrow[self.currentGame.pointers.playerPointer];
                    var worstThrow = self.currentGame.worstThrow[self.currentGame.pointers.playerPointer];

                    if (points > bestThrow) {
                        self.currentGame.bestThrow[self.currentGame.pointers.playerPointer] = points;
                    }

                    if (points < worstThrow) {
                        self.currentGame.worstThrow[self.currentGame.pointers.playerPointer] = points;
                    }

                    self.currentGame.remainder[self.currentGame.pointers.playerPointer] -= points;
                }

                function calculatePrecision(arr) {
                    return Math.abs(arr[0]-arr[1]) + Math.abs(arr[1]-arr[2]) + Math.abs(arr[2]-arr[0]);
                }

                function updatePrecision() {

                    var completeTurn = self.currentGame[self.currentGame.pointers.playerPointer][self.currentGame.pointers.turnPointer],
                        bestPrecision = self.currentGame.bestPrecision[self.currentGame.pointers.playerPointer],
                        worstPrecision = self.currentGame.worstPrecision[self.currentGame.pointers.playerPointer];

                    if (!bestPrecision.length || calculatePrecision(completeTurn) < calculatePrecision(bestPrecision)) {
                        self.currentGame.bestPrecision[self.currentGame.pointers.playerPointer] = completeTurn;
                    }

                    if (!worstPrecision.length || calculatePrecision(completeTurn) > calculatePrecision(worstPrecision)) {
                        self.currentGame.worstPrecision[self.currentGame.pointers.playerPointer] = completeTurn;
                    }
                }

                function checkRemainder(points, doubleArea) {
                    var partialRemainder = self.currentGame.remainder[self.currentGame.pointers.playerPointer] - points;

                    if (partialRemainder === 0 && doubleArea) {
                        self.currentGame.winners.push(self.currentGame.pointers.playerPointer);
                        self.currentGame[self.currentGame.pointers.playerPointer][self.currentGame.pointers.turnPointer][self.currentGame.pointers.throwPointer] = points;

                        if (self.currentGame.pointers.throwPointer === 2) {
                            updatePrecision();
                        } else {
                            self.currentGame.pointers.throwPointer = 2;
                        }

                        updateBestWorstRemainder(points);
                        return false;
                    }

                    if (partialRemainder === 0 || partialRemainder < 2) {
                        var turn = self.currentGame[self.currentGame.pointers.playerPointer][self.currentGame.pointers.turnPointer];

                        for (var i=0; i<turn.length;i++) {
                            self.currentGame.remainder[self.currentGame.pointers.playerPointer] +=turn[i];
                        }

                        turn[0] = 0;
                        turn[1] = 0;
                        turn[2] = 0;

                        self.currentGame.pointers.throwPointer = 2;

                        return false;
                    }

                    return true;
                }

                this.saveThrow = function(points, index) {
                    var playerPointer = this.currentGame.pointers.playerPointer,
                        turnPointer = this.currentGame.pointers.turnPointer,
                        throwPointer = this.currentGame.pointers.throwPointer,
                        calculatePrecision = false,
                        doubleArea = false;

                    if (index === 50 || index === 2) {
                        doubleArea = true;
                    }

                    if ( checkRemainder(points, doubleArea) ) {
                        this.currentGame[playerPointer][turnPointer][throwPointer] = points;
                        updateBestWorstRemainder(points);
                        calculatePrecision = true;
                    }

                    if(calculatePrecision && self.currentGame.pointers.throwPointer === 2) {
                        updatePrecision();
                    }

                    updatePointers();

                    GamesService.set(
                        this.currentGame.title,
                        this.currentGame
                    );

                    this.games = GamesService.getAll();
                };

                this.addGame = function() {
                    this.gameOver = false;
                    this.showCurrentGameInfo = false;
                };

                this.games = GamesService.getAll();

                if (this.games.length) {
                    for (var i=this.games.length - 1; i>=0; i--) {
                        if (this.games[i].status === 0) {
                            this.unfinishedGameTitle = this.games[i].title;
                            this.unfinishedGame = true;
                            return;
                        }
                    }
                }

                prepareGameCreationView();
            }
        ]
    });



