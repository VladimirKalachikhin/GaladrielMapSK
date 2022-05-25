"use strict"
/* Функции
onBodyLoad()
mapListPopulate()

listPopulate()

getCookie(name)
doSavePosition() 	Сохранение положения

selectMap(node) 	Выбор карты из списка имеющихся
deSelectMap(node) 	Прекращение показа карты, и возврат её в список имеющихся.
displayMap(mapname) Создаёт leaflet lauer с именем, содержащемся в mapname, и заносит его на карту
removeMap(mapname)

selectTrack()
deSelectTrack()
displayTrack()
displayRoute(routeNameNode)
updateCurrTrack()

routeControlsDeSelect()
delShapes(realy)
tooggleEditRoute(e)
doSaveMeasuredPaths()
doRestoreMeasuredPaths()

saveGPX() 			Сохраняет на сервере маршрут из объекта currentRoute
toGPX(geoJSON,createTrk) Create gpx route or track (createTrk==true) from geoJSON object

String.prototype.encodeHTML = function ()

updateClasters()
updClaster(e)
realUpdClaster(layer)

nextColor(color,step)

centerMarkPosition() // Показ координат центра и переход по введённым
centerMarkOn
centerMarkOff

flyByString(stringPos) Получает строку предположительно с координатами, и перемещает туда центр карты
updGeocodeList(nominatim)
doCopyToClipboard() Копирование в буфер обмена

doCurrentTrackName(liID)
doNotCurrentTrackName(liID)

loggingRun() запускает/останавливает запись трека
loggingCheck(logging='   ')

MOBalarm()
clearCurrentStatus()
MOBclose()
delMOBmarker()
sendMOBtoServer()

restoreDisplayedRoutes()
bearing(latlng1, latlng2)
getSelfPathC

realtime(dataUrl,fUpdate)

Классы
L.Control.CopyToClipboard
*/
/*
// определение имени файла этого скрипта, например, чтобы знать пути на сервере
const index = document.getElementsByTagName('script').length - 1; 	// это так, потому что эта часть сработает при загрузке скрипта, и он в этот момент - последний http://feather.elektrum.org/book/src.html
var galadrielmapScript = scripts[index];
//console.log(galadrielmapScript);
*/
function onBodyLoad(){
listPopulate(routeList,routeDirURI,false,restoreDisplayedRoutes);	// список маршрутов, асинхронно
listPopulate(trackList,trackDirURI,true);	// список путей, показывать текущий, асинхронно
internalisationApply();	// подписи и заголовки, синхронно
mapListPopulate();	// список карт, синхронно

} // end function onBodyLoad

function mapListPopulate(){
// Карта должна быть, поэтому список карт -- синхронно.
// Global: mapList - список карт в интерфейсе, ul
let pluginMapList;
const xhr = new XMLHttpRequest();
xhr.overrideMimeType("application/json");
xhr.open('GET', '/signalk/v1/api/resources/charts/', false); 	// Подготовим синхронный запрос
xhr.send();
if (xhr.status == 200) { 	// Успешно
	try {
		pluginMapList = JSON.parse(xhr.responseText); 	// 
	}
	catch(err) { 	// 
		console.log('No any charts found. charts-plugin installed?');
	}
}
//console.log(pluginMapList);
const templateLi = mapList.querySelector('li[class="template"]');	// почему-то 'li[hidden]' не работает.
//console.log(templateLi);
for(let identifier in pluginMapList){
	//console.log(identifier,pluginMapList[identifier]);
	let newLI = templateLi.cloneNode(true);
	newLI.classList.remove("template");
	newLI.id = identifier;
	newLI.innerText = pluginMapList[identifier].name;
	newLI.hidden=false;
	//console.log(newLI);
	mapList.append(newLI);
}
} // end function mapListPopulate

function listPopulate(listObject,dirURI,chkCurrent=false,onComplete=undefined){
//
fetch(dirURI)	// запросим список файлов route
.then((response) => {
	//console.log(response.text());
    return response.json();
})
.then(data => {
	//console.log('[listPopulate] data:',data);
	if(chkCurrent) currentTrackName = data.currentTrackName;	// глобальная переменная
	const templateLi = listObject.querySelector('li[class="template"]');	// почему-то 'li[hidden]' не работает.
	listObject.querySelectorAll('li').forEach(li => {	// удалим из списка что там есть. delete использовать нельзя, потому что delete не уничтожает объекты, вопреки своему названию.
		if(li!=templateLi) {
			//console.log(li);
			li.remove();
			li = null;
		}
	});
	data.filelist.forEach(fileName => {
		let newLI = templateLi.cloneNode(true);
		newLI.classList.remove("template");
		newLI.id = fileName;
		newLI.innerText = fileName;
		newLI.hidden=false;
		listObject.append(newLI);
		if(chkCurrent && fileName == currentTrackName) {
			// Сделаем текущим и запустим слежение
			doCurrentTrackName(fileName);	// обязательно после append, ибо вне дерева элементы не ищутся. JavaScript -- коллекция нелепиц.
		}
	});
	if(onComplete) onComplete();	// здесь надо }).then(что?=>{if(onComplete) onComplete();}) ?
})
.catch( (err) => {
	console.log(`Error get ${dirURI} files list:`,err.message);
});
} // end function listPopulate

function getCookie(name) {
// возвращает cookie с именем name, если есть, если нет, то undefined
name=name.trim();
var matches = document.cookie.match(new RegExp(
	"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	)
);
return matches ? decodeURIComponent(matches[1]) : null;
}

function doSavePosition(){
/* Сохранение положения
global map, mapDisplayed, document, currTrackSwitch
*/
var expires =  new Date();
var pos = JSON.stringify(map.getCenter());
var zoom = JSON.stringify(map.getZoom());
expires.setTime(expires.getTime() + (60*24*60*60*1000)); 	// протухнет через два месяца
document.cookie = "GaladrielMapPosition="+pos+"; expires="+expires+"; path=/; samesite=Lax";
document.cookie = "GaladrielMapZoom="+zoom+"; expires="+expires+"; path=/; samesite=Lax";
//alert('Сохранение параметров '+pos+zoom);
// Сохранение показываемых карт
let openedNames = [];
for (let i = 0; i < mapDisplayed.children.length; i++) { 	// для каждого потомка списка mapDisplayed
	//console.log('mapDisplayed li',mapDisplayed.children[i]);
	openedNames[i] = mapDisplayed.children[i].id; 	// 
}
openedNames = JSON.stringify(openedNames);
document.cookie = "GaladrielMaps="+openedNames+"; expires="+expires+"; path=/; samesite=Lax";
// Сохранение показываемых маршрутов
openedNames = [];
for (let i = 0; i < routeDisplayed.children.length; i++) { 	// для каждого потомка списка mapDisplayed
	openedNames[i] = routeDisplayed.children[i].innerHTML; 	// 
}
openedNames = JSON.stringify(openedNames);
document.cookie = "GaladrielRoutes="+openedNames+"; expires="+expires+"; path=/; samesite=Lax";
// Сохранение переключателей и параметров
document.cookie = "GaladrielcurrTrackSwitch="+Number(currTrackSwitch.checked)+"; expires="+expires+"; path=/; samesite=Lax"; 	// переключатель currTrackSwitch
document.cookie = "GaladrielloggingSwitch="+Number(loggingSwitch.checked)+"; expires="+expires+"; path=/; samesite=Lax"; 	// переключатель loggingSwitch
document.cookie = "GaladrielSelectedRoutesSwitch="+Number(SelectedRoutesSwitch.checked)+"; expires="+expires+"; path=/; samesite=Lax"; 	// переключатель SelectedRoutesSwitch
document.cookie = "GaladrielminWATCHinterval="+minWATCHinterval+"; expires="+expires+"; path=/; samesite=Lax"; 	// 
} // end function doSavePosition

// Функции выбора - удаления карт
function selectMap(node) { 	
// Выбор карты из списка имеющихся. Получим объект
//console.log(node);
mapDisplayed.insertBefore(node,mapDisplayed.firstChild); 	// из списка доступных в список показываемых (объект, на котором событие, добавим в конец потомков mapDisplayed)
node.onclick = function(event){deSelectMap(event.currentTarget);};
displayMap(node.id);	// SignalK
}

function deSelectMap(node) {
// Прекращение показа карты, и возврат её в список имеющихся. Получим объект
var li = null;
for (var i = 0; i < mapList.children.length; i++) { 	// для каждого потомка списка mapList
	li = mapList.children[i]; 	// взять этого потомка
	var childTitle = li.innerHTML;
	if (childTitle > node.innerHTML) { 	// если наименование потомка дальше по алфавиту, чем наименование того, на что кликнули
		break;
	}
	li = null;
}
mapList.insertBefore(node,li); 	// перенесём перед тем, на котором обломался цикл, или перед концом
node.onclick = function(event){selectMap(event.currentTarget);};
removeMap(node.id);	// SignalK
}

function displayMap(mapname) {
/* Создаёт leaflet lauer с именем, содержащемся в mapParm, и заносит его на карту
Для SignalK mapname -- это identifier в смысле chart-plugin.
Делает запрос к SignalK для получения параметров карты
 Если в имени карты есть EPSG3395 - делает слой в проекции с пересчётом с помощью L.tileLayer.Mercator
*/
mapname=mapname.trim(mapname);
// Всегда будем спрашивать параметры карты
let mapParm = new Array(); 	// переменная для параметров карты
const xhr = new XMLHttpRequest();
xhr.open('GET', '/signalk/v1/api/resources/charts/'+mapname, false); 	// Подготовим синхронный запрос
xhr.send();
if (xhr.status == 200) { 	// Успешно
	try {
		const skMapParm = JSON.parse(xhr.responseText); 	// параметры карты
		mapParm.identifier=mapname;
		mapParm.name=skMapParm.name;
		mapParm.ext=skMapParm.format;
		mapParm.minZoom=skMapParm.minzoom;
		mapParm.maxZoom=skMapParm.maxzoom;
		mapParm.tileCacheURI=skMapParm.tilemapUrl;
		mapParm.data=skMapParm.data;	// Этого там нет, и неизвестно, будет ли
		mapParm.mapboxStyle=skMapParm.mapboxStyle;	// имя файла стиля mapbox, для векторных тайлов. Этого там нет, и неизвестно, будет ли
	}
	catch(err) { 	// 
		console.error('Get chart '+mapname+' metainfo error:',err);
	}
}
// javascript в загружаемом источнике на открытие карты
//console.log(mapParm);
if(mapParm['data'] && mapParm['data']['javascriptOpen']) eval(mapParm['data']['javascriptOpen']);
// Загружаемая карта - многослойная?
if(Array.isArray(additionalTileCachePath)) { 	// глобальная переменная - дополнительный кусок пути к талам между именем карты и /z/x/y.png Используется в версионном кеше, например, в погоде. Без / в конце, но с / в начале, либо пусто. Например, Weather.php.  Присваивается в javascriptOpen в параметрах карты. Или ещё где-нибудь.
	let currZoom; 
	if(savedLayers[mapname]) {
		if(savedLayers[mapname].options.zoom) currZoom = savedLayers[mapname].options.zoom;
		savedLayers[mapname].remove();
	}
	savedLayers[mapname]=L.layerGroup();
	if(currZoom) savedLayers[mapname].options.zoom = currZoom;
	for(let addPath of additionalTileCachePath) {
		let tileCacheURIthis = mapParm.tileCacheURI+addPath; 	// 
		if(mapParm['ext'])	tileCacheURIthis = tileCacheURIthis.replace('{ext}',mapParm['ext']); 	// при таком подходе можно сделать несколько слоёв с одним запросом параметров
		//console.log(tileCacheURIthis);
		//console.log('mapname=',mapname,savedLayers[mapname]);
		if((mapParm['epsg']&&String(mapParm['epsg']).indexOf('3395')!=-1)||(mapParm.name.indexOf('EPSG3395')!=-1)||(mapParm.identifier.indexOf('EPSG3395')!=-1)) {
			savedLayers[mapname].addLayer(L.tileLayer.Mercator(tileCacheURIthis, {minZoom:mapParm.minZoom,maxZoom:mapParm.maxZoom}));
		}
		else if(mapParm['mapboxStyle']) { 	// векторные тайлы
			savedLayers[mapname].addLayer(L.mapboxGL({style: mapParm['mapboxStyle'],minZoom:mapParm.minZoom}));
		}
		else {
			savedLayers[mapname].addLayer(L.tileLayer(tileCacheURIthis, {minZoom:mapParm.minZoom,maxZoom:mapParm.maxZoom}));
		}
	}
}
else {
	let tileCacheURIthis = mapParm.tileCacheURI; 	// 
	if(mapParm['ext'])	tileCacheURIthis = tileCacheURIthis.replace('{ext}',mapParm['ext']); 	// при таком подходе можно сделать несколько слоёв с одним запросом параметров
	//console.log(tileCacheURIthis);
	if((mapParm['epsg']&&String(mapParm['epsg']).indexOf('3395')!=-1)||(mapParm.name.indexOf('EPSG3395')!=-1)||(mapParm.identifier.indexOf('EPSG3395')!=-1)) {
		if(!savedLayers[mapname])	savedLayers[mapname] = L.tileLayer.Mercator(tileCacheURIthis, {minZoom:mapParm.minZoom,maxZoom:mapParm.maxZoom});
	}
	else if(mapParm['mapboxStyle']) { 	// векторные тайлы
		if(!savedLayers[mapname])	savedLayers[mapname] = L.mapboxGL({style: mapParm['mapboxStyle'],minZoom:mapParm.minZoom});
	}
	else {
		if(!savedLayers[mapname])	savedLayers[mapname] = L.tileLayer(tileCacheURIthis, {minZoom:mapParm.minZoom,maxZoom:mapParm.maxZoom});
	}
}
//console.log(savedLayers[mapname]);
// установим текущий масштаб в пределах возможного для загружаемой карты
if(! savedLayers[mapname].options.zoom) {
	let currZoom = map.getZoom();
	if(mapParm['maxZoom'] < currZoom) {
		map.setZoom(mapParm['maxZoom']);
		savedLayers[mapname].options.zoom = currZoom;
	}
	else if(mapParm['minZoom'] > currZoom) { 
		map.setZoom(mapParm['minZoom']);
		savedLayers[mapname].options.zoom = currZoom;
	}
	else savedLayers[mapname].options.zoom = false;
}
// javascript в загружаемом источнике на закрытие карты
if(mapParm['data'] && mapParm['data']['javascriptClose']) savedLayers[mapname].options.javascriptClose = mapParm['data']['javascriptClose'];
// Наконец, покажем
savedLayers[mapname].addTo(map);
} // end function displayMap

function removeMap(mapname) {
// Для SignalK mapname -- это identifier в смысле chart-plugin.
mapname=mapname.trim();
if(savedLayers[mapname].options.javascriptClose) eval(savedLayers[mapname].options.javascriptClose);
if(savedLayers[mapname].options.zoom) { 
	map.setZoom(savedLayers[mapname].options.zoom); 	// вернём масштаб как было
	savedLayers[mapname].options.zoom = false;
}
savedLayers[mapname].remove(); 	// удалим слой с карты
//savedLayers[mapname] = null; 	// удалим сам слой. Но это не надо, ибо включение/выключение отображения слоёв должно быть быстро, и обычно их не надо повторно получать с сервера
if(mapname==currentTrackName) stopCurrentTrackUpdate();	// Отключим слежение за логом
} // end function removeMap

// Функции выбора - удаления треков
function selectTrack(node,trackList,trackDisplayed,displayTrack) { 	
/* Выбор трека из списка имеющихся. 
node - объект li, элемент списка имеющихся, который выбрали
trackList - объект ul, список имеющихся
trackDisplayed - объект ul, список выбранных
displayTrack - функция показывания того, что соответствует выбранному элементу
global deSelectTrack() currentTrackShowedFlag
*/
//console.log(trackDisplayed.firstChild);
trackDisplayed.insertBefore(node,trackDisplayed.firstChild); 	// из списка доступных в список показываемых (объект, на котором событие, добавим в конец потомков mapDisplayed)
node.onclick = function(event){deSelectTrack(event.currentTarget,trackList,trackDisplayed,displayTrack);};
if(node.title.toLowerCase().indexOf("current")!= -1) currentTrackShowedFlag = 'loading'; 	// укажем, что трек сейчас загружается
//console.log('node.title=',node.title,currentTrackShowedFlag);
displayTrack(node); 	// создадим трек
} // end function selectTrack

function deSelectTrack(node,trackList,trackDisplayed,displayTrack) {
/* Прекращение показа трека, и возврат его в список имеющихся. Получим объект
node - объект li, элемент списка показываемых, который выбрали для непоказывания
trackList - объект ul, список имеющихся, куда надо вернуть node
global selectTrack()
*/
//alert(node.innerHTML);
var li = null;
for (var i = 0; i < trackList.children.length; i++) { 	// для каждого потомка списка trackList
	li = trackList.children[i]; 	// взять этого потомка
	var childTitle = li.innerHTML;
	if (childTitle > node.innerHTML) { 	// если наименование потомка дальше по алфавиту, чем наименование того, на что кликнули
		break;
	}
	li = null;
}
trackList.insertBefore(node,li); 	// перенесём перед тем, на котором обломался цикл, или перед концом
//console.log(node);
node.onclick = function(event){selectTrack(event.currentTarget,trackList,trackDisplayed,displayTrack);};
removeMap(node.innerHTML);
}

function displayTrack(trackNameNode) {
/* рисует трек с именем в trackNameNode
global trackDirURI, window, currentTrackName
*/
var trackName = trackNameNode.innerText.trim();
if( savedLayers[trackName] && (trackName != currentTrackName)) savedLayers[trackName].addTo(map); 	// нарисуем его на карте. Текущий трек всегда перезагружаем в updateCurrTrack
else {
	// просто спрашиваем у сервера файл, там не ответчик
	var options = {featureNameNode : trackNameNode};
	var xhr = new XMLHttpRequest();
	//console.log('[displayTrack]',trackDirURI+'/'+trackName);
	xhr.open('GET', encodeURI(trackDirURI+'/'+trackName), true); 	// Подготовим асинхронный запрос
	xhr.overrideMimeType( "text/plain; charset=x-user-defined" ); 	// тупые уроды из Mozilla считают, что если не указан mime type ответа -- то он text/xml. Файлы они, очевидно, не скачивают.
	xhr.send();
	xhr.onreadystatechange = function() { // trackName - внешняя
		if (this.readyState != 4) return; 	// запрос ещё не завершился, покинем функцию
		if (this.status != 200) { 	// запрос завершлся, но неудачно
			console.log('[displayTrack] To request file '+trackDirURI+'/'+trackName+' server return '+this.status);
			return; 	// что-то не то с сервером
		}
		//console.log('|'+this.responseText.slice(-10)+'|');
		let str = this.responseText.trim().slice(-12);
		//console.log('|'+str+'|');
		if(str.indexOf('</gpx>') == -1) {
			// может получиться кривой gpx -- по разным причинам
			if(str.indexOf('</trkpt>')==-1) { 	// на самом деле, здесь </metadata>, т.е., gpxlogger запустился, но ничего не пишет: нет gpsd, нет спутников, нет связи...
				savedLayers[trackName] = omnivore.gpx.parse(this.responseText.trim()+'\n</gpx>',options); // 
			}
			else {
				savedLayers[trackName] = omnivore.gpx.parse(this.responseText.trim()+'\n  </trkseg>\n </trk>\n</gpx>',options); // незавершённый gpx - дополним до конца. Поэтому скачиваем сами, а не omnivore
			}
		}
		else {
			savedLayers[trackName] = omnivore.gpx.parse(this.responseText,options); 	// responseXML иногда почему-то кривой
		}
		//console.log(savedLayers[trackName]);
		savedLayers[trackName].addTo(map); 	// нарисуем его на карте		
		startCurrentTrackUpdate();	// запустим слежение за треком
	}
}
} // end function displayTrack

function displayRoute(routeNameNode) {
/* рисует маршрут или места с именем routeName 
global routeDirURI map window
*/
var routeName = routeNameNode.innerText.trim();
var options = {featureNameNode : routeNameNode};
if( savedLayers[routeName]) savedLayers[routeName].addTo(map); 	// нарисуем его на карте. 
else {
	var routeType =  routeName.slice((routeName.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase(); 	// https://www.jstips.co/en/javascript/get-file-extension/ потому что там нет естественного пути
	//console.log(routeType);
	switch(routeType) {
	case 'gpx':
		savedLayers[routeName] = omnivore.gpx(routeDirURI+'/'+routeName,options);
		break;
	case 'kml':
		savedLayers[routeName] = omnivore.kml(routeDirURI+'/'+routeName,options);
		break;
	case 'csv':
		savedLayers[routeName] = omnivore.csv(routeDirURI+'/'+routeName,options);
		break;
	}
	savedLayers[routeName].addTo(map);
}
} // end function displayRoute

function updateCurrTrack() {
// Получим GeoJSON - ломаную из скольких-то последних путевых точек, или false, если с последнего
// обращения нет новых точек
// в формате GeoJSON
//console.log(currentTrackServerURI,currentTrackName);
var xhr = new XMLHttpRequest();
xhr.open('GET', encodeURI(currentTrackServerURI+'/'+currentTrackName), true); 	// Подготовим асинхронный запрос
xhr.send();
xhr.onreadystatechange = function() { // 
	if (this.readyState != 4) return; 	// запрос ещё не завершился, покинем функцию
	if (this.status != 200) { 	// запрос завершлся, но неудачно
		//console.log('Server return '+this.status+'\ncurrentTrackServerURI='+currentTrackServerURI+'\ncurrTrackName='+currentTrackName+'\n\n');
		console.log('To [updateCurrTrack] server return '+this.status+' instead '+currentTrackName+' last segment.');
		loggingIndicator.style.color='red';
		return; 	// что-то не то с сервером
	}
	//console.log(this.responseText);
	let resp = {};
	try {
		resp = JSON.parse(this.responseText);
	}
	catch(err) {
		if(this.responseText.trim()) console.log('Bad data to update current track:'+this.responseText+';',err.message)
		loggingIndicator.style.color='red';
	}
	//console.log('[updateCurrTrack] resp:',resp);
	if(resp.logging){ 	// лог пишется
		if(typeof loggingIndicator != 'undefined'){ 	// лампочка в интерфейсе. Вообще-то, в этом варианте софта эта лампочка всегда есть.
			loggingIndicator.style.color='green';
			loggingIndicator.innerText='\u2B24';
			if(!loggingSwitch.disabled) loggingSwitch.checked = true;	// если есть переключатель -- значит, можно управлять
		}
		if(resp.pt) { 	// есть данные
			if(savedLayers[currentTrackName]) {	// может не быть, если, например, показ треков выключили, но выполнение currentTrackUpdate уже запланировано
				if(savedLayers[currentTrackName].getLayers()) { 	// это layerGroup
					savedLayers[currentTrackName].getLayers()[0].addData(resp.pt); 	// добавим полученное к слою с текущим треком
					//console.log(savedLayers[currentTrackName].getLayers()[0]);
				}
				else savedLayers[currentTrackName].addData(resp.pt); 	// добавим полученное к слою с текущим треком
			}
		}
	}
	else { 	// лог не пишется
		if(typeof loggingIndicator != 'undefined'){
			if(loggingSwitch.checked){ 	// лампочка и переключатель в интерфейсе
				// Лог не пишется, но писать велено.
				// Может быть, оно там не пишется совсем, а может быть, что пишется другой файл
				loggingCheck();	// спросим про лог, если там новый файл -- он станет текущим, а лампочки установятся
			}
			else {
				loggingIndicator.style.color='';
				loggingIndicator.innerText='';
				if(currentTrackName) {
					doNotCurrentTrackName(currentTrackName);
				}				
			}
		}
		stopCurrentTrackUpdate(); // Отключим слежение за логом
	}
}
} // end function updateCurrTrack

// 

// Функции рисования маршрутов
function routeControlsDeSelect() {
// сделаем невыбранными кнопки управления рисованием маршрута. Они должны быть и так не выбраны, но почему-то...
var elements = document.getElementsByName('routeControl');
for (var i = 0; i < elements.length; i++) {
	elements[i].checked=false;
}   
} // end function routeControlsDeSelect

function delShapes(realy) {
/* Удаляет полилинии в состоянии редактирования, если realy = true
возвращает число таких объектов
полилинии находятся в глобальном массиве measuredPaths, куда заносятся при создании
*/
//alert(measuredPaths);
var edEnShapesCntr=0;
if(realy) map.editTools.stopDrawing(); 	// нужно прекратить рисование перед удалением, иначе будут глюки
for(var i=0; i<measuredPaths.length; i++) {
	if(measuredPaths[i].editEnabled()) {
		edEnShapesCntr++;
		//console.log(measuredPaths[i]);
		//alert(measuredPaths[i].getLatLngs()[0]);
		if(realy) {
			measuredPaths[i].editor.deleteShapeAt(measuredPaths[i].getLatLngs()[0]);
			measuredPaths.splice(i,1);
		}
	}
};
//alert(measuredPaths);
return edEnShapesCntr;
}	// end function delShapes

function tooggleEditRoute(e) {
/* Переключает режим редактирования
Обычно обработчик клика по линии
*/
//console.log(e.target);
//console.log('tooggleEditRoute start by anymore');

currentRoute = e.target; 	// сделаем объект, по которому щёлкнули, текущим
if(('feature' in e.target) && ('fileName' in e.target.feature.properties)) {
	//console.log(savedLayers[e.target.feature.properties.fileName]);
	//currentRoute = savedLayers[e.target.feature.properties.fileName]; 	// сделаем самый верхний родительский объект объекта, по которому щёлкнули, текущим. На самом деле, это невозможно, но у нас все загружаемые объекты верхнего уровня сохраняются в глобальном массиве
	routeSaveName.value = e.target.feature.properties.fileName; 	// запишем в поле ввода имени имя загруженного файла
	if('desc' in e.target.feature.properties) routeSaveDescr.value = e.target.feature.properties.desc;
}
else {
	//currentRoute = e.target; 	// сделаем объект, по которому щёлкнули, текущим
	routeSaveName.value = new Date().toJSON(); 	// запишем в поле ввода имени дату
	if( measuredPaths.indexOf(e.target) === -1) measuredPaths.push(e.target); 	// положим объект в список редактируемых объектов. Тогда эта линия локально сохранится.
}

e.target.toggleEdit();
if(e.target.editEnabled()) { 	//  если включено редактирование
	routeEraseButton.disabled=false; 	// - сделать доступной кнопку Удалить
	routeContinueButton.disabled=false; 	// - сделать доступной кнопку Продолжить
}
else {
	if(delShapes(false))  routeEraseButton.disabled=false; 	// если есть редактируемые слои
	else {
		routeEraseButton.disabled=true; 	// - сделать доступной кнопку Удалить
		routeContinueButton.disabled=true; 	//  - сделать доступной кнопку Продолжить
	}
}
} // end function tooggleEditRoute

function doSaveMeasuredPaths() {
/* сохранение в cookie отображаемых на карте маршрутов
Сохраняются только маршруты, не находящиеся в состоянии редактирования.
Предполагается, что это для сохранения маршрутов/замеров расстояний на конкретном устройстве
*/
var toSave = [];
if(measuredPaths.length) { 	// если есть, что сохранять
	var expires =  new Date();
	expires.setTime(expires.getTime() + (60*24*60*60*1000)); 	// протухнет через два месяца
	for(var i=0; i<measuredPaths.length; i++) {	// в глобальном списке маргрутов
		if(!measuredPaths[i].editEnabled()) { 	// те, что не редактируются
			toSave.push(measuredPaths[i].getLatLngs()); 	// сохраним координаты вершин
		}
	}
}
//alert(toSave.length);
toSave = JSON.stringify(toSave);
//alert(toSave);
document.cookie = "GaladrielMapMeasuredPaths="+toSave+"; expires="+expires+"; path=/; samesite=Lax"; 	// если сечас и нет, чего сохранять - грохнем куки
} 	// end function doSaveMeasuredPaths

function doRestoreMeasuredPaths() {
//var RestoreMeasuredPaths = JSON.parse(JSON.retrocycle(getCookie('GaladrielMapMeasuredPaths')));
var RestoreMeasuredPaths = JSON.parse(getCookie('GaladrielMapMeasuredPaths'));
if(RestoreMeasuredPaths) {
	if(L.Browser.mobile && L.Browser.touch) var weight = 15; 	// мобильный браузер
	else var weight = 7; 	// стационарный браузер
	for(var i=0; i<RestoreMeasuredPaths.length; i++) {	// в списке маршрутов
		window.LAYER = L.polyline(RestoreMeasuredPaths[i],{showMeasurements: true,color: '#FDFF00',weight: weight,opacity: 0.5})
		.addTo(map);
		//window.LAYER.on('dblclick', L.DomEvent.stop).on('dblclick', window.LAYER.toggleEdit);
        window.LAYER.on('click', L.DomEvent.stop).on('click', tooggleEditRoute);
		measuredPaths.push(window.LAYER);
	}
}
}	// end function doRestoreMeasuredPaths

function saveGPX() {
/* Сохраняет на сервере маршрут из объекта currentRoute
Считаем, что в currentRoute - именно тот объект, по которому щёлкнули, а не внешний, если он есть
Считается, что функция вызывается по кнопке в интерфейсе, поэтому так
*/
if(!currentRoute) { 	// глобальная переменная, должна содержать объект Editable, присваивается в tooggleEditRoute, типа - по щелчку на маршруте
	routeSaveMessage.innerHTML = 'Error - no route selected.'
	return;
}
//console.log(currentRoute);
let toSaveRoute; 	// тот объект, который будем сохранять - ранее загруженный gpx или только что нарисованный layer
let fileName = routeSaveName.value; 	// имя файла для сохранения, поле в интерфейсе
if(! fileName) { 	// внезапно имени нет, хотя в index поле заполняется
	fileName = new Date().toJSON();	// == toISOString()
	routeSaveName.value = fileName;
}
// унифицируем сохраняемое.
if('feature' in currentRoute) { 	// currentRoute - часть чего-то большего, и сохранять надо это что-то большее. При этом считаем, что у этого есть filename
	//console.log('Layer');
	let oldFileName;
	if(savedLayers[currentRoute.feature.properties.fileName]) {
		toSaveRoute = savedLayers[currentRoute.feature.properties.fileName]; 	// это весь объект, где-то внутри которого есть currentRoute
		oldFileName = currentRoute.feature.properties.fileName;
	}
	else toSaveRoute = currentRoute;
	// перепишем поля
	currentRoute.feature.properties.fileName = fileName; 	// теперь изменим currentRoute, но в savedLayers
	currentRoute.feature.properties.desc = routeSaveDescr.value; 	// поле в интерфейсе
	if(oldFileName) {
		delete savedLayers[oldFileName]; 	// этот объект там по имени файла, а имя-то мы и поменяем
		savedLayers[currentRoute.feature.properties.fileName] = toSaveRoute;
	}
}
else { 	// 
	//console.log('Polyline');
	if(!('eachLayer' in currentRoute)) currentRoute = new L.layerGroup([currentRoute]); 	// попробуем сменть тип на layerGroup, но это обычно боком выходит, потому что всё же layergroup не layer
	// дальше считаем, что у нас всё происходит в первом слое
	let layers = currentRoute.getLayers()
	if(!('feature' in layers[0])){
		layers[0].feature = {'properties':{}}; 	// типа, оно будет JSONLayer
		layers[0].feature.type = "Feature";
	}
	layers[0].feature.properties.fileName = fileName;
	layers[0].feature.properties.desc = routeSaveDescr.value; 	// поле в интерфейсе
	layers[0].feature.properties.isRoute = true; 	// укажем, что это путь
	layers[0].feature.properties.name = fileName; 	// укажем, что это путь
	toSaveRoute = currentRoute;
}
//		currentRoute.options.fileName = routeName; 	// установим это имя для внешнего объекта. ГДЕ ЭТО ИСПОЛЬЗУЕТСЯ? leaflet-omnivore.js строка 334
//console.log(toSaveRoute);

// Теперь делаем JSON, из которого сделаем gpx
// Сначала соберём в pointsFeatureCollection реальные точки из данных superclaster
let pointsFeatureCollection; 	// 
// поскольку мы хотим toGeoJSON() все имеющиеся точки, а слой может быть superclaster, то будем доставать точки из supercluster'а
toSaveRoute.eachLayer( function (layer) { 	// для каждого слоя этой группы выполним
	if('supercluster' in layer) { 	// это superclaster'изованный слой, с точками, надо полагать, ранее положенными в свойство layer.supercluster
		//console.log(layer.supercluster.points);
		pointsFeatureCollection = layer.supercluster.points; 	// считаем, что слой с точками только один. У нас, вроде, это так.
	}
});
//console.log(pointsFeatureCollection);

//console.log(toSaveRoute);
let route = toSaveRoute.toGeoJSON(); 	// сделаем из Editable объект geoJSON
//console.log(route);

if(pointsFeatureCollection) { 	// это был supercluster, поэтому в geoJSON неизвестно, сколько оригинальных точек, а не все. Но у нас с собой было...
	for(let i=0; i<route.features.length;i++) {	// выкинем все точки
		if(route.features[i].geometry.type == 'Point') {
			// delete route.features[i]; 	// так делать нельзя, потому что у всего используемого софта крыша едет от элемента массива undefined. Хотя это должно быть нормально в языке. Но что в этом языке нормально?
			route.features.splice(i,1); 	// вырежем этот элемент из массива
		}
	}
	route.features = route.features.concat(pointsFeatureCollection); 	// теперь положим туда точки, ранее взятые в superclaster'е
}
//console.log(route);
route = toGPX(route); 	// сделаем gpx 
//console.log(route);

var xhr = new XMLHttpRequest();
//xhr.open('POST', 'saveGPX', true); 	// Подготовим асинхронный запрос
xhr.open('GET', 'saveGPX/' + encodeURIComponent(fileName) + '/' + encodeURIComponent(route), true); 	// Подготовим асинхронный запрос
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//xhr.send('name=' + encodeURIComponent(fileName) + '&gpx=' + encodeURIComponent(route));
xhr.send();
xhr.onreadystatechange = function() { // 
	if (this.readyState != 4) return; 	// запрос ещё не завершился
	if (this.status != 200) return; 	// что-то не то с сервером
	const res = JSON.parse(this.responseText);
	routeSaveMessage.innerHTML = res[1];
	if(!res[0]) listPopulate(routeList,routeDirURI);	// список маршрутов, асинхронно
}
} // end function createGPX()

function toGPX(geoJSON) {
/* Create gpx route or track (createTrk==true) from geoJSON object
geoJSON must have a needle gpx attributes
bounds - потому что geoJSON.getBounds() не работает
*/
//console.log(geoJSON);
var gpxtrack = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<gpx xmlns="http://www.topografix.com/GPX/1/1"  creator="GaladrielMap" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
`;
gpxtrack += '<metadata>\n';
var date = new Date().toISOString();
gpxtrack += '	<time>'+ date +'</time>\n';
// Хитрый способ получить границы всех объектов в geoJSON
const geojsongroup = L.geoJSON(geoJSON);
let bounds = geojsongroup.getBounds();
//console.log(bounds);
if(Object.entries(bounds).length) gpxtrack += '	<bounds minlat="'+bounds.getSouth().toFixed(4)+'" minlon="'+bounds.getWest().toFixed(4)+'" maxlat="'+bounds.getNorth().toFixed(4)+'" maxlon="'+bounds.getEast().toFixed(4)+'"  />\n';
gpxtrack += '</metadata>\n';
let i,k,j;
for( i=0; i<geoJSON.features.length;i++) {
	//console.log(geoJSON.features[i]);
	switch(geoJSON.features[i].geometry.type) {
	case 'MultiLineString': 	// это обязательно путь
		gpxtrack += '	<trk>\n'; 	// рисуем трек
		doDescriptions() 	// запишем разные описательные поля
		for( k = 0; k < geoJSON.features[i].geometry.coordinates.length; k++) {
			gpxtrack += '		<trkseg>\n'; 	// рисуем трек
			for ( j = 0; j < geoJSON.features[i].geometry.coordinates[k].length; j++) {
				gpxtrack += '			<trkpt '; 	// рисуем трек
				gpxtrack += 'lat="' + geoJSON.features[i].geometry.coordinates[k][j][1] + '" lon="' + geoJSON.features[i].geometry.coordinates[k][j][0] + '">';
				gpxtrack += '</trkpt>\n'; 	// рисуем трек
			}
			gpxtrack += '		</trkseg>\n'; 	// рисуем трек
		}
		gpxtrack += '	</trk>\n'; 	// рисуем трек
		break;
	case 'LineString': 	// это может быть как маршрут, так и путь
		if(!geoJSON.features[i].properties.isRoute) gpxtrack += '	<trk>\n'; 	// рисуем трек
		else gpxtrack += '	<rte>\n'; 	// рисуем маршрут
		doDescriptions() 	// запишем разные описательные поля
		if(!geoJSON.features[i].properties.isRoute) gpxtrack += '		<trkseg>\n'; 	// рисуем трек
		for ( j = 0; j < geoJSON.features[i].geometry.coordinates.length; j++) {
			if(!geoJSON.features[i].properties.isRoute) gpxtrack += '			<trkpt '; 	// рисуем трек
			else gpxtrack += '		<rtept '; 	// рисуем маршрут
			gpxtrack += 'lat="' + geoJSON.features[i].geometry.coordinates[j][1] + '" lon="' + geoJSON.features[i].geometry.coordinates[j][0] + '">';
			if(!geoJSON.features[i].properties.isRoute) gpxtrack += '</trkpt>\n'; 	// рисуем трек
			else gpxtrack += '</rtept>\n'; 	// рисуем маршрут
		}
		if(!geoJSON.features[i].properties.isRoute) gpxtrack += '		</trkseg>\n'; 	// рисуем трек
		if(!geoJSON.features[i].properties.isRoute) gpxtrack += '	</trk>\n'; 	// рисуем трек
		else gpxtrack += '	</rte>\n'; 	// рисуем маршрут
		break;
	case 'Point':
		gpxtrack += '	<wpt '; 	// рисуем точку
		gpxtrack += 'lat="' + geoJSON.features[i].geometry.coordinates[1] + '" lon="' + geoJSON.features[i].geometry.coordinates[0] + '">\n';
		doDescriptions() 	// запишем разные описательные поля
		gpxtrack += '	</wpt>\n'; 	// 
	}
}
gpxtrack += '</gpx>';
//console.log(gpxtrack);
return gpxtrack;

	function doDescriptions() {
		if(geoJSON.features[i].properties.name) gpxtrack += '		<name>' + geoJSON.features[i].properties.name.encodeHTML() + '</name>\n';
		if(geoJSON.features[i].properties.cmt) gpxtrack += '		<cmt>' + geoJSON.features[i].properties.cmt.encodeHTML() + '</cmt>\n';
		if(geoJSON.features[i].properties.desc) gpxtrack += '		<desc>' + geoJSON.features[i].properties.desc.encodeHTML() + '</desc>\n';
		if(geoJSON.features[i].properties.src) gpxtrack += '		<src>' + geoJSON.features[i].properties.src + '</src>\n';
		if(geoJSON.features[i].properties.link) {
			for ( let ii = 0; ii < geoJSON.features[i].properties.link.length; ii++) { 	// ссылок может быть много
				//console.log(geoJSON.features[i].properties.link[ii]);
				//gpxtrack += '		<link http="' + geoJSON.features[i].properties.link[ii].getAttribute('href') + '">\n';
				gpxtrack += '		<link http="' + geoJSON.features[i].properties.link[ii].getAttribute('http') + '">\n';
				for(let iii = 0; iii < geoJSON.features[i].properties.link[ii].children.length; iii++) {
					//console.log(geoJSON.features[i].properties.link[ii].children[iii].textContent);
					gpxtrack += '			<' + geoJSON.features[i].properties.link[ii].children[iii].nodeName +'>' + geoJSON.features[i].properties.link[ii].children[iii].textContent + '</' + geoJSON.features[i].properties.link[ii].children[iii].nodeName + '>\n';
				}
				gpxtrack += '		</link>\n'
			}
			//console.log(gpxtrack);
		}
		if(geoJSON.features[i].properties.number) gpxtrack += '		<number>' + geoJSON.features[i].properties.number + '</number>\n';
		if(geoJSON.features[i].properties.type) gpxtrack += '		<type>' + geoJSON.features[i].properties.type + '</type>\n';
		if(geoJSON.features[i].properties.extensions) { 	// это HTMLCollection
			// это произвольная структура, с которой непонятно что делать
		}
	}
} // end function toGPX
    
String.prototype.encodeHTML = function () {
    return this.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
};

// Кластеризация точек
function updateClasters() {
/* Обновляет все показываемые кластеры точек
*/
//console.log('galadrielmap.js: updateClasters start by anymore');
for (var i = 0; i < routeDisplayed.children.length; i++) { 	// для каждого потомка списка routeDisplayed
	const trackName = routeDisplayed.children[i].innerHTML; 	// наименование показывающегося слоя, возможн, с точками
	updClaster(savedLayers[trackName]);
}
for (var i = 0; i < trackDisplayed.children.length; i++) { 	// для каждого потомка списка trackDisplayed
	const trackName = trackDisplayed.children[i].innerHTML; 	// наименование показывающегося слоя, возможн, с точками
	updClaster(savedLayers[trackName]);
}
} // end function updateClasters

async function updClaster(e) {
// обновляет кластер
if(!e) return;
let layer;
if(e.target) layer = e.target; 	// e - event
else layer = e;	// e - layer
//console.log(layer.getLayers());
//console.log(layer);
if(layer.getLayers().length) layer.eachLayer(realUpdClaster);
else realUpdClaster(layer);

function realUpdClaster(layer) {
if(layer.supercluster) {
	//console.log('Обновляется кластер');
	//console.log(layer);
	const bounds = map.getBounds();
	const mapBox = {
		bbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
		zoom: map.getZoom()
	}
	layer.clearLayers();
	layer.addData(layer.supercluster.getClusters(mapBox.bbox, mapBox.zoom)); 	// возвращает точки (и кластеры как точки) как GeoJSON Feature и загружает в слой
}
} 	// end function realUpdClaster
} // end function updClaster

function nextColor(color,step) {
/* step - by color chanel 
step не может быть константой, если color - число, если мы хотим получать чистые цвета
*/
if(!step) step = 0x80;
const colorStr = ('000000' + color.toString(16)).slice(-6);
var r = parseInt(colorStr.slice(0,2),16);
var g = parseInt(colorStr.slice(2,4),16);
var b = parseInt(colorStr.slice(4),16);
b-=step;
if(b<0) {
	b=0xFF+b;
	g-=step;
	if(g<0) {
		g=0xFF+g;
		r-=step;
		if(r<0) {
			r=0xFF+r;
			g=0xFF-g;
			b=0xFF-b;
		}
	}
}
return parseInt(('00'+r.toString(16)).slice(-2)+('00'+g.toString(16)).slice(-2)+('00'+b.toString(16)).slice(-2),16);
} // end function nextColor


// Показ координат центра и переход по введённым
function centerMarkPosition() {
/* global goToPositionField */
centerMark.setLatLng(map.getCenter()); 	// определена в index
//centerMark.setLatLng(map.getBounds().getCenter()); 	// определена в index
if(goToPositionManualFlag === false) { 	// если поле не юзают руками
	const lat = Math.round(centerMark.getLatLng().lat*10000)/10000; 	 	// широта с четыремя знаками после запятой - 10см
	const lng = Math.round(((centerMark.getLatLng().lng%360+540)%360-180)*10000)/10000; 	 	// долгота
	goToPositionField.value = lat + ' ' + lng;
} 	// а когда руками, т.е., фокус в поле -- координаты перестают изменяться. Карта же может двигаться за курсором
}; // end function centerMarkPosition

function centerMarkOn() {
/**/
centerMarkPosition();
centerMark.addTo(map);
map.on('move', centerMarkPosition);
goToPositionField.addEventListener('focus', function(e){goToPositionManualFlag=true;}); 	// при получении фокуса - прекратить обновление
goToPositionField.addEventListener('blur', function(e){ 	// когда теряет фокус. В результате, даже если карта движется, с полем можно работать
			goToPositionButton.value = goToPositionField.value; 	// разбор введённого как координат происходит потом, когда координаты действительно нужны - для скорости
			goToPositionManualFlag=false;
		}
	); 	// при потере - возобновить
}; // end function centerMarkOn

function centerMarkOff() {
centerMark.remove();
map.off('move', centerMarkPosition);
}; // end function centerMarkOff

function flyByString(stringPos){
/* Получает строку предположительно с координатами, и перемещает туда центр карты */
//console.log('goToPositionButton',goToPositionButton.value,'goToPositionField',goToPositionField.value);
if(!stringPos) stringPos = map.getCenter().lat+' '+map.getCenter().lng; 	// map -- глобально определённая карта
//console.log('stringPos',stringPos);
let error;
try {
    var position = new Coordinates(stringPos); 	// https://github.com/otto-dev/coordinate-parser
	//console.log(position);
	const lat=position.getLatitude();
	const lon=position.getLongitude();
	map.setView(L.latLng([lat,lon])); 	// подвинем карту в указанное место
	let xhr = new XMLHttpRequest();
	const url = encodeURI('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+lat+'&lon='+lon);
	xhr.open('GET', url, true); 	// Подготовим асинхронный запрос
	//xhr.setRequestHeader('Referer',url); 	// nominatim.org требует?
	xhr.send();
	xhr.onreadystatechange = function() { // 
		if (this.readyState != 4) return; 	// запрос ещё не завершился
		if (this.status != 200) return; 	// что-то не то с сервером
		const nominatim = JSON.parse(this.response);
		//console.log(nominatim);
		updGeocodeList(nominatim);
	}	
} catch (error) { 	// строка - не координаты
	//console.log(stringPos,error);
	let xhr = new XMLHttpRequest();
	const url = encodeURI('https://nominatim.openstreetmap.org/search/'+stringPos+'?format=jsonv2'); 	// прямое геокодирование
	xhr.open('GET', url, true); 	// Подготовим асинхронный запрос
	//xhr.setRequestHeader('Referer',url); 	// nominatim.org требует?
	xhr.send();
	xhr.onreadystatechange = function() { // 
		if (this.readyState != 4) return; 	// запрос ещё не завершился
		if (this.status != 200) return; 	// что-то не то с сервером
		const nominatim = JSON.parse(this.response);
		//console.log(nominatim);
		updGeocodeList(nominatim);
	}
}
} // end function flyByString

function updGeocodeList(nominatim){
if(!Array.isArray(nominatim)) nominatim = [nominatim];
geocodedList.innerHTML = ""; 	// очистим список
for(const geoObj of nominatim){
	//console.log(geoObj);
	let optNode = document.createElement('li');
	optNode.innerText = geoObj.display_name;
	optNode.onclick = function(e) {
		//console.log(e); 
		for(let liNode of geocodedList.children){
			liNode.style.backgroundColor='inherit';
		}
		e.target.style.backgroundColor='#d5d5d5';
		map.setView(L.latLng([geoObj.lat,geoObj.lon]))
	};
	geocodedList.append(optNode);
}
} // end function updGeocodeList


// Копирование в буфер обмена
function doCopyToClipboard(text) {
/* создаёт control с полем, откуда можно скопировать text в буфер обмена, 
при этом пытается это сделать сама.
Через некоторое время поле исчезает

global copyToClipboard
*/
if(typeof(text) === 'string') {
	if(!copyToClipboard._map) { 	// кривой метод
		//alert('not on map!');
		copyToClipboard.addTo(map);
	}
	copyToClipboardField.value = text;
	copyToClipboardField.focus();
	copyToClipboardField.select(); // 
	let successful = document.execCommand('copy');
	if(successful) {
		copyToClipboardMessage.innerText = copyToClipboardMessageOkTXT;
	}
	else {
		copyToClipboardMessage.style.color='red';
		copyToClipboardMessage.innerText = copyToClipboardMessageBadTXT;
	}
	//console.log('PosFreshBefore',PosFreshBefore);
	setTimeout(doCopyToClipboard,PosFreshBefore); 	// удалим поле через PosFreshBefore, определённый в index
}
else {
	if(typeof copyToClipboard !== 'undefined') copyToClipboard.remove();
}
} // end function doCopyToClipboard

function doCurrentTrackName(liID){
let liObj = document.getElementById(liID);
liObj.classList.add("currentTrackName");
liObj.title='Current track';
currentTrackName = liID;
currentTrackShowedFlag = false; 	// флаг, что у нас новый текущий трек. Обрабатывается в currentTrackUpdate index.php
startCurrentTrackUpdate();	// запустим слежение за треком
} // end function doCurrentTrackName

function doNotCurrentTrackName(liID){
let liObj = document.getElementById(liID);
liObj.classList.remove("currentTrackName");
liObj.title='';
currentTrackName = '';
stopCurrentTrackUpdate();	// остановим слежение за логом
} // end function doNotCurrentTrackName

function loggingRun() {
/* запускает/останавливает запись трека по кнопке в интерфейсе */
let logging = 'logging/';
if(loggingSwitch.checked) {
	logging += 'startLogging';
	// Здесь принудительно включим слежение за логом, потому что вызов loggingCheck ниже
	// заведомо не вернёт новый текущий трек, потому что просто устанавливает navigation.trip.logging
	startCurrentTrackUpdate();
}
else {
	logging += 'stopLogging';
	// Оно просто приведёт к устанавливке пути navigation.trip.logging, а когда оно сработает
	// -- одному богу известно.Т.е., выключать здесь отслеживание трека нельзя. 
	// Оно выключится в updateCurrTrack, когда туда придёт, что лог не пишется. 
	// Вместо этого надо заблокировать кнопку переключателя, чтобы по ней не барабанили.
	// Однако, updateCurrTrack может быть не запущен, т.к. "Текущий трек всегда показывается"
	// не установлено, а текущий трек -- не в числе показываемых
	loggingSwitch.disabled = true;
}
//console.log('[loggingRun] logging=',logging);
loggingCheck(logging);
} // end function loggingRun

function loggingCheck(logging='logging/status') {
/* асинхронно включает и выключает запись трека, а также проверяет, ведётся ли запись 
путём запроса logging.
Запрос должен вернуть JSON массив из двух значенией: ведётся ли запись bool и имя пишущегося файла
Запрос возвращает состояние записи трека на момент запроса, _до_ выполнения команды. Ибо команда ---
это просто изменение пути navigation.trip.logging
*/
let xhr = new XMLHttpRequest();
xhr.open('GET', encodeURI(logging), true); 	// Подготовим асинхронный запрос
xhr.send();
xhr.onreadystatechange = function() { // 
	if (this.readyState != 4) return; 	// запрос ещё не завершился
	if (this.status != 200) return; 	// что-то не то с сервером
	let status = JSON.parse(this.response);
	//console.log('[loggingCheck] status',status,'currentTrackName=',currentTrackName);
	// Оттого, что ответ вернулся, не значит, что что-то произошло -- оно там, б..., всё асинхронно.
	// чтобы узнать, произошло или нет, должно быть запущено слежение за логом
	if(status[0]) { 	
		loggingIndicator.style.color='green';
		loggingIndicator.innerText='\u2B24';
		//loggingSwitch.checked = true;	//
		loggingSwitch.disabled = false;
	}
	else {
		if(status[0]===null) {	// нет возможности управлять записью трека
			loggingSwitch.checked = false;	// 
			loggingSwitch.disabled = true;
		}
		else {
			if(loggingSwitch && loggingSwitch.checked){
				loggingIndicator.style.color='red';
				loggingIndicator.innerText='\u2B24';
			}
			else {
				loggingIndicator.innerText='';
				if(currentTrackName) {
					doNotCurrentTrackName(currentTrackName);
				}
			}
			loggingSwitch.disabled = false;
		}
	}

	// Новый текущий трек
	const newTrackName = status[1]; 	// имя нового текущего (пишущийся сейчас) трека -- имя файла
	if(newTrackName && (newTrackName != currentTrackName)){	// есть новый текущий трек, и он не тот же, что старый
		let newTrackLI = document.getElementById(newTrackName); 	// его всегда нет?
		console.log('[newTrack] есть новый текущий трек',newTrackName,'старый currentTrackName',currentTrackName);
		if(!newTrackLI) {
			// Добавим новый li в trackList и сделаем его текущим, в результате чего 
			// он переместится в trackDisplayed, если на то воля юзера
			if(currentTrackName) {
				doNotCurrentTrackName(currentTrackName);
			}
			const templateLi = trackList.querySelector('li[class="template"]');
			newTrackLI = templateLi.cloneNode(true);
			newTrackLI.classList.remove("template");
			newTrackLI.id = newTrackName;
			newTrackLI.innerText = newTrackName;
			newTrackLI.hidden=false;
			trackList.append(newTrackLI);
		} 	// иначе он и так текущий? -- нет, он уже мог быть в списке показываемых
		// Сделаем текущим и запустим слежение
		doCurrentTrackName(newTrackName);	// обязательно после append, ибо вне дерева элементы не ищутся. JavaScript -- коллекция нелепиц.
	}
return;
} // end xhr.onreadystatechange
} // end function loggingCheck

function MOBalarm() {
//
// Global: map, cursor, currentMOBmarker
let latlng;
if(map.hasLayer(cursor)) latlng = cursor.getLatLng(); 	// координаты известны и показываются, хотя, возможно, устаревшие
else return false;

currentMOBmarker = L.marker(latlng, { 	// маркер для этой точки
	icon: mobIcon,
	draggable: true,
});
currentMOBmarker.on('click', function(ev){
	currentMOBmarker = ev.target;
	clearCurrentStatus(); 	// удалим признак current у всех маркеров
	currentMOBmarker.feature.properties.current = true;
	sendMOBtoServer(); 	// отдадим данные MOB для передачи на сервер
}); 	// текущим будет маркер, по которому кликнули
currentMOBmarker.on('dragend', function(event){
	//console.log("MOB marker dragged end, send to server new coordinates",currentMOBmarker);
	sendMOBtoServer(); 
}); 	// отправим на сервер новые сведения, когда перемещение маркера закончилось. Если просто указать функцию -- в sendMOBtoServer передаётся event. Если в одну строку -- всё равно передаётся event. Что за???
clearCurrentStatus(); 	// удалим признак current у всех маркеров
currentMOBmarker.feature = { 	// укажем признак "текущий маркер" как GeoJson свойство
	type: 'Feature',
	properties: {current: true},
};
mobMarker.addLayer(currentMOBmarker);
if(!map.hasLayer(mobMarker)) mobMarker.addTo(map); 	// выставим маркер

if(loggingIndicator && !loggingSwitch.checked) {
	loggingSwitch.checked = true;
	loggingRun(); 	// хотя в loggingSwitch стоит onChange="loggingRun();" изменение loggingSwitch.checked = true; не приводит к срабатыванию обработчика
}
if(mobMarker.getLayers().length > 2) delMOBmarkerButton.disabled = false;

sendMOBtoServer(); 	// отдадим данные MOB для передачи на сервер

return true;
} // end function MOBalarm


function clearCurrentStatus() {
/* удаляет признак "текущий маркер" у всех маркеров мультислоя mobMarker */
mobMarker.eachLayer(function (layer) { 	// удалим признак current у какого-то маркера
	if((layer instanceof L.Marker) && (layer.feature.properties.current == true))	{
		layer.feature.properties.current = false;
	}
});
} // end function clearCurrentStatus


function MOBclose() {
//console.log('Завершаем режим MOB');
mobMarker.remove(); 	// убрать мультислой-маркер с карты
mobMarker.clearLayers(); 	// очистить мультислой от маркеров
mobMarker.addLayer(toMOBline); 	// вернём туда линию
sendMOBtoServer(false); 	// передадим на сервер, что режим MOB прекращён
document.cookie = 'GaladrielMapMOB=; expires=0; path=/; samesite=Lax'; 	// удалим куку
azimuthMOBdisplay.innerHTML = '&nbsp;';
distanceMOBdisplay.innerHTML = '&nbsp;';
directionMOBdisplay.innerHTML = '&nbsp;';
locationMOBdisplay.innerHTML = '&nbsp;';
delMOBmarkerButton.disabled = true;
sidebar.close();	// закрыть панель
} // end function MOBclose


function delMOBmarker(){
/* Удаляет текущий маркер MOB
mobMarker это LayerGroup 
*/
let layers = mobMarker.getLayers();
if(layers.length < 3) return; // т.е., там линия и один маркер
mobMarker.removeLayer(currentMOBmarker);
layers = mobMarker.getLayers(); 	// мы не знаем, какой именно маркер был удалён -- текущий мог быть любым
//console.log(layers);
for(let i=layers.length-1; i>=0; i--){ 	// мы не знаем, где там линия
	//if (layers[i] instanceof L.marker) { 	// почему это здесь не работает?
	if (layers[i].options.icon) {
		currentMOBmarker = layers[i]; 	// последний маркер в mobMarker
		currentMOBmarker.feature.properties.current = true;
		//console.log('New currentMOBmarker after del ',currentMOBmarker);
		break;
	}
}
//currentMOBmarker = layers[layers.length-1]; 	// последний маркер в mobMarker, но в layers их же прежнее число
if(layers.length < 3) delMOBmarkerButton.disabled = true; // т.е., там линия и один маркер
sendMOBtoServer(); 	// отдадим данные MOB для передачи на сервер
} // end function delMOBmarker


function sendMOBtoServer(status=true){
/* Кладёт данные MOB в массив, который передаётся на сервер 
mobMarker -- это Leaflet LayerGroup, т.е. там исчерпывающая информация
На сервер оно передаётся путём отсылки delta сообщения в веб-сокет
*/
//console.log("sendMOBtoServer status=",status);
let mobMarkerJSON = mobMarker.toGeoJSON(); 	//
//console.log('Sending to server mobMarkerJSON',mobMarkerJSON);
let delta;
if(status) {
	delta = {
		context: 'vessels.self',
		updates: [
			{
				values: [
					{
						"path": "notifications.mob",
						"value": {
							"method": ["visual", "sound"],
							"state": "emergency",
							"message": "A man overboard!",
							"source": instanceSelf,
							"position": mobMarkerJSON
						},
					}
				],
				timestamp: new Date().toISOString(),
			}
		]
	};
}
else {
	delta = {
		context: 'vessels.self',
		updates: [
			{
				values: [
					{
						"path": "notifications.mob",
						"value": null
					}
				],
				timestamp: new Date().toISOString(),
			}
		]
	};
}

spatialWebSocket.send(JSON.stringify(delta)); 	// отдадим данные MOB для передачи на сервер через глобальный сокет для передачи координат. Он есть, иначе -- нет координат и нет проблем.

//console.log('[sendMOBtoServer] Посадим куку MOB');
mobMarkerJSON = JSON.stringify(mobMarkerJSON);
const expires =  new Date();
expires.setTime(expires.getTime() + (30*24*60*60*1000)); 	// протухнет через месяц
document.cookie = "GaladrielMapMOB="+mobMarkerJSON+"; expires="+expires+"; path=/; samesite=Lax"; 	// 
} // end function sendMOBtoServer

function restoreDisplayedRoutes(){
// Восстановим показываемые маршруты и заодно согласуем списки routeList и routeDisplayed
if(SelectedRoutesSwitch.checked) {
	let showRoutes = JSON.parse(getCookie('GaladrielRoutes')); 	// getCookie from galadrielmap.js
	if(showRoutes) {
		showRoutes.forEach(
			function(layerName){ 	// 
				// однако же, возможно повторение id, раз он имя файла? Получение всех li, содержащих строку.
				//const routeListLi = [... document.querySelectorAll('#routeList > li')].filter(el => el.textContent.includes(layerName));
				const routeListLi = [... routeList.querySelectorAll('li')].filter(el => el.textContent.includes(layerName));
				if(routeListLi.length) { 	// объект с этим именем есть в списке routeList
					const routeDisplayedLi = [... routeDisplayed.querySelectorAll('li')].filter(el => el.textContent.includes(layerName));
					if(routeDisplayedLi.length) { 	// этот объект уже есть в списке routeDisplayed, т.е., маршрут показывается
						routeListLi[0].remove();	// удалим его из routeList
						routeListLi[0] = null;
					}
					else {	// иначе выберем объект, т.е., покажем маршрут
						selectTrack(routeListLi[0],routeList,routeDisplayed,displayRoute)
					}
				}	// 	если нет -- и ладно
			}
		);
	}
}
} // end function restoreDisplayedRoutes

function chkDisplayedTracks(){
// Проверим соответствие списков trackList и trackDisplayed
trackDisplayed.querySelectorAll('li').forEach(li => {	// 
	const str = li.innerText.trim();
	const trackListLi = [... trackList.querySelectorAll('li')].filter(el => el.textContent.includes(str));
	if(trackListLi.length) { 	// объект с этим именем есть в списке trackList
		trackListLi[0].remove();
		trackListLi[0] = null;
	}
});

} // end function chkDisplayedTracks

function stopCurrentTrackUpdate(){
// остановим слежение за треком, если не указано "Текущий трек всегда показывается"
// и если текущего трека нет в числе показываемых
let ret = false;
if(!currTrackSwitch.checked && !trackDisplayed.querySelector('li[class*="currentTrackName"]')){
	console.log('[stopCurrentTrackUpdate] Current track update stopped');
	clearInterval(currentTrackUpdateProcess);	
	currentTrackUpdateProcess = null;
	ret = true;
}
return ret;
} // end function stopCurrentTrackUpdate

function startCurrentTrackUpdate(){
// загрузим трек и запустим слежение за треком, 
// если указано "текущий трек всегда показывается" (currTrackSwitch)
// или текущий трек в числе показываемых
// или включена запись трека (loggingSwitch)
let ret = false;
if(loggingSwitch.checked || currTrackSwitch.checked || trackDisplayed.querySelector('li[class*="currentTrackName"]')) {
	if(!currentTrackUpdateProcess) {
		currentTrackUpdateProcess =  setInterval(currentTrackUpdate,3000);	// запустим слежение за логом, если ещё не
		console.log('[startCurrentTrackUpdate] Current track update started');
		ret = true;
	}
}
return ret;
} // end function startCurrentTrackUpdate

function currentTrackUpdate(){
// загружает трек, делает его показываемым и обновляет по мере записи
// Global: map, savedLayers, currentTrackName, currentTrackShowedFlag
// DOM objects: currTrackSwitch, loggingSwitch, trackDisplayed

//console.log('[currentTrackUpdateProcess] currentTrackName='+currentTrackName,'currentTrackShowedFlag=',currentTrackShowedFlag);
if(currentTrackName) { 
	if(currTrackSwitch.checked || trackDisplayed.querySelector('li[class*="currentTrackName"]')) {	// трек надо загрузить и показать
		if(currentTrackShowedFlag !== false) { 	// Текущий трек некогда был загружен или сейчас загружается
			if(map.hasLayer(savedLayers[currentTrackName])) { 	// если он реально есть
				if(typeof loggingSwitch === 'undefined'){ 	// обновлялка не сконфигурирована
					updateCurrTrack(); 	//  - обновим,  galadrielmap.js
				}
				else {
					if(loggingSwitch) updateCurrTrack(); 	//  - обновим  galadrielmap.js
				}
				currentTrackShowedFlag = true;
			}
			else { 
				if(currentTrackShowedFlag != 'loading') currentTrackShowedFlag = false;
			}
		}
		else { 	// текущий трек ещё не был загружен
			//console.log(document.getElementById(currentTrackName));
			//console.log('[currentTrackUpdateProcess] currentTrackName=',currentTrackName,tracks.querySelector('li[class*="currentTrackName"]'));
			currentTrackShowedFlag = 'loading'; 	// укажем, что трек сейчас загружается
			// Опасаемся неуникальных Element Id, ведь Id -- это имя файла
			selectTrack(tracks.querySelector('li[class*="currentTrackName"]'),trackList,trackDisplayed,displayTrack); 	// загрузим трек асинхронно. galadrielmap.js
			// однако, поиск по классу ненадёжен и сулит чудеса
			//selectTrack(document.getElementById(currentTrackName),trackList,trackDisplayed,displayTrack); 	// загрузим трек асинхронно. galadrielmap.js
		}
	}
	else {	// надо только проверить, идёт ли запись
		loggingCheck();
	}
}
else loggingCheck();
} // end function currentTrackUpdate


function bearing(latlng1, latlng2) {
/* азимут направления между двумя точками */
//console.log(latlng1,latlng2)
const rad = Math.PI/180;
let lat1 = latlng1.lat * rad,
lat2 = latlng2.lat * rad,
lon1 = latlng1.lng * rad,
lon2 = latlng2.lng * rad;
//console.log('lat1=',lat1,'lat2=',lat2,'lon1=',lon1,'lon2=',lon2)

let y = Math.sin(lon2 - lon1) * Math.cos(lat2);
let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
//console.log('x',x,'y',y)

let bearing = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
if(bearing >= 360) bearing = bearing-360;

return bearing;
} // end function bearing

function generateUUID() { 
// Public Domain/MIT https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
// мне пофигу их соображеия о "небезопасности", ибо они вне контекста
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function getSelfPathC(path=''){
// Получает с сервера path, синхронно
// возвращает объект или атом
path = path.replace(/\./g,'/');
let res=null;
const xhr = new XMLHttpRequest();
xhr.open('GET', '/signalk/v1/api/vessels/self/'+path, false); 	// Подготовим синхронный запрос
xhr.send();
if (xhr.status == 200) { 	// Успешно
	try {
		res = JSON.parse(xhr.responseText); 	// 
	}
	catch(err) { 	// 
		console.error('Get path '+path+' error:',err.message);
	}
}
return res;
} // end function getSelfPathC




function realtime(dataUrl,fUpdate,upData) {
/*
fUpdate - функция обновления. Все должно делаться в ней. Получает json object
upData - данные для отправки
*/
//console.log(dataUrl);
//console.log('RealTime upData',upData);
if(upData) {
	if(dataUrl.includes('?')) dataUrl += '&upData=';
	else dataUrl += '?upData=';
	dataUrl += encodeURI(JSON.stringify(upData));
}
fetch(dataUrl)
.then((response) => {
    return response.text();
})
.then(data => { 		// The Body mixin of the Fetch API represents the body of the response/request, allowing you to declare what its content type is and how it should be handled.
	try {
		//console.log(data);
		return JSON.parse(data);
	}
	catch(err) {
		// error handling
		//console.log(err);
		throw Error(err.message); 	// просто сбросим ошибку ближайшему catch
	}
})
.then(data => {
	//console.log('RealTime inbound data',data);
	for (let prop in upData) {  	// очистим передаваемые данные, раз сеанс связи состоялся
		delete upData[prop];
	}
	fUpdate(data);
})
.catch( (err) => {
	fUpdate({'error':err.message});
})

} 	// end function realtime



/* Определения классов */
// control для копирования в клипбоард
L.Control.CopyToClipboard = L.Control.extend({
	onAdd: function(map) {
			var div = L.DomUtil.create('div','CopyToClipboardClass');
			div.innerHTML = `
				<span id='copyToClipboardMessage' onClick='doCopyToClipboard()'></span>
				<input id='copyToClipboardField' type='text'  size='12' >
			`;
			return div;
		},
	onRemove: function(map) {
		// Nothing to do here
		}
});

// Функции для отладки предупреждения о столкновениях
function displayCollisionAreas(){
//
const uri = '/collision-detector/allvessels';
fetch(uri)
.then((response) => {
	//console.log(response.text());
    return response.json();
})
.then(data => {
	//console.log('[displayCollisionAreas] data:',data);
	//collisisonAreas.remove();	// так гораздо медленней
	collisisonAreas.clearLayers();	// очистим слой 
	//collisionVessels = {};
	for(let vessel in data){
		//console.log(vessel,data[vessel]);
		if(!data[vessel].collisionArea) continue;	// 
		let polyline = [];
		data[vessel].collisionArea.forEach(point => {polyline.push([point.latitude,point.longitude]);});
		polyline.push([data[vessel].collisionArea[0].latitude,data[vessel].collisionArea[0].longitude]);
		//console.log('vessel',vessel,'course=',data[vessel].course,'polyline:',polyline.length);
		collisisonAreas.addLayer(L.polyline(polyline,{color: 'red',weight: 2,}));
		collisionVessels[vessel] = data[vessel];
	};
	collisisonAreas.addTo(map);
});
} // end function displayCollisionAreas

function displayCollisionDetections(){
//
const uri = '/collision-detector/collisions';
fetch(uri)
.then((response) => {
	//console.log(response.text());
    return response.json();
})
.then(data => {
	//console.log('collisions:',data.length);
	collisisonDetected.clearLayers();	// очистим слой 
	data.forEach(vessel => {
		if(collisionVessels[vessel]){
			let polyline = [
				[collisionVessels[vessel].squareArea.topLeft.latitude,collisionVessels[vessel].squareArea.topLeft.longitude],
				[collisionVessels[vessel].squareArea.bottomRight.latitude,collisionVessels[vessel].squareArea.topLeft.longitude],
				[collisionVessels[vessel].squareArea.bottomRight.latitude,collisionVessels[vessel].squareArea.bottomRight.longitude],
				[collisionVessels[vessel].squareArea.topLeft.latitude,collisionVessels[vessel].squareArea.bottomRight.longitude],
				[collisionVessels[vessel].squareArea.topLeft.latitude,collisionVessels[vessel].squareArea.topLeft.longitude],
			];
			collisisonDetected.addLayer(L.polyline(polyline,{color: 'green',weight: 1,}));
		}
	});
	//collisisonDetected.addTo(map);
});

} // end function displayCollisionDetections




