'use strict';

angular.
    module('gameArea').
    component('gameArea', {
        templateUrl: 'game-area/game-area.template.html',
        require: {
            'parent' : '^currentGame'
        },
        controller: [
            function CurrentGameController() {

                this.showRules = false;

                var canvas = document.getElementById('canvas'),
                    ctx = canvas.getContext('2d');

                ctx.fillStyle = 'beige';
                ctx.fillRect(0,0,500,500);
                ctx.strokeStyle = 'black';
                ctx.font = 'italic '+18+'px Arial ';

                var canvasPositionLeft = canvas.getBoundingClientRect().left + pageXOffset,
                    canvasPositionTop = canvas.getBoundingClientRect().top + pageYOffset,
                    circleCenterAreasAmount = 2,
                    sectorsLengthBreakPointsData = [
                        {breakPoint: 10, index: 50},
                        {breakPoint: 20, index: 25},
                        {breakPoint: 90, index: 1},
                        {breakPoint: 100, index: 3},
                        {breakPoint: 190, index: 1},
                        {breakPoint: 200, index: 2}
                    ],

                    prevAngle = 0,
                    sectorStandardAngle = 1/20*Math.PI* 2,

                    colorPalette,
                    colorPaletteSmallSectors = ['red', 'green'],
                    colorPaletteBigSectors = ['black', 'white'],

                    sectorsPointsData = [
                        {basePoint: 14, positionLeft: 15, positionTop: 225, sectorNumber: -10},
                        {basePoint: 9, positionLeft: 42, positionTop: 160, sectorNumber: -9},
                        {basePoint: 12, positionLeft: 82, positionTop: 100, sectorNumber: -8},
                        {basePoint: 5, positionLeft: 145, positionTop: 60, sectorNumber: -7},
                        {basePoint: 20, positionLeft: 205, positionTop: 40, sectorNumber: -6},
                        {basePoint: 1, positionLeft: 280, positionTop: 40, sectorNumber: -5},
                        {basePoint: 18, positionLeft: 340, positionTop: 60, sectorNumber: -4},
                        {basePoint: 4, positionLeft: 403, positionTop: 100, sectorNumber: -3},
                        {basePoint: 13, positionLeft: 443, positionTop: 160, sectorNumber: -2},
                        {basePoint: 6, positionLeft: 465, positionTop: 225, sectorNumber: -1},
                        {basePoint: 10, positionLeft: 465, positionTop: 290, sectorNumber: 1},
                        {basePoint: 15, positionLeft: 443, positionTop: 350, sectorNumber: 2},
                        {basePoint: 2, positionLeft: 403, positionTop: 420, sectorNumber: 3},
                        {basePoint: 17, positionLeft: 340, positionTop: 460, sectorNumber: 4},
                        {basePoint: 3, positionLeft: 280, positionTop: 480, sectorNumber: 5},
                        {basePoint: 19, positionLeft: 205, positionTop: 480, sectorNumber: 6},
                        {basePoint: 7, positionLeft: 145, positionTop: 460, sectorNumber: 7},
                        {basePoint: 16, positionLeft: 82, positionTop: 420, sectorNumber: 8},
                        {basePoint: 8, positionLeft: 42, positionTop: 350, sectorNumber: 9},
                        {basePoint: 11, positionLeft: 15, positionTop: 290, sectorNumber: 10}
                    ];

                //creating game area
                sectorsPointsData.forEach(function(item, i) {
                    var angle = prevAngle + sectorStandardAngle;

                    for (var k=sectorsLengthBreakPointsData.length - 1; k>=circleCenterAreasAmount; k--) {
                        if (k%2 == 0) {
                            colorPalette = colorPaletteBigSectors;
                        } else {
                            colorPalette = colorPaletteSmallSectors;
                        }

                        ctx.fillStyle = colorPalette[i%2];

                        ctx.beginPath();
                        ctx.moveTo(250,250);
                        ctx.arc(250,250, sectorsLengthBreakPointsData[k].breakPoint, prevAngle, angle, false);
                        ctx.lineTo(250,250);

                        ctx.fill();
                        ctx.stroke();
                    }

                    prevAngle = angle;
                });

                //creating central circle areas
                for (var j=circleCenterAreasAmount - 1; j>=0; j--) {
                    ctx.fillStyle = colorPaletteSmallSectors[j%2];
                    ctx.beginPath();
                    ctx.arc(250,250, sectorsLengthBreakPointsData[j].breakPoint, 0, Math.PI*2, false);

                    ctx.fill();
                    ctx.stroke();
                }

                ctx.fillStyle = 'black';

                //adding number captions
                sectorsPointsData.forEach(function(item) {
                    ctx.fillText(
                        item.basePoint,
                        item.positionLeft,
                        item.positionTop
                    );
                });

                function radiusCheck(obj) {
                    return Math.pow((obj.positionLeft - 250), 2)  + Math.pow((obj.positionTop - 250), 2) <= Math.pow(obj.radius, 2);
                }

                function radiansToDegrees(number) {
                    return number*180/Math.PI;
                }

                function getSectorNumber(angleDegree) {
                    if (angleDegree<0) {
                        return parseInt(angleDegree/radiansToDegrees(sectorStandardAngle)  - 1);
                    } else {
                        return parseInt(angleDegree/radiansToDegrees(sectorStandardAngle)   + 1);
                    }
                }

                function getBasePoint(sectorNumber) {
                    for (var y=0; y<=sectorsPointsData.length; y++) {
                        if (sectorNumber === sectorsPointsData[y].sectorNumber) {
                            return sectorsPointsData[y].basePoint;
                        }
                    }
                }

                this.calculatePoints = function(event) {
                    var clickPositionLeft = event.pageX - canvasPositionLeft,
                        clickPositionTop = event.pageY - canvasPositionTop,
                        index = 0,
                        basePoint = 0,
                        totalPoints = 0,
                        sectorNumber;

                    //calculate the index
                    for (var z=0; z<sectorsLengthBreakPointsData.length; z++ ) {
                        if (radiusCheck({
                                positionLeft: clickPositionLeft,
                                positionTop: clickPositionTop,
                                radius: sectorsLengthBreakPointsData[z].breakPoint
                            })) {
                            index = sectorsLengthBreakPointsData[z].index;
                            break;
                        }
                    }

                    //calculate basePoint
                    if (index !== 25 && index !== 50 && index !== 0) {
                        var angleDegree = radiansToDegrees(Math.atan2(clickPositionTop - 250, clickPositionLeft - 250));
                        sectorNumber = getSectorNumber(angleDegree);
                        basePoint = getBasePoint(sectorNumber);
                        totalPoints = basePoint*index;

                    } else {
                        totalPoints = index;
                    }

                    this.parent.saveThrow(totalPoints, index);
                };
            }
        ]
    });
