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
            data: ticks,
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
                data: datapoints,
            };

            // area chart is actually line chart with special itemStyle
            if (type === 'area') {
                conf.type = 'line';
                conf.itemStyle = {
                    normal: { areaStyle: { type: 'default'}}
                };
            }

            // gauge chart need many special config
            if (type === 'gauge') {
                conf = angular.extend(conf, {
                    splitNumber: 10,       // 分割段数，默认为5
                    axisLine: {            // 坐标轴线
                        lineStyle: {       // 属性lineStyle控制线条样式
                            color: [[0.2, '#228b22'], [0.8, '#48b'], [1, '#ff4500']],
                            width: 8
                        }
                    },
                    axisTick: {            // 坐标轴小标记
                        splitNumber: 10,   // 每份split细分多少段
                        length :12,        // 属性length控制线长
                        lineStyle: {       // 属性lineStyle控制线条样式
                            color: 'auto'
                        }
                    },
                    axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            color: 'auto'
                        }
                    },
                    splitLine: {           // 分隔线
                        show: true,        // 默认显示，属性show控制显示与否
                        length :30,         // 属性length控制线长
                        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                            color: 'auto'
                        }
                    },
                    pointer: {
                        width: 5
                    },
                    title: {
                        show: true,
                        offsetCenter: [0, '-40%'],       // x, y，单位px
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    detail: {
                        formatter: '{value}%',
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            color: 'auto',
                            fontWeight: 'bolder'
                        }
                    },
                }, config.gauge || {});
            }

            // datapoints for pie chart and gauges are different
            if (!isAxisChart(type)) {
                conf.data = [];
                angular.forEach(serie.datapoints, function (datapoint) {
                    conf.data.push({value: datapoint.y, name: datapoint.x });
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
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                }
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
                            normal : {
                                label : {
                                    position : 'inner',
                                    formatter : function (a,b,c,d) { return (d - 0).toFixed(0) + '%'; }
                                },
                                labelLine : {
                                    show : false
                                }
                            },
                            emphasis : {
                                label : {
                                show : true,
                                    formatter : '{b}\n{d}%'
                                }
                            }
                        }
                    }, config.pie || {});
                }
            }

            if (isMapChart(type)) {
                conf.type = 'map';
                conf = angular.extend(conf, {}, config.map || {});
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
        var legend = { data: []};
        if (isPieChart(type)) {
            if (data[0]) {
                angular.forEach(data[0].datapoints, function (datapoint) {
                    legend.data.push(datapoint.x);
                });
            }
            legend.orient = 'verticle';
            legend.x = 'right';
            legend.y = 'center';

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

        return isPieChart(type) ? null: {
            text: config.title,
            subtext: config.subtitle || '',
            x: 50,
        };
    }

    function formatKMBT(y, formatter) {
        if (!formatter) {
            formatter = function (v) { return Math.round(v * 100) / 100; };
        }
        y = Math.abs(y);
        if (y >= 1000000000000)   { return formatter(y / 1000000000000) + 'T'; }
        else if (y >= 1000000000) { return formatter(y / 1000000000) + 'B'; }
        else if (y >= 1000000)    { return formatter(y / 1000000) + 'M'; }
        else if (y >= 1000)       { return formatter(y / 1000) + 'K'; }
        else if (y < 1 && y > 0)  { return formatter(y); }
        else if (y === 0)         { return ''; }
        else                      { return formatter(y); }
    }

    return {
        isPieChart: isPieChart,
        isAxisChart: isAxisChart,
        getAxisTicks: getAxisTicks,
        getSeries: getSeries,
        getLegend: getLegend,
        getTooltip: getTooltip,
        getTitle: getTitle,
        formatKMBT: formatKMBT,
    };

});
