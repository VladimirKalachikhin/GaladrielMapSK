module.exports = function (app) {
/**/
var plugin = {};

plugin.id = 'galadrielmap_sk';
plugin.name = 'GaladrielMap SignalK edition';
plugin.description = "a server-based chart plotter navigation software for pleasure crafts, motorhomes, and off-road cars. It's can be used on tablets and smartphones without install any app. Only browser need.";

plugin.schema = {
	title: plugin.name,
	description: 'Reload chartplotter after changing all of this.',
	type: 'object',
	properties: {
		options:{
			type: 'object',
			title: 'Options',
			properties: {
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
							default: 'Depth below transducer (DBT)'
						}
					}
				},
				windProp:{
					type: 'boolean',
					title: 'Use true wind instead of apparent',
					description: '',
					default: false
				},
				velocityVectorLengthInMn:{
					type: 'number',
					title: 'Velocity vector length.',
					description: 'Own and AIS targets, minutes of movement.',
					default: 10
				},
				defaultMap:{
					type: 'string',
					title: 'Default map',
					description:'Map to display then no map selected. Signal K Charts plugin identifier, no Signal K Charts plugin Provider Name. Find identifier by http://http://localhost:3000/signalk/v1/api/resources/charts/',
					default: 'world-coastline'
				},
				defaultCenter:{
					type: "object",
					title: 'Default map center',
					description:'map center when no coordinates sets',
					properties: {
						latitude: {
							title: "Latitude",
							type: "number",
							default: 55.754
						},
						longitude: {
							title: "Longitude",
							type: "number",
							default: 37.62
						}
					}
				},
				AISasMOB:{
					type: 'boolean',
					title: 'Display AIS MOB and AIS EPIRB as MOB',
					description: 'Shows AIS  MOB and AIS EPIRB targets as mobs, not as vessels. If there are such targets, the MOB alarm is triggered.',
					default: true
				}
			}
		},
		depthInData:{
			title: 'Display color-coded depth in external data',
			description: 'Color coding of depth along, for example, gpx tracks.',
			type: 'object',
			properties: {
				display:{
					type: 'boolean',
					title: 'Enable',
					description: '',
					default: false
				},
				minvalue:{
					type: 'number',
					title: 'Allowed minimum depth, meters',
					description: 'Depth that encoded in red. The depth less than this is shown in dark red.',
					default: 0
				},
				maxvalue:{
					type: 'number',
					title: 'Allowed maximum depth, meters',
					description: 'Depth that encoded in green. The depth more than this is shown in light blue.',
					default: 10
				}
			}
		},
		directory:{
			type: 'object',
			title: 'Data directories',
			properties: {
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
				}
			}
		},
		timeouts:{
			type: 'object',
			title: 'Data actuality timeouts',
			properties: {
				useSystem:{
					type: 'boolean',
					title: 'Use data actuality timeouts from  SignalK, if available.',
					default: true
				},
				PosFreshBefore:{
					type: 'number',
					title: 'The position is considered correct no longer than this time. If the position older - cursor is grey, seconds.',
					description: `All devices on your network must have the same time (with differents less than 1 sec.) -- check this and you can be sure that you see actual data.`,
					default: 5
				},
				SpeedFreshBefore:{
					type: 'number',
					title: 'The speed is considered correct no longer than this time, seconds.',
					description: `All devices on your network must have the same time (with differents less than 1 sec.) -- check this and you can be sure that you see actual data.`,
					default: 2
				},
				DepthFreshBefore:{
					type: 'number',
					title: 'The depth is considered correct no longer than this time, seconds.',
					description: `All devices on your network must have the same time (with differents less than 1 sec.) -- check this and you can be sure that you see actual data.`,
					default: 2
				},
				WindFreshBefore:{
					type: 'number',
					title: 'The wind is considered correct no longer than this time, seconds.',
					description: `All devices on your network must have the same time (with differents less than 1 sec.) -- check this and you can be sure that you see actual data.`,
					default: 2
				},
				aisFreshBefore:{
					type: 'number',
					title: 'The AIS targets are visible no longer than this time after last update it, seconds.',
					description: ``,
					default: 600
				}
			}
		}
	}
};

plugin.start = function (options, restartPlugin) {
// 
const fs = require("fs");
const path = require('path');
const cp = require('child_process');

app.debug('GaladrielMap started');
//app.debug('options:',options);
let currentTrackName = '';	// имя текущего файла, без пути, но с расширением

if(options.options.speedProp.feature.includes('SOG')) options.options.speedProp.feature = 'navigation.speedOverGround';
else if(options.options.speedProp.feature.includes('STW')) options.options.speedProp.feature = 'navigation.speedThroughWater';
if(options.options.depthProp.feature.includes('DBS')) options.options.depthProp.feature = 'environment.depth.belowSurface';
else if(options.options.depthProp.feature.includes('DBK')) options.options.depthProp.feature = 'environment.depth.belowKeel';
else if(options.options.depthProp.feature.includes('DBT')) options.options.depthProp.feature = 'environment.depth.belowTransducer';
if(options.options.velocityVectorLengthInMn == undefined) options.options.velocityVectorLengthInMn = 10;
if(options.options.defaultMap == undefined) options.options.defaultMap = 'world-coastline';
if(options.options.defaultCenter.latitude == undefined) options.options.defaultCenter.latitude = 55.754;
if(options.options.defaultCenter.longitude == undefined) options.options.defaultCenter.longitude = 37.62;
if(options.depthInData.minvalue == undefined) options.options.depthInData.minvalue = 0;
if(options.depthInData.maxvalue == undefined) options.options.depthInData.maxvalue = 10;

if(!options.directory.routeDir) options.directory.routeDir = 'route';	// Вообще-то, это обстоятельство должно ослеживаться SignalK, но по факту оно этого не делает. Не должно. Я слишком хорошо о них думаю. default в схеме вовсе не означает, что в отсутствии значения будет поставлено это.
if(options.directory.routeDir[0]!='/') options.directory.routeDir = path.resolve(__dirname,'./public',options.directory.routeDir);	// если путь не абсолютный -- сделаем абсолютным
try{
	fs.mkdirSync(options.directory.routeDir,{recursive:true});
}
catch(error){
	switch(error.code){
	case 'EACCES':	// Permission denied
	case 'EPERM':	// Operation not permitted
		app.debug(`False to create ${options.directory.routeDir} by Permission denied`);
		app.setPluginError(`False to create ${options.directory.routeDir} by Permission denied`);
		break;
	case 'ETIMEDOUT':	// Operation timed out
		app.debug(`False to create ${options.directory.routeDir} by Operation timed out`);
		app.setPluginError(`False to create ${options.directory.routeDir} by Operation timed out`);
		break;
	}
}

if(!options.directory.trackDir) options.directory.trackDir = 'track';	// Вообще-то, это обстоятельство должно ослеживаться SignalK, но по факту оно этого не делает
if(options.directory.trackDir[0]!='/') options.directory.trackDir = path.resolve(__dirname,'./public',options.directory.trackDir);	// если путь не абсолютный -- сделаем абсолютным
try{
	fs.mkdirSync(options.directory.trackDir,{recursive:true});
}
catch(error){
	switch(error.code){
	case 'EACCES':	// Permission denied
	case 'EPERM':	// Operation not permitted
		app.debug(`False to create ${options.directory.trackDir} by Permission denied`);
		app.setPluginError(`False to create ${options.directory.trackDir} by Permission denied`);
		break;
	case 'ETIMEDOUT':	// Operation timed out
		app.debug(`False to create ${options.directory.trackDir} by Operation timed out`);
		app.setPluginError(`False to create ${options.directory.trackDir} by Operation timed out`);
		break;
	};
};

if(options.timeouts.PosFreshBefore == undefined) options.timeouts.PosFreshBefore = 5;
if(options.timeouts.SpeedFreshBefore == undefined) options.timeouts.SpeedFreshBefore = 2;
if(options.timeouts.DepthFreshBefore == undefined) options.timeouts.DepthFreshBefore = 2;
if(options.timeouts.WindFreshBefore == undefined) options.timeouts.WindFreshBefore = 2;
if(options.timeouts.aisFreshBefore == undefined) options.timeouts.aisFreshBefore = 600;

let trackDir = options.directory.trackDir;

function fileListHelper(request,response,fileDir,fileTypes,chkCurrent=false){
// chkCurrent -- do check is gpx file the current writed gpx 
try {
	currentTrackName = '';
	let filesList = fs.readdirSync(fileDir);	// readdirSync действительно не понимает относительные пути, или это я дурак? А, у него относительный путь относительно node, а не относительно скрипта. Афигеть.
	filesList = filesList.filter(item => {	// менее череззадого способа удалить имена скрытых и служебных файлов не нашлось. Верните меня в PHP!!!
		const exstension = path.extname(item).toLowerCase();
		if((!(item.startsWith('.') || item.endsWith('~'))) || (fileTypes.includes(exstension))){
			//app.debug('fileListHelper','filename=',item,'exstension=',exstension,'chkCurrent=',chkCurrent);
			if((exstension == '.gpx') && chkCurrent){	// проверять завершённость файлов gpx на предмет обнаружения текущего трека
				if(app.getSelfPath('navigation.trip.track')){	// если есть текущий трек в SignalK
					if(fileDir+'/'+item == app.getSelfPath('navigation.trip.track')){
						currentTrackName = item;
						chkCurrent = false;
					}
				}
				else {	// будем искать текущий как незавершённый файл gpx в нашем каталоге
					let buf = tailCustom(fileDir+'/'+item,5);	// сколько-то последних строк файла. Лучше много, ибо в конце могут быть пустые строки
					//app.debug('fileListHelper buf:',buf);
					if(buf != false) {
						if(!buf.trim().endsWith('</gpx>')){	// незавершённый файл gpx
							currentTrackName = item;
							if(options.directory.currTrackFirst) chkCurrent = false;	// текущий трек -- первый из незавершённых, иначе -- последний.
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
	app.setPluginError('Failed to get file list from '+options.directory.routeDir,error.message);
	response.end();	// просто завершим запрос, без ответа
}
} // end function fileListHelper

// ответчик со списком файлов route
app.get(`/${plugin.id}/route`, function(request, response){fileListHelper(request, response,options.directory.routeDir,['gpx','kml','csv']);});	// ['gpx','kml','csv','wkt','json']
// ответчик, отдающий файл из route
app.get(`/${plugin.id}/route/*`, function(request, response) {	
	//app.debug(options.directory.routeDir+'/'+path.basename(request.url));
	response.sendFile(options.directory.routeDir+'/'+path.basename(decodeURI(request.url)));
});

// ответчик со списком файлов track
app.get(`/${plugin.id}/track`, function(request, response){fileListHelper(request, response,trackDir,['gpx'],true);});
// ответчик, отдающий файл из track
app.get(`/${plugin.id}/track/*`, function(request, response) {	
	//app.debug(trackDir+'/'+path.basename(request.url));
	response.sendFile(trackDir+'/'+path.basename(decodeURI(request.url)));
});

// ответчик, возвращающий линию из последних точек пишущегося сейчас пути в GeoJSON
var SESSION_lastTrkPt='';	// строка формата TRPT, последняя отданная
var SESSION_shangedRoutes = {};	// список имён изменившихся за недавно маршрутов, для динамического обновления
var SESSION_currTrackFileName = '';	// текущее имя текущего файла, для отличия от переданного имени текущего файла
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
	if(!request.params.currTrackFileName.endsWith('.gpx')) request.params.currTrackFileName += '.gpx';
	request.params.currTrackFileName = trackDir+'/'+request.params.currTrackFileName;
	if(request.params.currTrackFileName != SESSION_currTrackFileName){	// новый трек
		SESSION_currTrackFileName = request.params.currTrackFileName;
		SESSION_lastTrkPt = '';
	}

	// определим, записывается ли трек
	// трек _может_ записываться, если он не завершён
	// записывается ли он на самом деле, нам неизвестно и здесь не интересно
	let trackLogging = false;
	// сколько строк включает последние с момента передачи trkpt. Спецификация говорит, что trkpt может иметь 20 строк
	// если это независимо вызывается раз в 2 секунды, а приёмник ГПС отдаёт координаты 10 раз в секунду, и все они пишутся...
	const tailStrings = 2 * 10 * 20;	// это примерно 10КБ. Норм?
	let lastTrkPts = tailCustom(request.params.currTrackFileName,tailStrings);
	if(!lastTrkPts){	// файл, например, грохнули, но клиент-то об этом не знает...	
		response.json({'logging': false,'pt': []});
		return;
	}
	lastTrkPts = lastTrkPts.split("\n").filter(str => str.trim().length);
	//app.debug('lastTrkPts:',lastTrkPts);
	if(lastTrkPts[lastTrkPts.length-1].trim() != '</gpx>') trackLogging = true; 	// если это завершённый GPX -- укажем, что трек не пишется
	//app.debug("trackLogging",trackLogging);
	
	let lastTrkPtGPX = [];
	if(trackLogging) { 	// трек пишется - просмотрим трек
		// Для определения, какая последняя точка была отдана, найдём в ней строку с временем.
		let sendedTRPTtimeStr = '';
		//app.debug('SESSION_lastTrkPt:',`|${SESSION_lastTrkPt}|`);
		for(let str of SESSION_lastTrkPt.split("\n")){
			str = str.trim();
			if(str.startsWith('<time>')){
				sendedTRPTtimeStr = str;
				break;
			}
		}
		//app.debug('sendedTRPTtimeStr:',sendedTRPTtimeStr);
		
		let TRPTstart = lastTrkPts.length;
		//app.debug('TRPTstart:',TRPTstart);
		for(let n = 0; n < lastTrkPts.length; n++){	// 
			let str = lastTrkPts[n].trim();
			//app.debug('str=',str);
			if(str.startsWith('<trkpt')) TRPTstart = n; 	// номер строки начала точки
			else if(str == sendedTRPTtimeStr) break;	// Строка time последней отданной точки
		}
		//app.debug('TRPTstart:',TRPTstart);
		// в считанном хвосте файла обнаружена последняя отправленная, или просто последняя точка, или ничего, есди точек в файле нет
		lastTrkPts = lastTrkPts.slice(TRPTstart);	// теперь массив начинается с первой строки последней отправленной точки или первой строки последней точки или пустой.
		//app.debug('lastTrkPts:',lastTrkPts);
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
		//app.debug('2 lastTrkPtGPX:',lastTrkPtGPX,lastTrkPtGPX.length);

		// Теперь в массиве lastTrkPtGPX одна строка с последней ранее переданной точкой, или одна строка с 
		// последней точкой в файле, или более строк, или пусто
		if(lastTrkPtGPX.length==1){
			//app.debug('Compare last & session:',lastTrkPtGPX[0]==SESSION_lastTrkPt);
			if(lastTrkPtGPX[0]==SESSION_lastTrkPt) lastTrkPtGPX = [];	// не было новых точек
			else if(SESSION_lastTrkPt) lastTrkPtGPX = [SESSION_lastTrkPt,lastTrkPtGPX[0]];	// от последней сохранённой к последней в файле
			else {
				//app.debug('new SESSION_lastTrkPt if last point');
				SESSION_lastTrkPt = lastTrkPtGPX[0];
				lastTrkPtGPX = [];
			}
		}
		//app.debug('SESSION_lastTrkPt:',SESSION_lastTrkPt);

		if(lastTrkPtGPX.length>1){
			//app.debug('new SESSION_lastTrkPt');
			SESSION_lastTrkPt = lastTrkPtGPX[lastTrkPtGPX.length-1];
			lastTrkPtGPX = gpx2geoJSONpoint(lastTrkPtGPX); 	// сделаем GeoJSON LineString
		}
	}
	//app.debug('1 lastTrkPtGPX:',lastTrkPtGPX);
	
	response.json({'logging' : trackLogging,'pt' : lastTrkPtGPX});
});

// Ответчик, включающий и выключающий запись трека средствами SignalK
// и возвращающий состояние записи и имя файла записываемого трека.
// Теоретически, то же самое можно сделать командой PUT с клиента через уже имеющийся вебсокет.
// но чёта с notifications.mob это не прокатило....
// ... в общем, я ниасилил как изменять значения с клиента. PUT в смысле http оно не понимает также как GET
// хех, оказывается, надо послать delta в вебсокет для потоков 
// Хотя request.params выглядит странно по сравнению с request.query,
// с помощью request.params удастся передать только одну команду, когда как в строке request.query
// -- сколько хочешь. Т.е., если request.params -- не нужно разбираться с косячным запросом
app.get(`/${plugin.id}/logging/:command`, function(request, response) {	
//app.get(`/${plugin.id}/logging`, function(request, response) {	
	// Возвращает текущий статус записи трека, а потом посылает в SignalK команду путём изменения
	// пути navigation.trip.logging
	//app.debug('logging check command:',request.params.command);
	//app.debug('logging request',request.query);
	let status = false;
	if(app.getSelfPath('navigation.trip.logging')) {	// В SignalK есть что-то, что пишет трек и управляется
		let logFile;
		({status, logFile} = app.getSelfPath('navigation.trip.logging.value'));
		//app.debug('logging check if navigation.trip.logging: status=',status,'logFile=',logFile);
		if(logFile) {
			currentTrackName = path.basename(logFile);
			trackDir = path.dirname(logFile);
			// Сменим каталог для треков на каталог, куда на самом деле пишется трек. А оно надо?
			// К тому же -- нельзя сохранять options, потому что мы поменяли 
			// speedProp и depthProp на те, которых нет в списке, и после сохранения
			// SignalK не даст их изменить с сообщением "should be equal to one of the allowed values", 
			// что шиза -- я же меняю с неправильного значения на правильное!
			// в общем, менять options нельзя, если хочется сохранять.
			//app.savePluginOptions(options, () => {app.debug('New trackDir setted:',trackDir)});
		}
		else {
			status = false;	// костыль на предмет глюка, когда navigation.trip.logging остаётся true, если включить запись трека отсюда, а выключить -- из логгера.
			currentTrackName = '';
		}
		//app.debug('logging check if navigation.trip.logging, status=',status,'currentTrackName=',currentTrackName,'trackDir',trackDir);
		switch(request.params.command){
		case 'startLogging':
			if(status) break;	// уже включено
			//app.debug('Значение navigation.trip.logging изменено на {status: true, logFile:',trackDir+'/','}');
			app.handleMessage(plugin.id, {
				context: 'vessels.self',
				updates: [
					{
						values: [
							{
								path: 'navigation.trip.logging',
								value: {
									status: true,
									logFile: options.directory.trackDir+'/'	// потребуем писать в свой каталог, options.directory.trackDir -- уже полный путь
								}
							}
						],
						source: { label: plugin.id },
						timestamp: new Date().toISOString(),
					}
				]
			});
			break;
		case 'stopLogging':
			if(!status) break;	// уже выключено
			//app.debug('Значение navigation.trip.logging изменено на false');
			app.handleMessage(plugin.id, {
				context: 'vessels.self',
				updates: [
					{
						values: [
							{
								path : 'navigation.trip.logging',
								value: {
									status: false,
								}
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
	}
	else {	// В SignalK нет информации о записи трека
		status = null;
		// Попробуем найти текущий записываемый трек как первый (или последний) незавершённый
		let outpuFileName;
		for(let item of fs.readdirSync(trackDir)) {	
			if(path.extname(item).toLowerCase() != '.gpx') continue;
			let buf = tailCustom(trackDir+'/'+item,5);	// сколько-то последних строк файла. Лучше много, ибо в конце могут быть пустые строки
			if(buf != false) {
				if(!buf.trim().endsWith('</gpx>')){	// незавершённый файл gpx
					outpuFileName = item;
					if(options.directory.currTrackFirst) break;	// текущий трек -- первый из незавершённых, иначе -- последний.
				}
			}
		}
		if(outpuFileName) currentTrackName = outpuFileName;
	}

	//app.debug('logging Sending',status,currentTrackName);
	response.json([status,currentTrackName,trackDir]);
});

// Ответчик, сохраняющий файл gpx
/*
app.post(`/${plugin.id}/saveGPX`, function(request, response) {	
	// А как сделать декодирование request.body? express и/или body-parser недоступны...
	app.debug('[Ответчик, сохраняющий файл gpx]',request.body);
});
*/
/**
Эти казлы так и ниасилили юникод в JavaScript. Багу более 15 лет.
 * ASCII to Unicode (decode Base64 to original data)
 * @param {string} b64
 * @return {string}
function atou(b64) {
  return decodeURIComponent(escape(atob(b64)));
}
 */

app.get(`/${plugin.id}/saveGPX/:name/:gpx`, function(request, response) {	
	//app.debug(decodeURIComponent(request.params.name));
	//app.debug('[Ответчик, сохраняющий файл gpx]',request.params);
	// request _должен быть_ encodeURIComponent, на закодированное другим способом Express отвечает 404. Козлы.
	let name = decodeURIComponent(request.params.name);
	if(!name) name = Date().toISOString()+'.gpx';
	if(!name.endsWith('.gpx')) name += '.gpx';
	let res;
	//app.debug(options.directory.routeDir+'/'+name);
	try {
		fs.writeFileSync(options.directory.routeDir+'/'+name, decodeURIComponent(request.params.gpx));
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
	let filesList = fs.readdirSync(options.directory.routeDir);	// 
	filesList = filesList.filter(item => item.endsWith('.gpx'));
	//app.debug(filesList);
	for(const fileName of filesList){
		const mTime = fs.statSync(options.directory.routeDir+'/'+fileName).mtimeMs;
		//app.debug(fileName,fs.statSync(options.directory.routeDir+'/'+fileName).mtime);
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

// Подготовим картинку для передачи её клиенту, чтобы тот мог видеть её и при потере связи с сервером
const mob_markerImg = "data:image/png;base64,"+fs.readFileSync(path.resolve(__dirname,'./public','img/mob_marker.png'), 'base64');

//app.debug(options);
// Запишем файл для передачи клиенту
let windDirection, windSpeed;
if(options.options.windProp){
	//windDirection = "environment.wind.directionTrue";
	windDirection = "environment.wind.angleTrueWater";
	windSpeed = "environment.wind.speedTrue";
}
else {
	windDirection = "environment.wind.angleApparent";
	windSpeed = "environment.wind.speedApparent";
}
const optionsjs = `// This file created automatically. Don't edit it!
const defaultCenter = [${options.options.defaultCenter.latitude},${options.options.defaultCenter.longitude}];
const defaultMap = '${options.options.defaultMap}'; 	// chart-plugin identifier Карта, которая показывается, если нечего показывать. Народ интеллектуальный ценз ниасилил.
const velocityVectorLengthInMn = ${options.options.velocityVectorLengthInMn};
const mob_markerImg = '${mob_markerImg}';
let PosFreshBefore = ${options.timeouts.PosFreshBefore * 1000}; 	// время в милисекундах, через которое положение считается протухшим
let SpeedFreshBefore = ${options.timeouts.SpeedFreshBefore * 1000}; 	// время в милисекундах, через которое скорость считается протухшей
let DepthFreshBefore = ${options.timeouts.DepthFreshBefore * 1000}; 	// время в милисекундах, через которое глубина считается протухшей
let WindFreshBefore = ${options.timeouts.WindFreshBefore * 1000}; 	// время в милисекундах, через которое весь ветер считается протухшим
let aisFreshBefore = ${options.timeouts.aisFreshBefore * 1000}; 	// время в милисекундах, через которое цели AIS считаются протухшими
const ConfigSpeedProp = '${options.options.speedProp.feature}';	// что именно используется как скорость
const ConfigDepthProp = '${options.options.depthProp.feature}';	// что именно используется как глубина
const useSystemTimeouts = ${options.timeouts.useSystem};	// пытаться использовать время жизни от SignalK
const depthInData = ${JSON.stringify(options.depthInData)};	// параметры того, как показывать глубину в gpx
const useTrueWind = ${options.options.windProp};	// используется ли истинный или вымпельный ветер
const AISasMOB = ${options.options.AISasMOB};	// показывать AIS MOB и AIS EPIRB как MOB
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
			"path": "navigation.headingTrue",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.headingMagnetic",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.headingCompass",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.magneticVariation",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.magneticDeviation",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "${options.options.speedProp.feature}",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "${options.options.depthProp.feature}",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "${windDirection}",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "${windSpeed}",
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
			"path": "navigation.state_text",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "navigation.safety_related_text",
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
const notificationaSubscribe = {
	"context": "vessels.*",
	"subscribe": [
		{
			"path": "notifications.mob",
			"format": "delta",
			"policy": "instant",
			"minPeriod": 0
		},
		{
			"path": "notifications.danger.collision",
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
	//app.debug('[tailCustom] filepath=',filepath);
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
app.debug('Plugin stopped');
}; // end plugin.stop

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
		//app.debug('[gpx2geoJSONpoint]','coord',coord,'strlen',strlen,str);
		if(coord !== -1) lat = str.substr(coord+5,str.indexOf('"',coord+6)-coord-5);
		coord = str.lastIndexOf('lon="');
		if(coord !== -1) lon = str.substr(coord+5,str.indexOf('"',coord+6)-coord-5);
		if(lat && lon) break;
	}
	//app.debug('[gpx2geoJSONpoint]','lat',lat,'lon',lon);
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
