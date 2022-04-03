module.exports = function (app) {
/**/
var plugin = {};

plugin.id = 'galadrielmap_sk';
plugin.name = 'GaladrielMap SignalK edition';
plugin.description = "a server-based chart plotter navigation software for pleasure crafts, motorhomes, and off-road cars. It's can be used on tablets and smartphones without install any app. Only browser need.";

plugin.schema = {
	title: plugin.name,
	type: 'object',
	required: ['PosFreshBefore,routeDir'],
	properties: {
		trackProp:{
			title: '',
			description: 'Reload chartplotter after changing all of this.',
			type: 'object',
			properties: {
				feature:{
					type: 'string',
					title: 'Will be displayed as Course:',
					enum: [
						'Course over ground (COG)',
						'Heading true (HT)',
						'Heading magnetic (HM)',
						'Heading compass (HC)',
					],
					default: 'Course over ground (COG)'
				},
			},
		},
		speedProp:{
			title: '',
			type: 'object',
			properties: {
				feature:{
					type: 'string',
					title: 'Will be displayed as Speed:',
					enum: [
						'Speed ower ground (SOG)',
						'Speed through water (STW)',
					],
					default: 'Speed ower ground (SOG)'
				},
			},
		},
		depthProp:{
			title: '',
			type: 'object',
			properties: {
				feature:{
					type: 'string',
					title: 'Will be displayed as Depth:',
					enum: [
						'Depth below surface (DBS)',
						'Depth below keel (DBK)',
						'Depth below transducer (DBT)',
					],
					default: 'Depth below surface (DBS)'
				}
			}
		},
		routeDir:{
			type: 'string',
			title: 'Directory with POI and routes',
			description:'Path in server filesystem, absolute or from plugin public directory',
			default: 'route'
		},
		trackDir:{
			type: 'string',
			title: 'Directory with tracks',
			description:'Path in server filesystem, absolute or from plugin public directory',
			default: 'track'
		},
		currTrackFirst:{
			type: 'boolean',
			title: 'Is the current (being recorded now) track first in track list, or last',
			description:'It depends of format of track file name, how it is created by tracking app.',
			default: false
		},
		PosFreshBefore:{
			type: 'number',
			title: 'The position is considered correct no longer than this time. If the position older - cursor is grey, seconds.',
			description: `All devices on your network must have the same time (with differents less than 1 sec.) -- check this and you can be sure that you see actual data.`,
			default: 5
		},
		aisFreshBefore:{
			type: 'number',
			title: 'The AIS targets are visible no longer than this time after last update it, seconds.',
			description: ``,
			default: 600
		}
	}
};

plugin.start = function (options, restartPlugin) {
// 
const fs = require("fs");
const path = require('path');
const cp = require('child_process');

let currentTrackName = '';

//app.debug('options:',options);
if(!options.routeDir) options.routeDir = 'route';	// Вообще-то, это обстоятельство должно ослеживаться SignalK, но по факту оно этого не делает
if(options.trackProp.feature.includes('COG')) options.trackProp.feature = 'navigation.courseOverGroundTrue';
else if(options.trackProp.feature.includes('HT')) options.trackProp.feature = 'navigation.headingTrue';
else if(options.trackProp.feature.includes('HM')) options.trackProp.feature = 'navigation.headingMagnetic';
else if(options.trackProp.feature.includes('HC')) options.trackProp.feature = 'navigation.headingCompass';

if(options.speedProp.feature.includes('SOG')) options.speedProp.feature = 'navigation.speedOverGround';
else if(options.speedProp.feature.includes('STW')) options.speedProp.feature = 'navigation.speedThroughWater';

if(options.depthProp.feature.includes('DBS')) options.depthProp.feature = 'environment.depth.belowSurface';
else if(options.depthProp.feature.includes('DBK')) options.depthProp.feature = 'environment.depth.belowKeel';
else if(options.depthProp.feature.includes('DBT')) options.depthProp.feature = 'environment.depth.belowTransducer';

function fileListHelper(request,response,fileDir,fileTypes,chkCurrent=false){
// chkCurrent -- do check is gpx file the current writed gpx 
try {
	currentTrackName = '';
	let filesList = fs.readdirSync(fileDir);	// readdirSync действительно не понимает относительные пути, или это я дурак? А, у него относительный путь относительно node, а не относительно скрипта. Афигеть.
	filesList = filesList.filter(item => {	// менее череззадого способа удалить имена скрытых и служебных файлов не нашлось. Верните меня в PHP!!!
		const exstension = path.extname(item).toLowerCase();
		if((!(item.startsWith('.') || item.endsWith('~'))) || (fileTypes.includes(exstension))){
			//app.debug('exstension=',exstension,'chkCurrent=',chkCurrent);
			if((exstension == '.gpx') && chkCurrent){	// проверять завершённость файлов gpx на предмет обнаружения текущего трека
				if(app.getSelfPath('navigation.trip.track')){	// если есть текущий трек в SignalK
					if(fileDir+'/'+item == app.getSelfPath('navigation.trip.track')){
						currentTrackName = item;
						chkCurrent = false;
					}
				}
				else {	// будем искать текущий как незавершённый файл gpx в нашем каталоге
					let buf = tailCustom(fileDir+'/'+item,5);	// сколько-то последних строк файла. Лучше много, ибо в конце могут быть пустые строки
					//app.debug(buf);
					if(buf != false) {
						if(!buf.trim().endsWith('</gpx>')){	// незавершённый файл gpx
							currentTrackName = item;
							if(options.currTrackFirst) chkCurrent = false;	// текущий трек -- первый из незавершённых, иначе -- последний.
						}
					}
				}
			}
			return true;
		}
		else return false;
	});
	//app.debug('filesList:',filesList);
	response.json({filelist:filesList,currentTrackName:currentTrackName});
}
catch(error){
	app.setPluginError('Failed to get file list from '+options.routeDir,error.message);
	response.end();	// просто завершим запрос, без ответа
}
} // end function fileListHelper

if(options.routeDir[0]!='/') options.routeDir = path.resolve(__dirname,'./public',options.routeDir);	// если путь не абсолютный -- сделаем абсолютным
if(options.trackDir[0]!='/') options.trackDir = path.resolve(__dirname,'./public',options.trackDir);	// если путь не абсолютный -- сделаем абсолютным
// ответчик со списком файлов route
app.get(`/${plugin.id}/route`, function(request, response){fileListHelper(request, response,options.routeDir,['gpx','kml','csv']);});	// ['gpx','kml','csv','wkt','json']
// ответчик, отдающий файл из route
app.get(`/${plugin.id}/route/*`, function(request, response) {	
	//app.debug(options.routeDir+'/'+path.basename(request.url));
	response.sendFile(options.routeDir+'/'+path.basename(decodeURI(request.url)));
});

// ответчик со списком файлов track
app.get(`/${plugin.id}/track`, function(request, response){fileListHelper(request, response,options.trackDir,['gpx'],true);});
// ответчик, отдающий файл из route
app.get(`/${plugin.id}/track/*`, function(request, response) {	
	//app.debug(options.trackDir+'/'+path.basename(request.url));
	response.sendFile(options.trackDir+'/'+path.basename(decodeURI(request.url)));
});

// ответчик, возвращающий линию из последних точек пишущегося сейчас пути в GeoJSON
var SESSION_lastTrkPt='';	// строка формата TRPT, последняя отданная
var SESSION_shangedRoutes = {};	// список имён изменившихся за недавно маршрутов, для динамического обновления
/*
SESSION_lastTrkPt = `   <trkpt lat="61.050616667" lon="28.195350000">
    <ele>67.7900</ele>
    <time>2022-03-13T11:45:28.410Z</time>
    <fix>3d</fix>
    <hdop>0.0</hdop>
    <vdop>0.0</vdop>
    <pdop>0.0</pdop>
   </trkpt>
`;
*/
app.get(`/${plugin.id}/getlasttrkpt/:currTrackFileName`, function(request, response) {	
	// :currTrackFileName -- имя файла gpx, без пути и можно без расширения
	//response.send(request.params);
	if(!request.params.currTrackFileName.endsWith('.gpx')) request.params.currTrackFileName += '.gpx';
	request.params.currTrackFileName = options.trackDir+'/'+request.params.currTrackFileName;

	// определим, записывается ли трек
	// трек _может_ записываться, если он не завершён
	// записывается ли он на самом деле, нам неизвестно и здесь не интересно
	let trackLogging = false;
	// сколько строк включает последние с момента передачи trkpt. Спецификация говорит, что trkpt может иметь 20 строк
	// если это независимо вызывается раз в 2 секунды, а приёмник ГПС отдаёт координаты 10 раз в секунду, и все они пишутся...
	const tailStrings = 2 * 10 * 20;	// это примерно 10КБ. Норм?
	let lastTrkPts = tailCustom(request.params.currTrackFileName,tailStrings).split("\n").filter(str => str.trim().length);
	//app.debug(lastTrkPts);
	if( lastTrkPts[lastTrkPts.length-1].trim() != '</gpx>') trackLogging = true; 	// если это завершённый GPX -- укажем, что трек не пишется
	//app.debug("trackLogging",trackLogging);
	
	let lastTrkPtGPX = [];
	if(trackLogging) { 	// трек пишется - просмотрим трек
		// Для определения, какая последняя точка была отдана, найдём в ней строку с временем.
		let sendedTRPTtimeStr = '';
		//app.debug('SESSION_lastTrkPt',`|${SESSION_lastTrkPt}|`);
		for(let str of SESSION_lastTrkPt.split("\n")){
			str = str.trim();
			if(str.startsWith('<time>')){
				sendedTRPTtimeStr = str;
				break;
			}
		}
		//app.debug('sendedTRPTtimeStr',sendedTRPTtimeStr);
		
		let TRPTstart = lastTrkPts.length;
		for(let n = 0; n < lastTrkPts.length; n++){	// 
			let str = lastTrkPts[n].trim();
			if(str.startsWith('<trkpt')) TRPTstart = n; 	// номер строки начала точки
			else if(str == sendedTRPTtimeStr) break;	// Строка time последней отданной точки
		}
		// в считанном хвосте файла обнаружена последняя отправленная, или просто последняя точка, или ничего
		lastTrkPts = lastTrkPts.slice(TRPTstart);	// теперь массив начинается с первой строки последней отправленной точки или первой строки последней точки или пустой.
		//app.debug(lastTrkPts);
		let TRPTend = -1;
		for(let n = 0; n < lastTrkPts.length; n++){
			let str = lastTrkPts[n];
			if(str.trim().startsWith('</trkpt>')) TRPTend = n;	// последняя строка последней полной точки
		}
		lastTrkPts = lastTrkPts.slice(0,TRPTend+1);	// теперь массив заканчивается последней строкой какой-то точки
		//app.debug(lastTrkPts);

		// Собираем точки в строку, а строки -- в массив.
		let TRPTfind = false, TRPTstr = '';
		for(let str of lastTrkPts){
			if(str.trim().startsWith('<trkpt')){
				TRPTstr = str+"\n";
				TRPTfind = true;
			}
			else if(str.trim().startsWith('</trkpt>')){
				TRPTstr += str+"\n";
				lastTrkPtGPX.push(TRPTstr);
				TRPTfind = false;
			}
			else if(TRPTfind) TRPTstr += str+"\n";
		}
		delete lastTrkPts;
		//app.debug(lastTrkPtGPX);

		// Теперь в $lastTrkPtGPX одна строка с последней ранее переданной точкой, или одна строка с 
		// последней точкой в файле, или более строк, или пусто
		if(lastTrkPtGPX.length==1){
			if(lastTrkPtGPX[0]==SESSION_lastTrkPt) lastTrkPtGPX = [];	// не было новых точек
			else if(SESSION_lastTrkPt) lastTrkPtGPX = [SESSION_lastTrkPt,lastTrkPtGPX[0]];	// от последней сохранённой к последней в файле
			else lastTrkPtGPX = [];
		}

		if(lastTrkPtGPX.length>1){
			SESSION_lastTrkPt = lastTrkPtGPX[lastTrkPtGPX.length-1];
			lastTrkPtGPX = gpx2geoJSONpoint(lastTrkPtGPX); 	// сделаем GeoJSON LineString
		}
	}
	//app.debug(lastTrkPtGPX);
	
	response.json({'logging' : trackLogging,'pt' : lastTrkPtGPX});
});

// Ответчик, включающий и выключающий запись трека средствами SignalK
// и возвращающий состояние записи и имя файла записываемого трека.
// Теоретически, то же самое можно сделать командой PUT с колиента через уже имеющийся вебсокет.
// но чёта с notifications.mob это не прокатило....
// ... в общем, я ниасилил как изменять значения с клиента. PUT в смысле http оно не понимает также как GET
// хех, оказывается, надо послать delta в вебсокет для потоков 
app.get(`/${plugin.id}/logging/:command`, function(request, response) {	
	//app.debug(request.params.command);
	let status = false;
	let outpuFileName = '';
	if(app.getSelfPath('navigation.trip.logging')) {
		status = app.getSelfPath('navigation.trip.logging.value');
		if(app.getSelfPath('navigation.trip.track')) outpuFileName = path.basename(app.getSelfPath('navigation.trip.track'));
	}
	else status = null;
	switch(request.params.command){
	case 'startLogging':
		app.handleMessage(plugin.id, {
			context: 'vessels.self',
			updates: [
				{
					values: [
						{
							path : 'navigation.trip.logging',
							value : true
						}
					],
					source: { label: plugin.id },
					timestamp: new Date().toISOString(),
				}
			]
		});
		break;
	case 'stopLogging':
		app.handleMessage(plugin.id, {
			context: 'vessels.self',
			updates: [
				{
					values: [
						{
							path : 'navigation.trip.logging',
							value : false
						}
					],
					source: { label: plugin.id },
					timestamp: new Date().toISOString(),
				}
			]
		});
		break;
	default:
	}
	response.json([status,outpuFileName]);
});

// Ответчик, сохраняющий файл gpx
app.get(`/${plugin.id}/saveGPX/:name/:gpx`, function(request, response) {	
	//app.debug(decodeURIComponent(request.params.name));
	//app.debug(decodeURIComponent(request.params.gpx));
	let name = decodeURIComponent(request.params.name);
	if(!name) name = Date().toISOString()+'.gpx';
	if(!name.endsWith('.gpx')) name += '.gpx';
	let res;
	app.debug(options.routeDir+'/'+name);
	try {
		fs.writeFileSync(options.routeDir+'/'+name, decodeURIComponent(request.params.gpx));
		res = [0,request.params.name+' saved'];
	} catch (err) {
		res = [1,'Error save '+request.params.name+': '+err.message];
	}
	response.json(res);
});

// Ответчик, возвращающий имена недавно изменившихся файлов
// предполагается, что маршрутов с целью динамического обновления
app.get(`/${plugin.id}/checkRoutes`, function(request, response) {	
	const fresh = 60*60*24*1000; 	//msec. The file was modified not later than this ago
	let shanged = [];
	let filesList = fs.readdirSync(options.routeDir);	// 
	filesList = filesList.filter(item => item.endsWith('.gpx'));
	//app.debug(filesList);
	for(const fileName of filesList){
		const mTime = fs.statSync(options.routeDir+'/'+fileName).mtimeMs;
		//app.debug(fileName,fs.statSync(options.routeDir+'/'+fileName).mtime);
		if(Date.now()-mTime > fresh) continue; 	// изменён давно
		if(!SESSION_shangedRoutes[fileName]) {
			SESSION_shangedRoutes[fileName] = {};
			SESSION_shangedRoutes[fileName]['sended'] = 0
		}
		if(SESSION_shangedRoutes[fileName]['sended'] == mTime) continue; 	// это время изменения уже было сообщено
		SESSION_shangedRoutes[fileName]['sended'] = mTime;
		shanged.push(fileName);
	}
	response.json(shanged);
});

const optionsjs = `// This file created automatically. Don't edit it!
let PosFreshBefore = ${options.PosFreshBefore * 1000}; 	// время в милисекундах, через которое положение считается протухшим
const aisFreshBefore = ${options.aisFreshBefore * 1000}; 	// время в милисекундах, через которое цели AIS считаются протухшими
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
			"path": "${options.trackProp.feature}",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "${options.speedProp.feature}",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "${options.depthProp.feature}",
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
`;
fs.writeFileSync(__dirname+'/public/options.js',optionsjs);





function tailCustom(filepath,lines) {
//
	let data = false;
	try{
		//app.debug('tail -n '+lines+' "'+filepath+'"');
		data = cp.execSync('tail -n '+lines+' "'+filepath+'"',{encoding:'utf8'});
	}
	catch(err){
		app.debug('[tailCustom] False of read '+filepath,err.message);
	}
	return data;
} // end function tailCustom

}; // end plugin.start

plugin.stop = function () {
// Here we put logic we need when the plugin stops
//app.debug('Plugin stopped');
};

function gpx2geoJSONpoint(gpxPts) {
/* Получает массив строк trkpt, rtept или wpt, разделённую \n , вовращает GeoJSON LineString */
let geoJSON = {
'type' : 'FeatureCollection',
'features' : [
	{
		'type' : 'Feature',
		'geometry' : {
			'type' : 'LineString',
			'coordinates' : []
		},
		'id' : 'gps',
		'properties' : null
	}
]
};
for(let gpxPt of gpxPts) {
	gpxPt = gpxPt.split("\n");
	if(!gpxPt) continue;
	let type = gpxPt[0].trim().substr(1,3).toLowerCase();
	if((type!='trk') && (type!='wpt') && (type!='rte')) continue; 	// это не точка
	let lat = null;
	let lon = null;
	for(let str of gpxPt) {
		let coord = str.lastIndexOf('lat="'); 
		let strlen = str.length;
		//app.debug('coord',coord,'strlen',strlen,str);
		if(coord !== -1) lat = str.substr(coord+5,str.indexOf('"',coord+6)-coord-5);
		coord = str.lastIndexOf('lon="');
		if(coord !== -1) lon = str.substr(coord+5,str.indexOf('"',coord+6)-coord-5);
		if(lat && lon) break;
	}
	//app.debug('lat',lat,'lon',lon);
	if(lat && lon) {
		geoJSON['features'][0]['geometry']['coordinates'].push([lon,lat]);
	}
	else continue;
}

//app.debug(geoJSON['features'][0]['geometry']);
return geoJSON;
} // end function gpx2geoJSONpoint


return plugin;
};
