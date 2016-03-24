'use strict';

/**
 * vintage theme
 */
angular.module('angular-echarts.theme').factory('vintage', function () {

    var colorPalette = ['#d87c7c','#919e8b', '#d7ab82',  '#6e7074','#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'];
    var theme = {
        color: colorPalette,
        backgroundColor: '#fef8ef',
        graph: {
            color: colorPalette
        }
    };
    return theme;
});