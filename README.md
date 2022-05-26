[Русское описание](https://github.com/VladimirKalachikhin/GaladrielMapSK/blob/master/README.ru-RU.md)  
# GaladrielMap SignalK edition[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
This is a [SignalK](https://signalk.org/)-based chart plotter navigation software for pleasure crafts, motorhomes, and off-road cars. With SignalK server it can work on mobile clients without install any app.  Only browser need.
<div style='float:right;'><a href='https://github.com/VladimirKalachikhin/Galadriel-map/discussions'>Forum</a>
</div>

## v. 0.2 

This software is a edition of the [GaladrielMap](https://vladimirkalachikhin.github.io/Galadriel-map/), designed to work as SignalK webapp. Refer to the [GaladrielMap](https://vladimirkalachikhin.github.io/Galadriel-map/) documentation for information.

## Limitations
* GaladrielMap SignalK edition use [@signalk/charts-plugin](https://www.npmjs.com/package/@signalk/charts-plugin) for charts instead [GaladrielCache](https://github.com/VladimirKalachikhin/Galadriel-cache). So [Weather](http://weather.openportguide.de/index.php/en/) map is not available, such well as some other maps from GaladrielMap. There is also no tile caching.  
* Since SignalK has no built-in controls of data actuality such as in [gpsdPROXY](https://github.com/VladimirKalachikhin/gpsdPROXY) on GaladrielMap, basic features added.

## Features
GaladrielMap SignalK edition handle SignalK notification system.     
If the [collision-detector](https://www.npmjs.com/package/collision-detector) is installed, the GaladrielMap SignalK edition highlights dangerous vessels on the map and indicates the direction to them on self cursor. 

## Install&configure:
Install this software from SignalK Appstore as **galadrielmap_sk**.  
Restart SignalK,  
Use Server -> Plugin Config menu of SignalK web control panel to start plugin and configure parameters.  
Press Submit to save changes.  

## Usage
Go to Webapps menu of SignalK web control panel and open **Galadrielmap_sk**; or open _http://your-signalk:3000/galadrielmap_sk/_

### Track logging
Install [naiveGPXlogger](https://www.npmjs.com/package/naivegpxlogger) to track logging. You can control the log recording in the GaladrielMap interface.
But GaladrielMap has a possibility to show any currently being recorded .gpx file. Therefore, if some program in the server writes track log to .gpx, this file can be displayed on the screen dynamically. Specify the directory with .gpx file in GaladrielMap settings for this. 


## Extension of SignalK protocol
The `value` of `notifications.mob` path has  the following additional properties except specified in the documentation:  

`"source":` the UUID of instance firing of notification,  
`"position":` the GeoJSON object with MOB spatial info


## Support
[Discussions](https://github.com/VladimirKalachikhin/Galadriel-map/discussions)

The forum will be more lively if you make a donation [via PayPal](https://paypal.me/VladimirKalachikhin)  at [galadrielmap@gmail.com](mailto:galadrielmap@gmail.com) or at [ЮMoney](https://yasobe.ru/na/galadrielmap)

[Paid personal consulting](https://kwork.ru/it-support/20093939/galadrielmap-installation-configuration-and-usage-consulting)  
