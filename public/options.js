// This file created automatically. Don't edit it!
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
