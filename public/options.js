// This file created automatically. Don't edit it!
const mob_markerImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAYAAAAjt+tHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEqUlEQVRYhcWXX0gUWxzHPzPujtOoedkuN4ryrcjgonFJkF5KVjaiICyK6qWXDaygxyKyQF+0etAIfJCgHgoKXQIpECOhuggby90QLERRgvbhcrul+6fZ2flzH2ZmHW1Xd2967w8OZzgzv/l+zu/8zpn5CZZlAdDa2uoDREByeh9razpgAhpgjo6O6gCCZVmuuATITpMcAHGNxE0HQANUp2mjo6O6EAwGXXEF2Oj0MusTARXIAAtOr7mzlB3xXyLR6PgaCy+xtqamZufSBHRv6JVINDouDwwgNjZSsXPnmgobU1OY8TiRcHi8ranpV5xl8CaeDKyLOLD8nW6eiW62u21dxAtA5DXdLF+rbC/HxP9L+HuKtTJ9bIxMKERy2zayvb3/LYARjaKeP48Ri4Fpot24QTIQwJicXH8Ac2aGb+3tWIkEyvPn1CQSKG/fImzeTKa5mWx3d1HfHz7tcoODZLu6sObm2PD0KUYsRranB2VoiOr371f1/1cA+sgI2Z4erNlZrHQaslnk/n58Bw6QPHoUgOTWrdQkEj8OYM7MkBsexpqdxYjFMOfmIJn87jn/6dOkduxYHEinS5rMigDplhZIpbCSSSr27MGcmCj4nBAIACDfvcu3EycAqAgGfxyg6uXL78YyoRDGxMSSGVbPztovC4WomZ8vSdi1FXeBeukSqfp6Ug0N5AYHAVBGRqhJJPIzXC747exZ26e+vqSzoChAuqUFobYWubeXyo4O9BcvyBw5gj4yYoMMDS0Rz16/TiYUQty1y/a5dQvzwwcyoVAevpAVXYLl4fcfPw6A1t9vw1VVgSRBKgWShHTlCtK1awiStOhz+DDWwgLa7dvg+JcMkHv0iNyDBwBYuRxiXR3S1av4w2Gk9nYsXQdNA1lGEEWshQVy9+6Re/jQhgOETZvwX7hAZWdn+RGw5ufZ8OwZgs9+xPz8Ge3mTczJSXyHDlHR3IxQU4P58SO5x4+xPn1CungR5dUrBNFeWSuTQbtzh+zly1S9eVNQRwgGgwHgZyAQiUbHvetqxOPokQgEAvhPnkTcsgVLVTFiMYzXryGTse8dO4a4fTtgf5CMsTFQFPxnzuTHXUvW1rq/ZX8DfxWNQKqhAd/+/ch9fRjxOOq5c1jpNJVdXVTs3Ytv377FaH39Sra7Gz0SwXfwIJWdnRiTk2Q7OjCnp6ns6MAXCpW3BNXv3uWvKxobUYaHATvbcwMDiHV1oChYX75gTk/jP3WKqmh00Wf3bjbcvw/Y23k1ALMYyHJbKaGKmdzXV2jYBPsc0D0NY2qqbIFSzfPuvKbIYrmkApjx+LpAuL/ljqmOpikEg0EJqAZ+YoXCRB4YwO98aFaz3JMnqOFwwXvODvgT+AqkfNgRULHLJZyiwVuaiQCRcPh3YFUIV7ytqcndJm5+LS/NVMAspTjN/8NHotHYSpHwiP/G0twqXpyuUp67vbd8+6MQhEd8jzNLd529AIXL85XMAZOx86TagXjnhfCINzjiKaeprlAxWxWgCES1GwnAO/MUZYiXDFAAYqMDEQPcNU9hJ1fJ4mUBLINQnOZ+/DXs0GfKES8bwAPhJqW7Vd0tppUjDvAPVI4y2afLAX8AAAAASUVORK5CYII=';
let PosFreshBefore = 5000; 	// время в милисекундах, через которое положение считается протухшим
const aisFreshBefore = 600000; 	// время в милисекундах, через которое цели AIS считаются протухшими
const TPVsubscribe = {
	"context": "vessels.self",
	"subscribe": [
		{
			"path": "navigation.position",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.courseOverGroundTrue",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.speedOverGround",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "environment.depth.belowSurface",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "notifications.mob",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		}
	]
};
const AISsubscribe = {
	"context": "vessels.*",
	"subscribe": [
		{
			"path": "",	// name, mmsi, registrations, communication -- это имена свойств, находящихся по пути ""
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "name",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "mmsi",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "registrations.imo",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "communication.callsignVhf",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "communication.netAIS",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "design.aisShipType",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "design.draft",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "design.length",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "design.beam",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.position",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.state",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.courseOverGroundTrue",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.headingTrue",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.speedOverGround",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.destination.commonName",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.destination.eta",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.datetime",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		}
	]
};
