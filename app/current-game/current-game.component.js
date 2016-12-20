'use strict';
// @todo hide data from this
// @todo styles wide/mobile
// @todo switches between screens (save game)
// @todo game type
// @todo ������� �������
// @todo tests
// @todo ng-init vs local variable in controller
// @todo delete console log
// @todo save throw check
// @todo angular validation
angular.
    module('currentGame').
    component('currentGame', {
        templateUrl: 'current-game/current-game.template.html',
        controller: ['GamesService',
            function CurrentGameController(GamesService) {

                var self = this,
                    games = [];
                this.unfinishedGame = false;
                this.showCurrentGameInfo = false;
                this.gameTitleError = false;
                this.playerNameError = false;
                this.currentGame = {};
                this.gameOver = false;
                this.disableGameArea = true;

                function prepareGameCreationView() {
                    self.currentGame.title = 'Game1';
                    self.currentGame.type = 301;
                    self.currentGame.players = [];
                    self.currentGame.players.push('Player' + (self.currentGame.players.length + 1));
                }

                this.deleteUnfinished = function () {
                    GamesService.remove(this.unfinishedGameTitle);
                    this.unfinishedGameTitle = '';
                    games = GamesService.getAll();

                    prepareGameCreationView();

                    this.unfinishedGame = false;
                };

                this.continuePlaying = function() {
                    this.currentGame = GamesService.get(this.unfinishedGameTitle);
                    this.currentGamePlayers = this.currentGame.players;

                    this.showCurrentGameInfo = true;
                    this.disableGameArea = false;
                };

                function savePlayerInfo(currentGamePlayers) {
                    var lastName = currentGamePlayers[currentGamePlayers.length - 1];

                    self.playerNameError = false;

                    if (!lastName) {
                        self.playerNameError = true;
                        return;
                    }

                    if (currentGamePlayers.length > 1) {
                        for (var i=0; i<currentGamePlayers.length-1; i++) {
                            if ( lastName === currentGamePlayers[i]) {
                                self.playerNameError = true;
                                return;
                            }
                        }
                    }
                }

                this.addPlayer = function() {
                    var currentGamePlayers = this.currentGame.players;

                    savePlayerInfo(currentGamePlayers);

                    if (!this.playerNameError) {
                        currentGamePlayers.push('Player' + (currentGamePlayers.length + 1));
                    }
                };

                this.createNewGame = function() {
                    var currentGame = this.currentGame;

                    this.gameTitleError = false;

                    savePlayerInfo(currentGame.players);

                    if (currentGame.title) {
                        games.forEach(function(item, i, arr) {
                            if (currentGame.title === item.title) {
                                self.gameTitleError = true;
                            }
                        });

                    } else {
                        this.gameTitleError = true;
                    }

                    if (!this.playerNameError && !this.gameTitleError) {
                        var gameObj = {
                            title: currentGame.title,
                            type: currentGame.type,
                            players: currentGame.players,
                            remainder: {},
                            bestThrow: {},
                            worstThrow: {},
                            bestPrecision: {},
                            worstPrecision: {},
                            pointers: {
                                playerPointer: currentGame.players[0],
                                throwPointer: 0,
                                turnPointer: 0
                            },
                            winners: [],
                            status: 0
                        };

                        currentGame.players.forEach(function(player, i, arr) {
                            gameObj[player] = [ [] ];
                            gameObj.remainder[player] = currentGame.type;
                            gameObj.bestThrow[player] = 0;
                            gameObj.worstThrow[player] = 51;
                            gameObj.bestPrecision[player] = [];
                            gameObj.worstPrecision[player] = [];
                        });

                        GamesService.set(
                            currentGame.title,
                            gameObj
                        );

                        this.currentGame = GamesService.get(currentGame.title);
                        this.currentGamePlayers = currentGame.players;
                        this.showCurrentGameInfo = true;
                        this.disableGameArea = false;
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

                    games = GamesService.getAll();
                };

                this.addGame = function() {
                    this.gameOver = false;
                    this.showCurrentGameInfo = false;
                };

                games = GamesService.getAll();

                if (games.length) {
                    for (var i=games.length - 1; i>=0; i--) {
                        if (games[i].status === 0) {
                            this.unfinishedGameTitle = games[i].title;
                            this.unfinishedGame = true;
                            return;
                        }
                    }
                }

                prepareGameCreationView();
            }
        ]
    });



