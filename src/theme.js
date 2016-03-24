'use strict';

/**
 * theme services
 * posible themes: infographic macarons shine dark blue green red gray default
 */
angular.module('angular-echarts.theme', []).factory('theme', ['dark','macarons','infographic', function (dark, macarons,infographic) {
    var themes = {
        dark: dark,
        macarons: macarons,
        infographic: infographic,
    };

    return {
        get: function (name) {
            return themes[name] ? themes[name] : {};
        },
    };

}]);

