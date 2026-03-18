[Русское описание](README.ru-RU.md)  
# GaladrielMap SignalK edition [![License: CC BY-NC-SA 4.0](Cc-by-nc-sa_icon.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en)
This is a [SignalK](https://signalk.org/)-based chart plotter navigation software (chartplotter) for pleasure crafts, motorhomes, and off-road cars. With SignalK server it can work on mobile clients without install any app.  Only browser need.
<div style='float:right;'><a href='https://github.com/VladimirKalachikhin/Galadriel-map/discussions'>Forum</a>
</div>

## v. 0.13

The chartplotter is a edition of the [GaladrielMap](https://vladimirkalachikhin.github.io/Galadriel-map/), designed to work as SignalK webapp. Refer to the [GaladrielMap](https://vladimirkalachikhin.github.io/Galadriel-map/) documentation for information.

## Limitations
* GaladrielMap SignalK edition use [@signalk/charts-plugin](https://www.npmjs.com/package/@signalk/charts-plugin) for charts instead [GaladrielCache](https://github.com/VladimirKalachikhin/Galadriel-cache). So [Weather](http://weather.openportguide.de/index.php/en/) map is not available, such well as some other maps from GaladrielMap. There is also no tile caching.  
* Since SignalK has no built-in controls of data actuality such as in [gpsdPROXY](https://github.com/VladimirKalachikhin/gpsdPROXY) on GaladrielMap, basic features added. The current age of the data is displayed in the upper left corner of the "Speed&heading" tab.  
* Die to limitations of the SignalK architecture  there is no way to save to a server the .gpx file larger than 4Kb in GPX Editor.
* Only *terrarium* style DEM tiles support because no way to specify the DEM file type.

## Features
GaladrielMap SignalK edition handle SignalK notification system.     
If the [collision-detector](https://www.npmjs.com/package/collision-detector) is installed, the GaladrielMap SignalK edition highlights dangerous vessels on the map and indicates the direction to them on self cursor.  
If [naivegpxlogger](https://www.npmjs.com/package/naivegpxlogger) is installed,  it becomes convenient to record the path in gpx format.

### Vector maps
Supported mapbox-like vector maps. You must place the styles, sprites and glyphs in a directory accessible by http from **GaladrielMap SignalK edition**.  
`/usr/local/lib/node_modules/galadrielmap_sk/public/styles/` for example.  
You should change the url's in the style files so that they point to your tiles, sprites and glyphs. "The URL must be absolute, containing the scheme, authority and path components."
In the [@signalk/charts-plugin](https://www.npmjs.com/package/@signalk/charts-plugin) configure the *Provider* by specifying *Format* to pbf (regardless of the actual tile format) and *Vector Map Style* to your map style url.

### DEM tiles
Supported mapbox styled DEM tiles in *terrarium* style. In the [@signalk/charts-plugin](https://www.npmjs.com/package/@signalk/charts-plugin) configure the *Provider* by specifying *Format* to pbf and *Vector Map Style* to your map style url.

## Install&configure:
Install chartplotter from SignalK Appstore as **galadrielmap_sk**.  
Restart SignalK,  
Use Server -> Plugin Config menu of SignalK web control panel to start plugin and configure parameters.  
Press Submit to save changes.  

## Usage
Go to Webapps menu of SignalK web control panel and open **Galadrielmap_sk**; or open _http://your-signalk:3000/galadrielmap_sk/_

### Track logging
Install [naiveGPXlogger](https://www.npmjs.com/package/naivegpxlogger) to track logging. You can control the log recording in the chartplotter interface.
But GaladrielMap has a possibility to show any currently being recorded .gpx file. Therefore, if some program in the server writes track log to .gpx, this file can be displayed on the screen dynamically. Specify the directory with .gpx file in chartplotter settings for this. 


## Extension of SignalK protocol
The `value` of `notifications.mob` path has  the following additional properties except specified in the documentation:  

`"source":` the UUID of instance firing of notification,  
`"position":` the GeoJSON object with MOB spatial info and other necessary.


## Support
[Discussions](https://github.com/VladimirKalachikhin/Galadriel-map/discussions)

The forum will be more lively if you make a donation at [ЮMoney](https://sobe.ru/na/galadrielmap)

[Paid personal consulting](https://kwork.ru/it-support/20093939/galadrielmap-installation-configuration-and-usage-consulting)  
