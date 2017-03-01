'use strict';

/**
 * theme services
 * posible themes: infographic macarons shine dark blue green red gray default
 */
angular.module('angular-echarts.theme', []).factory('theme', ['infographic', 'macarons', 'shine', 'dark', 'roma', function (infographic, macarons, shine, dark, roma) {
    var themes = {
        infographic: infographic,
        macarons: macarons,
        shine: shine,
        dark: dark,
        roma: roma,
    };

    return {
        get: function (name) {
            return themes[name] ? themes[name] : {};
        },
    };

}]);
