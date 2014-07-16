'use strict';

var app = angular.module('docs', ['angular-echarts']);

app.controller('LineChartController', function ($scope) {

    $scope.config = {
        title: 'Line Chart',
        subtitle: 'Line Chart Subtitle',
        theme: 'blue',
        debug: true,
    };

    $scope.data = [
        {
            name: 'page.load',
            datapoints: [
                { x: 2001, y: 12 },
                { x: 2002, y: 23 },
                { x: 2003, y: 45 },
                { x: 2004, y: 62 },
                { x: 2005, y: 32 },
                { x: 2006, y: 40 },
                { x: 2007, y: 23 },
                { x: 2008, y: 90 },
                { x: 2009, y: 120 },
                { x: 2010, y: 35 },
            ]
        },
    ];

});

app.controller('BarChartController', function ($scope) {

    $scope.config = {
        title: 'Bar Chart',
        subtitle: 'Bar Chart Subtitle',
        debug: true,
    };

    $scope.data = [
        {
            name: 'page.load',
            datapoints: [
                { x: 2001, y: 12 },
                { x: 2002, y: 23 },
                { x: 2003, y: 45 },
                { x: 2004, y: 62 },
                { x: 2005, y: 32 },
                { x: 2006, y: 40 },
                { x: 2007, y: 23 },
                { x: 2008, y: 90 },
                { x: 2009, y: 120 },
                { x: 2010, y: 35 },
            ]
        },
    ];

});

app.controller('AreaChartController', function ($scope) {

    $scope.config = {
        title: 'Area Chart',
        subtitle: 'Area Chart Subtitle',
        debug: true,
    };

    $scope.data = [
        {
            name: 'page.load',
            datapoints: [
                { x: 2001, y: 12 },
                { x: 2002, y: 23 },
                { x: 2003, y: 45 },
                { x: 2004, y: 62 },
                { x: 2005, y: 32 },
                { x: 2006, y: 40 },
                { x: 2007, y: 23 },
                { x: 2008, y: 90 },
                { x: 2009, y: 120 },
                { x: 2010, y: 35 },
            ]
        },
    ];

});
