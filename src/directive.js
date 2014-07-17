'use strict';

/**
 * generate directive link function
 *
 * @param {Service} $http, http service to make ajax requests from angular
 * @param {String} type, chart type
 */
function getLinkFunction($http, theme, util, type) {
    return function (scope, element, attrs) {
        scope.config = scope.config || {};

        var dom  = element.find('div')[0];
        var width;
        var height;
        var chart;

        chart = echarts.init(dom, theme.get(scope.config.theme || 'macarons'));

        function getSizes(config) {
            width = config.width || attrs.width || 320;
            height = config.height || attrs.height || 240;

            console.log(width, height);

            dom.style.width = width + 'px';
            dom.style.height = height + 'px';
        }

        function getOptions(data, config, type) {
            // merge default config
            config = angular.extend({
                showXAxis: true,
                showYAxis: true,
                showLegend: true,
            }, config);

            // basic config
            var options = {
                title: util.getTitle(data, config, type),
                tooltip: util.getTooltip(data, config, type),
                legend: util.getLegend(data, config, type),
                toolbox: angular.extend({ show: false }, config.toolbox || {}),
                grid: { x: 0, y: 10, width: width - 10, height: height - 40 },
                xAxis: [ util.getAxisTicks(data, config, type) ],
                yAxis: [ { type: 'value' } ],
                series: util.getSeries(data, config, type),
            };

            if (!config.showXAxis) {
                angular.forEach(options.xAxis, function (axis) {
                    axis.axisLine = { show: false };
                    axis.axisLabel = { show: false };
                    axis.axisTick = { show: false };
                });
            }

            if (!config.showYAxis) {
                angular.forEach(options.yAxis, function (axis) {
                    axis.axisLine = { show: false };
                    axis.axisLabel = { show: false };
                    axis.axisTick = { show: false };
                });
            }

            if (!config.showLegend || type === 'gauge') {
                delete options.legend;
            }

            if (!util.isAxisChart(type)) {
                delete options.xAxis;
                delete options.yAxis;
                delete options.grid;
            }

            return options;
        }

        function setOptions() {
            if (!scope.data || !scope.config) {
                return;
            }

            var options;

            getSizes(scope.config);

            // string type for data param is assumed to ajax datarequests
            if (angular.isString(scope.data)) {
                // show loading
                chart.showLoading({ text: scope.config.loading || '奋力加载中...' });

                // fire data request
                $http.get(scope.data).success(function (response) {
                    chart.hideLoading();
                    if (response.data) {
                        options = getOptions(response.data, scope.config, type);
                        if (scope.config.debug) {
                            console.log(options);
                            console.log(response);
                        }
                        chart.setOption(options);
                        chart.resize();
                    } else {
                        throw new Error('angular-echarts: no data loaded from ' + scope.data);
                    }
                }).error(function (response) {
                    chart.hideLoading();
                    throw new Error('angular-echarts: error loading data from ' + scope.data);
                });

            // if data is avaliable, render immediately
            } else {
                options = getOptions(scope.data, scope.config, type);
                if (scope.config.debug) {
                    console.log(options);
                }
                chart.setOption(options);
                chart.resize();
            }
        }

        // update when charts config changes
        scope.$watch(function () { return scope.config; }, function (value) {
            if (value) { setOptions(); }
        });

        // update when charts data changes
        scope.$watch(function () { return scope.data; }, function (value) {
            if (value) { setOptions(); }
        });

    };
}

/**
 * add directives
 */
angular.module('angular-echarts', ['angular-echarts.theme', 'angular-echarts.util'])
    .directive('lineChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'line')
        };
    }])
    .directive('barChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'bar')
        };
    }])
    .directive('areaChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'area')
        };
    }])
    .directive('pieChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'pie')
        };
    }])
    .directive('donutChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'donut')
        };
    }])
    .directive('gaugeChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'gauge')
        };
    }]);

