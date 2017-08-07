'use strict';

/**
 * simple echarts directive
 * Merge of concepts from https://github.com/liekkas/ng-echarts & 
 * https://github.com/wangshijun/angular-echarts
 * @author lykmapipo <https://github.com/lykmapipo>
 * //TODO support $http
 * //TODO add basic charts shortcuts
 */
angular
    .module('angular-echarts')
    .directive('echart', [function() {
        return {
            restrict: 'EA',
            template: '<div config="config" options="options"></div>',
            scope: {
                options: '=options',
                config: '=config',
                chartObj: '=?chartObj'
            },
            link: function link(scope, element, attrs, ctrl) {

                //globals
                var chartDOM = element.find('div')[0];
                var parent = element.parent()[0];
                var parentWidth = parent.clientWidth;
                var parentHeight = parent.clientHeight;
                var width = parseInt(attrs.width) || parentWidth || 320;
                var height = parseInt(attrs.height) || parentHeight || 240;

                //ensure config
                var config = scope.config || {};

                //reference chart
                var chart;

                /**
                 * Update or create a echart based on scope config
                 * and options
                 */
                function refreshChart() {

                    var theme = (scope.config && scope.config.theme) ?
                        scope.config.theme : 'shine';

                    //compute chart width & height
                    width = (config.width || width);
                    height = (config.height || height);

                    //ensure width & height
                    config = angular.extend({
                        width: width,
                        height: height
                    }, scope.config);

                    //ensure chart dom height & width
                    chartDOM.style.width = config.width + 'px';
                    chartDOM.style.height = config.height + 'px';

                    if (!chart) {
                        chart = echarts.init(chartDOM, theme);
                    }

                    //TODO handle remote data loading
                    //using url and promise

                    //force clear chart if so
                    if (config.forceClear) {
                        chart.clear();
                    }

                    if (config && scope.options) {
                        chart.setOption(scope.options);
                        chart.resize();
                        chart.hideLoading();
                    }

                    if (config && config.event) {

                        //normalize event config
                        if (!Array.isArray(config.event)) {
                            config.event = [config.event];
                        }

                        //bind chart events
                        if (angular.isArray(config.event)) {
                            angular.forEach(config.event, function(value, key) {
                                for (var e in value) {
                                    chart.on(e, value[e]);
                                }
                            });
                        }
                    }
                };

                //watch config and update chart
                //see https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch
                //see https://www.sitepoint.com/mastering-watch-angularjs/
                var unwatchConfig = scope.$watch(
                    function() { //expression
                        return scope.config;
                    },
                    function(value) { //listener
                        if (value) {
                            refreshChart();
                        }
                    },
                    true // perfom deep comparison
                );

                //watch options and update chart
                //see https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch
                //see https://www.sitepoint.com/mastering-watch-angularjs/
                var unwatchOptions = scope.$watch(
                    function() { //expression
                        return scope.options;
                    },
                    function(value) { //listener
                        if (value) {
                            refreshChart();
                        }
                    },
                    true // perfom deep comparison
                );

                //de-register listeners on scope destroy
                scope.$on('$destroy', function deregister() {

                    //de-register config watch
                    if (unwatchConfig) {
                        unwatchConfig();
                    }

                    //de-register options watch
                    if (unwatchOptions) {
                        unwatchOptions();
                    }

                });

            }
        };
    }]);