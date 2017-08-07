# eCharts + AngularJS

AngularJS directives to use [eCharts](http://ecomfe.github.io/echarts/index-en.html)

## Prerequisites

You will need the following things properly installed on your computer.

* [Node.js](http://nodejs.org/) (with NPM) and [Bower](http://bower.io/)

## Breaking Changes in V1

* `echart` support is v3.4.0;
* `angular` support is v1.6.2;
* map chart requires additional work, see below;
* custome themes are removed, all uses the build in ones;

## Building

- Preparing
`bower install` & `npm install`

- default
`gulp`
> develop with realtime monitor, automatic open browser to view example

- build
`gulp build`
> Build file to dist

- publish
`gulp publish`
> Build & bump npm versions

## Usage

Install bower dependency and save for production

```
$ bower install angular-echarts --save
```

Inject echarts and angular-echarts file into page

```
<script src="path/to/bower_components/echarts/dist/echarts.js"></script>
<script src="path/to/bower_components/angular-echarts/dist/angular-echarts.min.js"></script>
```

*Download and inject map definitions if you want a map chart: http://echarts.baidu.com/download-map.html*

Add dependency and declare a demo controller

```
var app = angular.module('demo', ['angular-echarts']);
app.controller('LineChartController', function ($scope) {

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
            { x: 2010, y: 1012 },
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

    $scope.config = {
        title: 'Line Chart',
        subtitle: 'Line Chart Subtitle',
        debug: true,
        showXAxis: true,
        showYAxis: true,
        showLegend: true,
        stack: false,
    };

    $scope.data = [ pageload ];
    $scope.multiple = [pageload, firstPaint ];

});
```

Use this markup for a quick demo

```
<div class="col-md-3" ng-controller="LineChartController">
    <line-chart config="config" data="data"></line-chart>
    <line-chart config="config" data="multiple"></line-chart>
</div>
```

## Contribute

* `git clone git@github.com:wangshijun/angular-echarts.git`
* change into the new directory
* `npm install`
* `bower install`

### __Running / Development__

* open ```docs/index.html``` in browser

> Or you can use `gulp server` and visit `http://localhost:8080` in Chrome browser, to avoid `XMLHttpRequest Cross origin requests` error.


## TODO
- [ ] Add chart provider with global configurations
- [ ] Add support to the remaining charts i.e tree, treemap etc
- [ ] Create chart widget with bootstrap style i.e panel

## References
- [https://ecomfe.github.io/echarts-doc/public/en/tutorial.html#Customerized%20Chart%20Styles](https://ecomfe.github.io/echarts-doc/public/en/tutorial.html#Customerized%20Chart%20Styles)

## Implementations

### Simple Bar Chart (simple-bar-chart)
```js
{
    color: ['#3398DB', '#C8B1EF', '#263238', '#960F1E', '#06C947'],
    tooltip : {
        trigger: 'axis',
        axisPointer : {       
            type : 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            data : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            axisTick: {
                alignWithLabel: true
            }
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'直接访问',
            type:'bar',
            barWidth: '60%',
            data:[
                    {
                        name:'', 
                        value:10, 
                        itemStyle:{
                            normal:{
                                color: '#3398DB'
                            }
                        }
                    }, 
                    {
                        name:'', 
                        value:52,
                        itemStyle:{
                            normal:{
                                color: '#960F1E'
                            }
                        }
                        
                    },
                    {
                        name:'', 
                        value:200,
                        itemStyle:{
                            normal:{
                                color: '#263238'
                            }
                        }
                    }, 
                    {
                        name:'', 
                        value:334,
                        itemStyle:{
                            normal:{
                                color: '#06C947'
                            }
                        }
                    }, 
                    {
                        name:'', 
                        value:39,
                        itemStyle:{
                            normal:{
                                color: '#C8B1EF'
                            }
                        }
                    }
                ]
        }
    ]
};
```

## Inverted Simple Bar Chart (simple-bar-chart)
```js
{
    color: ['#3398DB', '#C8B1EF', '#263238', '#960F1E', '#06C947'],
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    yAxis : [
        {
            type : 'category',
            data : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            axisTick: {
                alignWithLabel: true
            }
        }
    ],
    xAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'直接访问',
            type:'bar',
            barWidth: '60%',
            data:[
                    {
                        name:'', 
                        value:10, 
                        itemStyle:{
                            normal:{
                                color: '#3398DB'
                            }
                        }
                    }, 
                    {
                        name:'', 
                        value:52,
                        itemStyle:{
                            normal:{
                                color: '#960F1E'
                            }
                        }
                        
                    },
                    {
                        name:'', 
                        value:200,
                        itemStyle:{
                            normal:{
                                color: '#263238'
                            }
                        }
                    }, 
                    {
                        name:'', 
                        value:334,
                        itemStyle:{
                            normal:{
                                color: '#06C947'
                            }
                        }
                    }, 
                    {
                        name:'', 
                        value:39,
                        itemStyle:{
                            normal:{
                                color: '#C8B1EF'
                            }
                        }
                    }
                ]
        }
    ]
};
```