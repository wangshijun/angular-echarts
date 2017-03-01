(function () {'use strict';
/**
 * generate directive link function
 *
 * @param {Service} $http, http service to make ajax requests from angular
 * @param {String} type, chart type
 */
function getLinkFunction($http, util, type) {
    return function (scope, element, attrs) {
        scope.config = scope.config || {};
        var ndWrapper = element.find('div')[0], ndParent = element.parent()[0], parentWidth = ndParent.clientWidth, parentHeight = ndParent.clientHeight, width, height, chart;
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
                    axisLine: { show: false },
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
                    graphic: config.graphic && (angular.isObject(config.graphic) || angular.isArray(config.graphic)) ? config.graphic : [],
                    series: util.getSeries(data, config, type),
                    visualMap: config.visualMap ? config.visualMap : null
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
            }
            if (config.dataZoom) {
                options.dataZoom = angular.extend({
                    show: true,
                    realtime: true
                }, config.dataZoom);
            }
            if (config.dataRange) {
                options.dataRange = angular.extend({}, config.dataRange);
            }
            if (config.polar) {
                options.polar = config.polar;
            }
            if (config.grid) {
                options.grid = config.grid;
            }
            return options;
        }
        var isAjaxInProgress = false;
        var textStyle = {
                color: 'red',
                fontSize: 36,
                fontWeight: 900,
                fontFamily: 'Microsoft Yahei, Arial'
            };
        function setOptions() {
            if (!scope.data || !scope.config) {
                return;
            }
            var options;
            getSizes(scope.config);
            if (!chart) {
                chart = echarts.init(ndWrapper);
            }
            if (scope.config.event) {
                if (!Array.isArray(scope.config.event)) {
                    scope.config.event = [scope.config.event];
                }
                if (Array.isArray(scope.config.event)) {
                    scope.config.event.forEach(function (ele) {
                        if (!chartEvent[ele.type]) {
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
                if (isAjaxInProgress) {
                    return;
                }
                isAjaxInProgress = true;
                // show loading
                chart.showLoading({
                    text: scope.config.loading || '\u594B\u529B\u52A0\u8F7D\u4E2D...',
                    textStyle: textStyle
                });
                // fire data request
                $http.get(scope.data).then(function (response) {
                    isAjaxInProgress = false;
                    chart.hideLoading();
                    if (response.data.data) {
                        options = getOptions(response.data.data, scope.config, type);
                        if (scope.config.forceClear) {
                            chart.clear();
                        }
                        if (options.series.length) {
                            chart.setOption(options);
                            chart.resize();
                        } else {
                            chart.showLoading({
                                text: scope.config.errorMsg || '\u6CA1\u6709\u6570\u636E',
                                textStyle: textStyle
                            });
                        }
                    } else {
                        chart.showLoading({
                            text: scope.config.emptyMsg || '\u6570\u636E\u52A0\u8F7D\u5931\u8D25',
                            textStyle: textStyle
                        });
                    }
                });    // if data is avaliable, render immediately
            } else {
                options = getOptions(scope.data, scope.config, type);
                if (scope.config.forceClear) {
                    chart.clear();
                }
                if (options.series.length) {
                    chart.setOption(options);
                    chart.resize();
                } else {
                    chart.showLoading({
                        text: scope.config.errorMsg || '\u6CA1\u6709\u6570\u636E',
                        textStyle: textStyle
                    });
                }
            }
            scope.chartObj = chart;
        }
        // update when charts config changes
        scope.$watch(function () {
            return scope.config;
        }, function (value) {
            if (value) {
                setOptions();
            }
        }, true);
        scope.$watch(function () {
            return scope.data;
        }, function (value) {
            if (value) {
                setOptions();
            }
        }, true);
    };
}
/**
 * add directives
 */
var app = angular.module('angular-echarts', ['angular-echarts.util']);
var types = ['line', 'bar', 'area', 'pie', 'donut', 'gauge', 'map', 'radar'];
for (var i = 0, n = types.length; i < n; i++) {
    (function (type) {
        app.directive(type + 'Chart', ['$http', 'util', function ($http, util) {
                    return {
                        restrict: 'EA',
                        template: '<div config="config" data="data"></div>',
                        scope: {
                            config: '=config',
                            data: '=data',
                            chartObj: '=?chartObj'
                        },
                        link: getLinkFunction($http, util, type)
                    };
                }]);
    }(types[i]));
}
'use strict';
/**
 * util services
 */
angular.module('angular-echarts.util', []).factory('util', function () {
    function isPieChart(type) {
        return ['pie', 'donut'].indexOf(type) > -1;
    }
    function isMapChart(type) {
        return ['map'].indexOf(type) > -1;
    }
    function isAxisChart(type) {
        return ['line', 'bar', 'area'].indexOf(type) > -1;
    }
    /**
     * get x axis ticks from the 1st serie
     */
    function getAxisTicks(data, config, type) {
        var ticks = [];
        if (data[0]) {
            angular.forEach(data[0].datapoints, function (datapoint) {
                ticks.push(datapoint.x);
            });
        }
        return {
            type: 'category',
            boundaryGap: type === 'bar',
            data: ticks
        };
    }
    /**
     * get series config
     *
     * @param {Array} data serie data
     * @param {Object} config options
     * @param {String} chart type
     */
    function getSeries(data, config, type) {
        var series = [];
        angular.forEach(data, function (serie) {
            // datapoints for line, area, bar chart
            var datapoints = [];
            angular.forEach(serie.datapoints, function (datapoint) {
                datapoints.push(datapoint.y);
            });
            var conf = {
                    type: type || 'line',
                    name: serie.name,
                    data: datapoints
                };
            // area chart is actually line chart with special itemStyle
            if (type === 'area') {
                conf.type = 'line';
                conf.itemStyle = { normal: { areaStyle: { type: 'default' } } };
            }
            // gauge chart need many special config
            if (type === 'gauge') {
                conf = angular.extend(conf, {
                    splitNumber: 10,
                    // 分割段数，默认为5
                    axisLine: {
                        // 坐标轴线
                        lineStyle: {
                            // 属性lineStyle控制线条样式
                            color: [[0.2, '#228b22'], [0.8, '#48b'], [1, '#ff4500']],
                            width: 8
                        }
                    },
                    axisTick: {
                        // 坐标轴小标记
                        splitNumber: 10,
                        // 每份split细分多少段
                        length: 12,
                        // 属性length控制线长
                        lineStyle: {
                            // 属性lineStyle控制线条样式
                            color: 'auto'
                        }
                    },
                    axisLabel: {
                        // 坐标轴文本标签，详见axis.axisLabel
                        textStyle: {
                            // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            color: 'auto'
                        }
                    },
                    splitLine: {
                        // 分隔线
                        show: true,
                        // 默认显示，属性show控制显示与否
                        length: 30,
                        // 属性length控制线长
                        lineStyle: {
                            // 属性lineStyle（详见lineStyle）控制线条样式
                            color: 'auto'
                        }
                    },
                    pointer: { width: 5 },
                    title: {
                        show: true,
                        offsetCenter: [0, '-40%'],
                        // x, y，单位px
                        textStyle: {
                            // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    detail: {
                        formatter: '{value}%',
                        textStyle: {
                            // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            color: 'auto',
                            fontWeight: 'bolder'
                        }
                    }
                }, config.gauge || {});
            }
            // datapoints for pie chart and gauges are different
            if (!isAxisChart(type)) {
                conf.data = [];
                angular.forEach(serie.datapoints, function (datapoint) {
                    conf.data.push({
                        value: datapoint.y,
                        name: datapoint.x
                    });
                });
            }
            if (isPieChart(type)) {
                // donut charts are actually pie charts
                conf.type = 'pie';
                // pie chart need special radius, center config
                conf.center = config.center || ['40%', '50%'];
                conf.radius = config.radius || '60%';
                // donut chart require special itemStyle
                if (type === 'donut') {
                    conf.radius = config.radius || ['50%', '70%'];
                    conf = angular.extend(conf, {
                        itemStyle: {
                            normal: {
                                label: { show: false },
                                labelLine: { show: false }
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    position: 'center',
                                    textStyle: {
                                        fontSize: '50',
                                        fontWeight: 'bold'
                                    }
                                }
                            }
                        }
                    }, config.donut || {});
                } else if (type === 'pie') {
                    conf = angular.extend(conf, {
                        itemStyle: {
                            normal: {
                                label: {
                                    position: 'inner',
                                    formatter: function (item) {
                                        return (+item.percent).toFixed() + '%';
                                    }
                                },
                                labelLine: { show: false }
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    formatter: '{b}\n{d}%'
                                }
                            }
                        }
                    }, config.pie || {});
                }
            }
            if (isMapChart(type)) {
                conf.type = 'map';
                conf = angular.extend(conf, serie, config.map || {});
            }
            // if stack set to true
            if (config.stack) {
                conf.stack = 'total';
            }
            if (type === 'radar') {
                conf.data = serie.data;
            }
            series.push(conf);
        });
        return series;
    }
    /**
     * get legends from data series
     */
    function getLegend(data, config, type) {
        var legend = { data: [] };
        if (isPieChart(type)) {
            if (data[0]) {
                angular.forEach(data[0].datapoints, function (datapoint) {
                    legend.data.push(datapoint.x);
                });
            }
            legend.orient = 'verticle';
            legend.x = 'right';
            legend.y = 'center';
        } else if (type === 'map') {
            legend = {};
        } else {
            angular.forEach(data, function (serie) {
                legend.data.push(serie.name);
            });
            legend.orient = 'horizontal';
        }
        return angular.extend(legend, config.legend || {});
    }
    /**
     * get tooltip config
     */
    function getTooltip(data, config, type) {
        var tooltip = {};
        switch (type) {
        case 'line':
        case 'area':
            tooltip.trigger = 'axis';
            break;
        case 'pie':
        case 'donut':
        case 'bar':
        case 'map':
        case 'gauge':
            tooltip.trigger = 'item';
            break;
        }
        if (type === 'pie') {
            tooltip.formatter = '{a} <br/>{b}: {c} ({d}%)';
        }
        if (type === 'map') {
            tooltip.formatter = '{b}';
        }
        return angular.extend(tooltip, angular.isObject(config.tooltip) ? config.tooltip : {});
    }
    function getTitle(data, config, type) {
        if (angular.isObject(config.title)) {
            return config.title;
        }
        return isPieChart(type) ? null : {
            text: config.title,
            subtext: config.subtitle || '',
            x: 50
        };
    }
    function formatKMBT(y, formatter) {
        if (!formatter) {
            formatter = function (v) {
                return Math.round(v * 100) / 100;
            };
        }
        y = Math.abs(y);
        if (y >= 1000000000000) {
            return formatter(y / 1000000000000) + 'T';
        } else if (y >= 1000000000) {
            return formatter(y / 1000000000) + 'B';
        } else if (y >= 1000000) {
            return formatter(y / 1000000) + 'M';
        } else if (y >= 1000) {
            return formatter(y / 1000) + 'K';
        } else if (y < 1 && y > 0) {
            return formatter(y);
        } else if (y === 0) {
            return '';
        } else {
            return formatter(y);
        }
    }
    return {
        isPieChart: isPieChart,
        isAxisChart: isAxisChart,
        getAxisTicks: getAxisTicks,
        getSeries: getSeries,
        getLegend: getLegend,
        getTooltip: getTooltip,
        getTitle: getTitle,
        formatKMBT: formatKMBT
    };
});})();