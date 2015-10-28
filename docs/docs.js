(function () {
    'use strict';

    var pageload = {
        name: 'page.load',
        datapoints: [
            { x: 2001, y: 1012 },
            { x: 2002, y: 1023 },
            { x: 2003, y: 1045 },
            { x: 2004, y: 1062 },
            { x: 2005, y: 1032 },
            { x: 2006, y: 1040 },
            { x: 2007, y: 1023 },
            { x: 2008, y: 1090 },
            { x: 2009, y: 1012 },
            { x: 2010, y: 1012 }
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
            { x: 2010, y: 25 }
        ]
    };

    function updateData($interval) {
        $interval(function () {
            pageload.datapoints.push({ x: pageload.datapoints[pageload.datapoints.length - 1].x + 1, y: Math.round(Math.random() * 2000) });
            firstPaint.datapoints.push({ x: firstPaint.datapoints[firstPaint.datapoints.length - 1].x + 1, y: Math.round(Math.random() * 100) });
            pageload.datapoints.shift();
            firstPaint.datapoints.shift();
        }, 3000);
    }

    var app = angular.module('docs', ['angular-echarts']);

    app.controller('LineChartController', function ($scope, $interval) {

        $scope.config = {
            // title: 'Line Chart',
            // subtitle: 'Line Chart Subtitle',
            debug: true,
            showXAxis: true,
            showYAxis: true,
            showLegend: true,
            stack: false
        };

        $scope.data = [ pageload ];
        $scope.multiple = [pageload, firstPaint ];

        // CAUTION: 这行必须放在这里，不然 angular 感知不到数据变化
        updateData($interval);
    });

    app.controller('BarChartController', function ($scope) {

        $scope.config = {
            title: 'Bar Chart',
            subtitle: 'Bar Chart Subtitle',
            debug: true,
            stack: true
        };

        $scope.data = [ pageload ];
        $scope.multiple = [pageload, firstPaint ];

    });

    app.controller('AreaChartController', function ($scope) {

        $scope.config = {
            title: 'Area Chart',
            subtitle: 'Area Chart Subtitle',
            yAxis: { scale: true },
            debug: true,
            stack: true
        };

        $scope.data = [ pageload ];
        $scope.multiple = [pageload, firstPaint ];

    });

    app.controller('PieChartController', function ($scope) {

        $scope.config = {
            title: 'Pie Chart',
            subtitle: 'Pie Chart Subtitle',
            debug: true
        };

        $scope.data = [ pageload ];
    });

    app.controller('GaugeChartController', function ($scope) {

        $scope.config = {
            debug: true
        };

        $scope.data = [ pageload ];
    });

    app.controller('AjaxChartController', function ($scope, $interval) {

        $scope.config = {
            debug: true,
            showXAxis: false
            // width: 480,
            // height: 320,
        };

        $scope.data = './docs/data.json';

        $interval(function () {
            $scope.data = './docs/data.json';
        }, 3000);
    });

    app.controller('MapChartController', function ($scope) {

        $scope.config = {
            nation: {
                width: 600,
                height: 450,
                map: {
                    mapType: 'china',
                    selectedMode: 'single',
                    itemStyle:{
                        normal:{label:{show:true}},
                        emphasis:{label:{show:true}}
                    }
                },
                event: {
                    type: echarts.config.EVENT.MAP_SELECTED,
                    fn: detail
                }

            },
            province: {

            }
        };

        $scope.showDetail = false;

        $scope.data = {
            nation: [
                {name: "全国地图"}
            ],
            province: [
                {name: "省地图"}
            ]
        };
        function detail(param) {
            $scope.$apply(function () {
                $scope.showDetail = true;
                var selectedProvince = Object.keys(param.selected).filter(function (value) {
                    return param.selected[value];
                });
                $scope.config.province = {
                    //debug: true,
                    map: {
                        mapType: selectedProvince[0],
                        selectedMode: 'single',
                        itemStyle:{
                            normal:{label:{show:true}},
                            emphasis:{label:{show:true}}
                        }

                    }
                };

            })
        }

    });

    app.controller('RadarChartController', function ($scope) {

        $scope.config = {
            width: 600,
            height: 450,
            polar : [
                {
                    indicator : [
                        { text: '销售（sales）', max: 6000},
                        { text: '管理（Administration）', max: 16000},
                        { text: '信息技术（Information Techology）', max: 30000},
                        { text: '客服（Customer Support）', max: 38000},
                        { text: '研发（Development）', max: 52000},
                        { text: '市场（Marketing）', max: 25000}
                    ]
                }
            ]
        };

        $scope.data = [
            {
                name: '预算 vs 开销（Budget vs spending）',
                type: 'radar',
                data : [
                    {
                        value : [4300, 10000, 28000, 35000, 50000, 19000],
                        name : '预算分配（Allocated Budget）'
                    },
                    {
                        value : [5000, 14000, 28000, 31000, 42000, 21000],
                        name : '实际开销（Actual Spending）'
                    }
                ]
            }
        ];
    });

})();

