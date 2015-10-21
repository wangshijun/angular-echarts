# eCharts + AngularJS

AngularJS directives to use [eCharts](http://ecomfe.github.io/echarts/index-en.html)

## Prerequisites

You will need the following things properly installed on your computer.

* [Node.js](http://nodejs.org/) (with NPM) and [Bower](http://bower.io/)

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
<script src="path/to/bower_components/echarts/build/dist/echarts-all.js"></script>
<script src="path/to/bower_components/angular-echarts/dist/angular-echarts.min.js"></script>
```

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
