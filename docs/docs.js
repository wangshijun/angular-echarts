(function () {
    'use strict';

    var pageload = {
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
    };

    var firstPaint = {
        name: 'page.firstPaint',
        datapoints: [
            { x: 2001, y: 22 },
            { x: 2002, y: 13 },
            { x: 2003, y: 35 },
            { x: 2004, y: 52 },
            { x: 2005, y: 32 },
            { x: 2006, y: 40 },
            { x: 2007, y: 63 },
            { x: 2008, y: 80 },
            { x: 2009, y: 20 },
            { x: 2010, y: 25 },
        ]
    };

    var app = angular.module('docs', ['angular-echarts']);

    app.controller('LineChartController', function ($scope) {

        $scope.config = {
            // title: 'Line Chart',
            // subtitle: 'Line Chart Subtitle',
            debug: true,
            showXAxis: true,
            showYAxis: false,
            showLegend: false,
            stack: false,
        };

        $scope.data = [ pageload ];
        $scope.multiple = [pageload, firstPaint ];

    });

    app.controller('BarChartController', function ($scope) {

        $scope.config = {
            title: 'Bar Chart',
            subtitle: 'Bar Chart Subtitle',
            debug: true,
            stack: true,
        };

        $scope.data = [ pageload ];
        $scope.multiple = [pageload, firstPaint ];

    });

    app.controller('AreaChartController', function ($scope) {

        $scope.config = {
            title: 'Area Chart',
            subtitle: 'Area Chart Subtitle',
            debug: true,
            stack: true,
        };

        $scope.data = [ pageload ];
        $scope.multiple = [pageload, firstPaint ];

    });
})();

