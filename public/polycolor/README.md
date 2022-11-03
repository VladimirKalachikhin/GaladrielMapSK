# polycolorRenderer [![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
## v. 0.2
The Leaflet L.Renderer upon the idea [leaflet-polycolor](https://github.com/Oliv/leaflet-polycolor) project.  

Suitable for color-coding a Leaflet polyline based on additional values, e.g. altitude, speed, depth, etc... Main goal is a gradient color of segments to represent continuous values.  
Additionally, it is possible to set the `weight` option of each L.Polyline segment.

It can be used both for L.Polyline and L.GeoJSON LineString features.

## Usage
`<script src="polycolorRenderer.js"></script>`  

As the renderer has a narrow purpose, only the following options of L.Polyline are supported:  
- color
- opacity
- weight
- lineCap
- lineJoin
- dashArray
- dashOffset

### Polyline
```
let polyline = L.polyline(latLngs, {
	renderer: new polycolorRenderer(),
	colors: [......], // array of html colors
	useGradient: false,
	weights: [......] // array of segment's width
}).addTo(map);
```

### GeoJSON
It makes no sense to use the renderer for coloring GeoJSON LineString to solid colors. This is done naturally through `style` option. But it is impossible to make a gradient color in this way. Therefore, a renderer is needed:
```
var polyline = L.geoJSON(geoJSONdata,{
	style: function(feature){
		return {
			renderer: new polycolorRenderer(),
			colors: [......], // array of html colors
			weights: [......] // array of segment's width
		}
	}
}).addTo(map);
```

#### GeoJSON MultiLineString
The function L.geoJSON create "MultiPolyline" L.Polyline object. In this case, the `colors` array must contain arrays of colors similar in structure to GeoJSON MultiLineString "coordinates" object.  
However, any of these color arrays can be empty. Then all segments of the corresponding section will be colored in the color specified by the parameter `color`. Therefore, if you have a line of thousands of segments, and there are only a few additional values, for example, depths, there is no need to create a color array of thousands of *null* values. It is enough to make an GeoJSON MultiLineString object and a color array of three arrays:
```
const colors = [
	[],
	[few of color values...],
	[]
];
```
The same for `weights` array.

### Options

- `colors` \<Array>: An array of html colors strings `rgb(x,y,z), rgba(x,y,z,t)`or '#3388ff', or array of arrays of colors. Any of these arrays can be empty.
- `useGradient` \<Boolean>: Use or not gradient to smooth colors. Defaults to `true. `
- `weights` \<Array>: An array of segments stroke width in pixels. The number of values of this array is equal to the number of segments, that is a number of colors - 1.

If `colors`or weight are `undefined`, the default `color`or weight parameter is used.
To leave default value, use `null` in array:  
`['rgb(0, 0, 0)', null, 'rgb(0, 45, 120)']`  
No gradient is made between the default and the specified values.

## Demo
The _examples_ directory has a complete example of using the polycolorRenderer with GeoJSON data.