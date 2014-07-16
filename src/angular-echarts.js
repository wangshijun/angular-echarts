(function () {
    'use strict';

    var defaultWidth = 360;
    var defaultHeight = 240;

    /**
     * get x axis ticks from the 1st serie
     */
    function getAxisTicks(data, config, type) {
        var ticks = [];
        angular.forEach(data[0].datapoints, function (datapoint) {
            ticks.push(datapoint.x);
        });

        return {
            type: 'category',
            boundaryGap: false,
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
                }
            }

            // if stack set to true
            if (config.stack) {
                conf.stack = 'total';
            }

            series.push(conf);
        });

        return series;
    }

    function isPieChart(type) {
        return ['pie', 'donut'].indexOf(type) > -1;
    }

    function isAxisChart(type) {
        return ['line', 'bar', 'area'].indexOf(type) > -1;
    }

    /**
     * get legends from data series
     */
    function getLegend(data, config, type) {
        var legend = { data: []};
        if (isPieChart(type)) {
            angular.forEach(data[0].datapoints, function (datapoint) {
                legend.data.push(datapoint.x);
            });
            legend.orient = 'verticle';
            legend.x = 'right';
            legend.y = 'center';

        } else {
            angular.forEach(data, function (serie) {
                legend.data.push(serie.name);
            });
        }

        return angular.extend(legend, config.legend || {});
    }

    /**
     * get tooltip config
     */
    function getTooltip(data, config, type) {
        if (angular.isObject(config.tooltip)) {
            return config.tooltip;
        }

        var tooltip = {};
        switch (type) {
            case 'line':
            case 'area':
                tooltip.trigger = 'axis';
                break;
            case 'pie':
            case 'donut':
            case 'bar':
            case 'gauge':
                tooltip.trigger = 'item';
                break;
        }

        if (type === 'pie') {
            tooltip.formatter = '{a} <br/>{b}: {c} ({d}%)';
        }

        return tooltip;
    }

    function getTitle(data, config, type) {
        if (angular.isObject(config.title)) {
            return config.title;
        }

        return isPieChart(type) ? null: {
            text: config.title,
            subtext: config.subtitle || '',
        };
    }

    /**
     * get chart options object
     *
     * @param {Object} config
     *      - showXAxis
     *      - showYAxis
     *      - showLegend
     *      - showToolbox
     */
    function getOptions(data, config, type) {
        // merge default config
        config = angular.extend({
            showXAxis: true,
            showYAxis: true,
            showLegend: true,
        }, config);

        // basic config
        var options = {
            title: getTitle(data, config, type),
            tooltip: getTooltip(data, config, type),
            legend: getLegend(data, config, type),
            toolbox: {      // TODO make this overwritable
                show: false,
            },
            // 充分利用控件展示图表
            grid: { x: 0, y: 10 },
            calculable: false,
            xAxis: [ getAxisTicks(data, config, type) ],
            yAxis: [ { type: 'value' } ],
            series: getSeries(data, config, type),
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

        if (!isAxisChart(type)) {
            delete options.xAxis;
            delete options.yAxis;
            delete options.grid;
        }

        return options;
    }

    /**
     * generate directive link function
     *
     * @param {Service} $http, http service to make ajax requests from angular
     * @param {String} type, chart type
     */
    function getLinkFunction($http, type) {
        return function (scope, element, attrs) {
            var dom  = element.find('div')[0];
            var width = attrs.width || defaultWidth;
            var height = attrs.height || defaultHeight;

            dom.style.width = width + 'px';
            dom.style.height = height + 'px';

            var chart = echarts.init(dom, getTheme(scope.config.theme || 'macarons'));

            function setOptions() {
                if (scope.data && scope.config) {
                    var options = getOptions(scope.data, scope.config, type);
                    if (scope.config.debug) {
                        console.log(options);
                    }
                    chart.setOption(options);
                }
            }

            // string type for data param is assumed to ajax datarequests
            if (!scope.data && angular.isString(attrs.url)) {
                console.log('load data from remote: ' + attrs.url);

                // show loading
                chart.showLoading({ text: scope.config.loading || '奋力加载中...' });

                // fire data request
                $http.get(attrs.url)
                    .success(function (response) {
                        chart.hideLoading();
                        console.log(response);
                        if (response.data) {
                            scope.data = response.data;
                            setOptions();
                        } else {
                            throw new Error('angular-echarts: no data loaded from ' + attrs.url);
                        }
                    })
                    .error(function (response) {
                        chart.hideLoading();
                        console.log(response);
                        throw new Error('angular-echarts: error loading data from ' + attrs.url);
                    });

            // if data is avaliable, render immediately
            } else {
                setOptions();
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
    angular.module('angular-echarts', [])
        .directive('lineChart', function ($http) {
            return {
                restrict: 'EA',
                template: '<div></div>',
                scope: {
                    config: '=config',
                    data: '=data'
                },
                link: getLinkFunction($http, 'line')
            };
        })
        .directive('barChart', function ($http) {
            return {
                restrict: 'EA',
                template: '<div></div>',
                scope: {
                    config: '=config',
                    data: '=data'
                },
                link: getLinkFunction($http, 'bar')
            };
        })
        .directive('areaChart', function ($http) {
            return {
                restrict: 'EA',
                template: '<div></div>',
                scope: {
                    config: '=config',
                    data: '=data'
                },
                link: getLinkFunction($http, 'area')
            };
        })
        .directive('pieChart', function ($http) {
            return {
                restrict: 'EA',
                template: '<div></div>',
                scope: {
                    config: '=config',
                    data: '=data'
                },
                link: getLinkFunction($http, 'pie')
            };
        })
        .directive('donutChart', function ($http) {
            return {
                restrict: 'EA',
                template: '<div></div>',
                scope: {
                    config: '=config',
                    data: '=data'
                },
                link: getLinkFunction($http, 'donut')
            };
        })
        .directive('gaugeChart', function ($http) {
            return {
                restrict: 'EA',
                template: '<div></div>',
                scope: {
                    config: '=config',
                    data: '=data'
                },
                link: getLinkFunction($http, 'gauge')
            };
        });

    // posible themes: infographic macarons shine dark blue green red gray default
    // steal from: echarts/doc/example/theme/macarons.js
    // TODO more themes
    function getTheme(name) {
        var macarons = {
            // 默认色板
            color: [
                '#2ec7c9','#b6a2de','#5ab1ef','#ffb980','#d87a80',
                '#8d98b3','#e5cf0d','#97b552','#95706d','#dc69aa',
                '#07a2a4','#9a7fd1','#588dd5','#f5994e','#c05050',
                '#59678c','#c9ab00','#7eb00a','#6f5553','#c14089'
            ],

            // 图表标题
            title: {
                itemGap: 8,
                textStyle: {
                    fontWeight: 'normal',
                    color: '#008acd'          // 主标题文字颜色
                }
            },

            // 图例
            legend: {
                itemGap: 8
            },

            // 值域
            dataRange: {
                itemWidth: 15,
                //color:['#1e90ff','#afeeee']
                color: ['#2ec7c9','#b6a2de']
            },

            toolbox: {
                color: ['#1e90ff', '#1e90ff', '#1e90ff', '#1e90ff'],
                effectiveColor: '#ff4500',
                itemGap: 8
            },

            // 提示框
            tooltip: {
                backgroundColor: 'rgba(50,50,50,0.5)',     // 提示背景颜色，默认为透明度为0.7的黑色
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'line',         // 默认为直线，可选为：'line' | 'shadow'
                    lineStyle: {          // 直线指示器样式设置
                        color: '#008acd'
                    },
                    crossStyle: {
                        color: '#008acd'
                    },
                    shadowStyle: {                     // 阴影指示器样式设置
                        color: 'rgba(200,200,200,0.2)'
                    }
                }
            },

            // 区域缩放控制器
            dataZoom: {
                dataBackgroundColor: '#efefff',            // 数据背景颜色
                fillerColor: 'rgba(182,162,222,0.2)',   // 填充颜色
                handleColor: '#008acd'    // 手柄颜色
            },

            // 网格
            grid: {
                borderColor: '#eee'
            },

            // 类目轴
            categoryAxis: {
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: '#008acd',
                        width: 1,
                    }
                },
                axisTick: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: '#008acd',
                        width: 1,
                    }
                },
                splitLine: {           // 分隔线
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: ['#eee']
                    }
                }
            },

            // 数值型坐标轴默认参数
            valueAxis: {
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: '#008acd',
                        width: 1,
                    }
                },
                axisTick: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: '#008acd',
                        width: 1,
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.1)','rgba(200,200,200,0.1)']
                    }
                },
                splitLine: {           // 分隔线
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: ['#eee']
                    }
                }
            },

            polar: {
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: '#ddd'
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.2)','rgba(200,200,200,0.2)']
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#ddd'
                    }
                }
            },

            timeline: {
                lineStyle: {
                    color: '#008acd'
                },
                controlStyle: {
                    normal: { color: '#008acd'},
                    emphasis: { color: '#008acd'}
                },
                symbol: 'emptyCircle',
                symbolSize: 3
            },

            // 柱形图默认参数
            bar: {
                itemStyle: {
                    normal: {
                        borderRadius: 5
                    },
                    emphasis: {
                        borderRadius: 5
                    }
                }
            },

            // 折线图默认参数
            line: {
                smooth: true,
                symbol: 'emptyCircle',  // 拐点图形类型
                symbolSize: 3           // 拐点图形大小
            },

            // K线图默认参数
            k: {
                itemStyle: {
                    normal: {
                        color: '#d87a80',       // 阳线填充颜色
                        color0: '#2ec7c9',      // 阴线填充颜色
                        lineStyle: {
                            width: 1,
                            color: '#d87a80',   // 阳线边框颜色
                            color0: '#2ec7c9'   // 阴线边框颜色
                        }
                    }
                }
            },

            // 散点图默认参数
            scatter: {
                symbol: 'circle',    // 图形类型
                symbolSize: 4        // 图形大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2
            },

            // 雷达图默认参数
            radar: {
                symbol: 'emptyCircle',    // 图形类型
                symbolSize:3
                //symbol: null,         // 拐点图形类型
                //symbolRotate: null,  // 图形旋转控制
            },

            map: {
                itemStyle: {
                    normal: {
                        areaStyle: {
                            color: '#ddd'
                        },
                        label: {
                            textStyle: {
                                color: '#d87a80'
                            }
                        }
                    },
                    emphasis: {                 // 也是选中样式
                        areaStyle: {
                            color: '#fe994e'
                        },
                        label: {
                            textStyle: {
                                color: 'rgb(100,0,0)'
                            }
                        }
                    }
                }
            },

            force: {
                itemStyle: {
                    normal: {
                        linkStyle: {
                            strokeColor: '#1e90ff'
                        }
                    }
                }
            },

            chord: {
                padding: 4,
                itemStyle: {
                    normal: {
                        lineStyle: {
                            width: 1,
                            color: 'rgba(128, 128, 128, 0.5)'
                        },
                        chordStyle: {
                            lineStyle: {
                                width: 1,
                                color: 'rgba(128, 128, 128, 0.5)'
                            }
                        }
                    },
                    emphasis: {
                        lineStyle: {
                            width: 1,
                            color: 'rgba(128, 128, 128, 0.5)'
                        },
                        chordStyle: {
                            lineStyle: {
                                width: 1,
                                color: 'rgba(128, 128, 128, 0.5)'
                            }
                        }
                    }
                }
            },

            gauge: {
                startAngle: 225,
                endAngle: -45,
                axisLine: {            // 坐标轴线
                    show: true,        // 默认显示，属性show控制显示与否
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: [[0.2, '#2ec7c9'],[0.8, '#5ab1ef'],[1, '#d87a80']],
                        width: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    splitNumber: 10,   // 每份split细分多少段
                    length :15,        // 属性length控制线长
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
                    length :22,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5,
                    color: 'auto'
                },
                title: {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        color: '#333'
                    }
                },
                detail: {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        color: 'auto'
                    }
                }
            },

            textStyle: {
                fontFamily: '微软雅黑, Arial, Verdana, sans-serif'
            }
        };

        return macarons;
    }

})();
