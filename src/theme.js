'use strict';

/**
 * theme services
 * posible themes: infographic macarons shine dark blue green red gray default
 */
angular.module('angular-echarts.theme', []).factory('theme', ['infographic', 'macarons', 'shine', 'dark', 'blue', 'green', 'red', 'tech', function (infographic, macarons, shine, dark, blue, green, red, tech) {
    var themes = {
        infographic: infographic,
        macarons: macarons,
        shine: shine,
        dark: dark,
        blue: blue,
        green: green,
        red: red,
        tech: tech,
    };

    return {
        get: function (name) {
            return themes[name] ? themes[name] : {};
        },
    };

}]);

