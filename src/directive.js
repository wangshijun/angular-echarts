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

        var ndWrapper  = element.find('div')[0],
            ndParent = element.parent()[0],
            parentWidth = ndParent.clientWidth,
            parentHeight = ndParent.clientHeight,
            width, height, chart;
        var chartEvent = {};

        function getSizes(config) {
            width = config.width || parseInt(attrs.width) || parentWidth || 320;
            height = config.height || parseInt(attrs.height) || parentHeight || 240;

            ndWrapper.style.width = width + 'px';
            ndWrapper.style.height = height + 'px';
        }

        function getOptions(data, config, type) {
            // merge default config
            config = angular.extend({
                showXAxis: true,
                showYAxis: true,
                showLegend: true
            }, config);

            var xAxis = angular.extend({
                orient: 'top',
                axisLine: { show: false }
            }, angular.isObject(config.xAxis) ? config.xAxis : {});

            var yAxis = angular.extend({
                type: 'value',
                orient: 'right',
                scale: false,
                axisLine: {
                    show: false
                },
                axisLabel: {
                    formatter: function (v) {
                        return util.formatKMBT(v);
                    }
                }
            }, angular.isObject(config.yAxis) ? config.yAxis : {});

            // basic config
            var options = {
                title: util.getTitle(data, config, type),
                tooltip: util.getTooltip(data, config, type),
                legend: util.getLegend(data, config, type),
                toolbox: angular.extend({ show: false }, angular.isObject(config.toolbox) ? config.toolbox : {}),
                xAxis: [ angular.extend(xAxis, util.getAxisTicks(data, config, type)) ],
                yAxis: [ yAxis ],
                series: util.getSeries(data, config, type)
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

            if (!config.showLegend || type === 'gauge' || type === 'map') {
                delete options.legend;
            }

            if (!util.isAxisChart(type)) {
                delete options.xAxis;
                delete options.yAxis;
            }

            if (config.dataZoom) {
                options.dataZoom = angular.extend({
                    show : true,
                    realtime : true
                }, config.dataZoom);
            }

            if (config.dataRange) {
                options.dataRange = angular.extend({}, config.dataRange);
            }

            if (config.polar) {
                options.polar = config.polar;
            }

            return options;
        }

        var isAjaxInProgress = false;
        var textStyle = { color: 'red', fontSize: 36, fontWeight: 900, fontFamily: 'Microsoft Yahei, Arial' };

        function setOptions() {
            if (!scope.data || !scope.config) {
                return;
            }

            var options;

            getSizes(scope.config);

            if (!chart) {
                chart = echarts.init(ndWrapper, theme.get(scope.config.theme || 'macarons'));
            }

            if (scope.config.event) {
                if (!Array.isArray(scope.config.event)) {
                    scope.config.event = [scope.config.event];
                }

                if (Array.isArray(scope.config.event)) {
                    scope.config.event.forEach(function (ele) {
                        if(!chartEvent[ele.type]) {
                            chartEvent[ele.type] = true;
                            chart.on(ele.type, function (param) {
                                ele.fn(param);
                            });
                        }
                    });
                }
            }

            // string type for data param is assumed to ajax datarequests
            if (angular.isString(scope.data)) {
                if (isAjaxInProgress) { return; }
                isAjaxInProgress = true;

                // show loading
                chart.showLoading({ text: scope.config.loading || '奋力加载中...', textStyle: textStyle });

                // fire data request
                $http.get(scope.data).success(function (response) {
                    isAjaxInProgress = false;
                    chart.hideLoading();

                    if (response.data) {
                        options = getOptions(response.data, scope.config, type);
                        if (scope.config.forceClear) {
                            chart.clear();
                        }
                        if (options.series.length) {
                            chart.setOption(options);
                            chart.resize();
                        } else {
                            chart.showLoading({ text: scope.config.errorMsg || '没有数据', textStyle: textStyle });
                        }
                    } else {
                        chart.showLoading({ text: scope.config.emptyMsg || '数据加载失败', textStyle: textStyle });
                    }

                }).error(function (response) {
                    isAjaxInProgress = false;
                    chart.showLoading({ text: scope.config.emptyMsg || '数据加载失败', textStyle: textStyle });
                });

            // if data is avaliable, render immediately
            } else {
                options = getOptions(scope.data, scope.config, type);
                if (scope.config.forceClear) {
                    chart.clear();
                }
                if (options.series.length) {
                    chart.setOption(options);
                    chart.resize();
                } else {
                    chart.showLoading({ text: scope.config.errorMsg || '没有数据', textStyle: textStyle });
                }
            }
        }

        // update when charts config changes
        scope.$watch(function () { return scope.config; }, function (value) {
            if (value) { setOptions(); }
        }, true);

        scope.$watch(function () { return scope.data; }, function (value) {
            if (value) { setOptions(); }
        }, true);

    };
}

/**
 * add directives
 */
var app = angular.module('angular-echarts', ['angular-echarts.theme', 'angular-echarts.util']);
var types = ['line', 'bar', 'area', 'pie', 'donut', 'gauge', 'map', 'radar'];
for (var i = 0, n = types.length; i < n; i++) {
    (function (type) {
        app.directive(type + 'Chart', ['$http', 'theme', 'util', function ($http, theme, util) {
            return {
                restrict: 'EA',
                template: '<div></div>',
                scope: {
                    config: '=config',
                    data: '=data'
                },
                link: getLinkFunction($http, theme, util, type)
            };
        }]);
    })(types[i]);
}

