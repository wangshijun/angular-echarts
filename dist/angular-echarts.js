(function () {'use strict';
/**
 * generate directive link function
 *
 * @param {Service} $http, http service to make ajax requests from angular
 * @param {String} type, chart type
 */
function getLinkFunction($http, theme, util, type) {
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
                    xAxis: util.isHeatmapChart(type) ? config.xAxis : [ angular.extend(xAxis, util.getAxisTicks(data, config, type)) ],
                    yAxis: util.isHeatmapChart(type) ? config.yAxis : [ yAxis ],
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
            if (!util.isAxisChart(type) && !util.isHeatmapChart(type)) {
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
                chart = echarts.init(ndWrapper, scope.config.theme || 'shine');
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
var app = angular.module('angular-echarts', ['angular-echarts.theme', 'angular-echarts.util']);
var types = ['line', 'bar', 'area', 'pie', 'donut', 'gauge', 'map', 'radar', 'heatmap'];
for (var i = 0, n = types.length; i < n; i++) {
    (function (type) {
        app.directive(type + 'Chart', ['$http', 'theme', 'util', function ($http, theme, util) {
                    return {
                        restrict: 'EA',
                        template: '<div config="config" data="data"></div>',
                        scope: {
                            config: '=config',
                            data: '=data',
                            chartObj: '=?chartObj'
                        },
                        link: getLinkFunction($http, theme, util, type)
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
    function isHeatmapChart(type) {
        return ['heatmap'].indexOf(type) > -1;
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
            if (isHeatmapChart(type)) {
                conf.type = 'heatmap';
                conf.name = serie.name;
                conf.data = serie.data;
                conf = angular.extend(conf, {
                    label: { normal: { show: true } },
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }, config.heatmap || {});
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
        isHeatmapChart: isHeatmapChart,
        getAxisTicks: getAxisTicks,
        getSeries: getSeries,
        getLegend: getLegend,
        getTooltip: getTooltip,
        getTitle: getTitle,
        formatKMBT: formatKMBT
    };
});
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
'use strict';
/**
 * dark theme
 */
angular.module('angular-echarts.theme').factory('dark', function () {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }
    var contrastColor = '#eee';
    var axisCommon = function () {
        return {
            axisLine: { lineStyle: { color: contrastColor } },
            axisTick: { lineStyle: { color: contrastColor } },
            axisLabel: { textStyle: { color: contrastColor } },
            splitLine: {
                lineStyle: {
                    type: 'dashed',
                    color: '#aaa'
                }
            },
            splitArea: { areaStyle: { color: contrastColor } }
        };
    };
    var colorPalette = ['#dd6b66','#759aa0','#e69d87','#8dc1a9','#ea7e53','#eedd78','#73a373','#73b9bc','#7289ab', '#91ca8c','#f49f42'];
    var theme = {
            color: colorPalette,
            backgroundColor: '#333',
            tooltip: {
                axisPointer: {
                    lineStyle: { color: contrastColor },
                    crossStyle: { color: contrastColor }
                }
            },
            legend: { textStyle: { color: contrastColor } },
            textStyle: { color: contrastColor },
            title: { textStyle: { color: contrastColor } },
            toolbox: { iconStyle: { normal: { borderColor: contrastColor } } },
            dataZoom: { textStyle: { color: contrastColor } },
            timeline: {
                lineStyle: { color: contrastColor },
                itemStyle: { normal: { color: colorPalette[1] } },
                label: { normal: { textStyle: { color: contrastColor } } },
                controlStyle: {
                    normal: {
                        color: contrastColor,
                        borderColor: contrastColor
                    }
                }
            },
            timeAxis: axisCommon(),
            logAxis: axisCommon(),
            valueAxis: axisCommon(),
            categoryAxis: axisCommon(),
            line: { symbol: 'circle' },
            graph: { color: colorPalette },
            gauge: { title: { textStyle: { color: contrastColor } } },
            candlestick: {
                itemStyle: {
                    normal: {
                        color: '#FD1050',
                        color0: '#0CF49B',
                        borderColor: '#FD1050',
                        borderColor0: '#0CF49B'
                    }
                }
            }
        };
    theme.categoryAxis.splitLine.show = false;
    echarts.registerTheme('dark', theme);
    return theme;
});
'use strict';
/**
 * infographic theme
 */
angular.module('angular-echarts.theme').factory('infographic', function () {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }
    var colorPalette = [
                '#C1232B', '#27727B', '#FCCE10', '#E87C25', '#B5C334',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
            ];
    var theme = {
            color: colorPalette,
            title: {
                textStyle: {
                    fontWeight: 'normal',
                    color: '#27727B'
                }
            },
            visualMap: { color: ['#C1232B', '#FCCE10'] },
            toolbox: { iconStyle: { normal: { borderColor: colorPalette[0] } } },
            tooltip: {
                backgroundColor: 'rgba(50,50,50,0.5)',
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#27727B',
                        type: 'dashed'
                    },
                    crossStyle: { color: '#27727B' },
                    shadowStyle: { color: 'rgba(200,200,200,0.3)' }
                }
            },
            dataZoom: {
                dataBackgroundColor: 'rgba(181,195,52,0.3)',
                fillerColor: 'rgba(181,195,52,0.2)',
                handleColor: '#27727B'
            },
            categoryAxis: {
                axisLine: { lineStyle: { color: '#27727B' } },
                splitLine: { show: false }
            },
            valueAxis: {
                axisLine: { show: false },
                splitArea: { show: false },
                splitLine: {
                    lineStyle: {
                        color: ['#ccc'],
                        type: 'dashed'
                    }
                }
            },
            timeline: {
                lineStyle: { color: '#27727B' },
                controlStyle: {
                    normal: {
                        color: '#27727B',
                        borderColor: '#27727B'
                    }
                },
                symbol: 'emptyCircle',
                symbolSize: 3
            },
            line: {
                itemStyle: {
                    normal: {
                        borderWidth: 2,
                        borderColor: '#fff',
                        lineStyle: { width: 3 }
                    },
                    emphasis: { borderWidth: 0 }
                },
                symbol: 'circle',
                symbolSize: 3.5
            },
            candlestick: {
                itemStyle: {
                    normal: {
                        color: '#C1232B',
                        color0: '#B5C334',
                        lineStyle: {
                            width: 1,
                            color: '#C1232B',
                            color0: '#B5C334'
                        }
                    }
                }
            },
            graph: { color: colorPalette },
            map: {
                label: {
                    normal: { textStyle: { color: '#C1232B' } },
                    emphasis: { textStyle: { color: 'rgb(100,0,0)' } }
                },
                itemStyle: {
                    normal: {
                        areaColor: '#ddd',
                        borderColor: '#eee'
                    },
                    emphasis: { areaColor: '#fe994e' }
                }
            },
            gauge: {
                axisLine: {
                    lineStyle: {
                        color: [
                                                [0.2, '#B5C334'],
                                                [0.8, '#27727B'],
                                                [1, '#C1232B']
                                            ]
                    }
                },
                axisTick: {
                    splitNumber: 2,
                    length: 5,
                    lineStyle: { color: '#fff' }
                },
                axisLabel: { textStyle: { color: '#fff' } },
                splitLine: {
                    length: '5%',
                    lineStyle: { color: '#fff' }
                },
                title: { offsetCenter: [0, -20] }
            }
        };
    echarts.registerTheme('infographic', theme);
    return theme;
});
'use strict';
/**
 * macarons theme
 */
angular.module('angular-echarts.theme').factory('macarons', function () {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }
    var colorPalette = [
                '#2ec7c9','#b6a2de','#5ab1ef','#ffb980','#d87a80',
                '#8d98b3','#e5cf0d','#97b552','#95706d','#dc69aa',
                '#07a2a4','#9a7fd1','#588dd5','#f5994e','#c05050',
                '#59678c','#c9ab00','#7eb00a','#6f5553','#c14089'
            ];
    var theme = {
            color: colorPalette,
            title: {
                textStyle: {
                    fontWeight: 'normal',
                    color: '#008acd'
                }
            },
            visualMap: {
                itemWidth: 15,
                color: ['#5ab1ef','#e0ffff']
            },
            toolbox: { iconStyle: { normal: { borderColor: colorPalette[0] } } },
            tooltip: {
                backgroundColor: 'rgba(50,50,50,0.5)',
                axisPointer: {
                    type: 'line',
                    lineStyle: { color: '#008acd' },
                    crossStyle: { color: '#008acd' },
                    shadowStyle: { color: 'rgba(200,200,200,0.2)' }
                }
            },
            dataZoom: {
                dataBackgroundColor: '#efefff',
                fillerColor: 'rgba(182,162,222,0.2)',
                handleColor: '#008acd'
            },
            grid: { borderColor: '#eee' },
            categoryAxis: {
                axisLine: { lineStyle: { color: '#008acd' } },
                splitLine: { lineStyle: { color: ['#eee'] } }
            },
            valueAxis: {
                axisLine: { lineStyle: { color: '#008acd' } },
                splitArea: {
                    show: true,
                    areaStyle: { color: ['rgba(250,250,250,0.1)','rgba(200,200,200,0.1)'] }
                },
                splitLine: { lineStyle: { color: ['#eee'] } }
            },
            timeline: {
                lineStyle: { color: '#008acd' },
                controlStyle: {
                    normal: { color: '#008acd' },
                    emphasis: { color: '#008acd' }
                },
                symbol: 'emptyCircle',
                symbolSize: 3
            },
            line: {
                smooth: true,
                symbol: 'emptyCircle',
                symbolSize: 3
            },
            candlestick: {
                itemStyle: {
                    normal: {
                        color: '#d87a80',
                        color0: '#2ec7c9',
                        lineStyle: {
                            color: '#d87a80',
                            color0: '#2ec7c9'
                        }
                    }
                }
            },
            scatter: {
                symbol: 'circle',
                symbolSize: 4
            },
            map: {
                label: { normal: { textStyle: { color: '#d87a80' } } },
                itemStyle: {
                    normal: {
                        borderColor: '#eee',
                        areaColor: '#ddd'
                    },
                    emphasis: { areaColor: '#fe994e' }
                }
            },
            graph: { color: colorPalette },
            gauge: {
                axisLine: {
                    lineStyle: {
                        color: [[0.2, '#2ec7c9'],[0.8, '#5ab1ef'],[1, '#d87a80']],
                        width: 10
                    }
                },
                axisTick: {
                    splitNumber: 10,
                    length: 15,
                    lineStyle: { color: 'auto' }
                },
                splitLine: {
                    length: 22,
                    lineStyle: { color: 'auto' }
                },
                pointer: { width: 5 }
            }
        };
    echarts.registerTheme('macarons', theme);
    return theme;
});
'use strict';
/**
 * blue theme
 */
angular.module('angular-echarts.theme').factory('roma', function () {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }
    var colorPalette = ['#E01F54', '#001852', '#f5e8c8', '#b8d2c7', '#c6b38e',
                '#a4d8c2', '#f3d999', '#d3758f', '#dcc392', '#2e4783',
                '#82b6e9', '#ff6347', '#a092f1', '#0a915d', '#eaf889',
                '#6699FF', '#ff6666', '#3cb371', '#d5b158', '#38b6b6'
            ];
    var theme = {
            color: colorPalette,
            visualMap: {
                color: ['#e01f54', '#e7dbc3'],
                textStyle: { color: '#333' }
            },
            candlestick: {
                itemStyle: {
                    normal: {
                        color: '#e01f54',
                        color0: '#001852',
                        lineStyle: {
                            width: 1,
                            color: '#f5e8c8',
                            color0: '#b8d2c7'
                        }
                    }
                }
            },
            graph: { color: colorPalette },
            gauge: {
                axisLine: {
                    lineStyle: {
                        color: [
                                                [0.2, '#E01F54'],
                                                [0.8, '#b8d2c7'],
                                                [1, '#001852']
                                            ],
                        width: 8
                    }
                }
            }
        };
    echarts.registerTheme('roma', theme);
    return echarts;
});
'use strict';
/**
 * shine theme
 */
angular.module('angular-echarts.theme').factory('shine', function () {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }
    var colorPalette = [
                '#c12e34', '#e6b600', '#0098d9', '#2b821d',
                '#005eaa', '#339ca8', '#cda819', '#32a487'
            ];
    var theme = {
            color: colorPalette,
            title: { textStyle: { fontWeight: 'normal' } },
            visualMap: { color: ['#1790cf', '#a2d4e6'] },
            toolbox: { iconStyle: { normal: { borderColor: '#06467c' } } },
            tooltip: { backgroundColor: 'rgba(0,0,0,0.6)' },
            dataZoom: {
                dataBackgroundColor: '#dedede',
                fillerColor: 'rgba(154,217,247,0.2)',
                handleColor: '#005eaa'
            },
            timeline: {
                lineStyle: { color: '#005eaa' },
                controlStyle: {
                    normal: {
                        color: '#005eaa',
                        borderColor: '#005eaa'
                    }
                }
            },
            candlestick: {
                itemStyle: {
                    normal: {
                        color: '#c12e34',
                        color0: '#2b821d',
                        lineStyle: {
                            width: 1,
                            color: '#c12e34',
                            color0: '#2b821d'
                        }
                    }
                }
            },
            graph: { color: colorPalette },
            map: {
                label: {
                    normal: { textStyle: { color: '#c12e34' } },
                    emphasis: { textStyle: { color: '#c12e34' } }
                },
                itemStyle: {
                    normal: {
                        borderColor: '#eee',
                        areaColor: '#ddd'
                    },
                    emphasis: { areaColor: '#e6b600' }
                }
            },
            gauge: {
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: [
                                                [0.2, '#2b821d'],
                                                [0.8, '#005eaa'],
                                                [1, '#c12e34']
                                            ],
                        width: 5
                    }
                },
                axisTick: {
                    splitNumber: 10,
                    length: 8,
                    lineStyle: { color: 'auto' }
                },
                axisLabel: { textStyle: { color: 'auto' } },
                splitLine: {
                    length: 12,
                    lineStyle: { color: 'auto' }
                },
                pointer: {
                    length: '90%',
                    width: 3,
                    color: 'auto'
                },
                title: { textStyle: { color: '#333' } },
                detail: { textStyle: { color: 'auto' } }
            }
        };
    echarts.registerTheme('shine', theme);
    return theme;
});})();