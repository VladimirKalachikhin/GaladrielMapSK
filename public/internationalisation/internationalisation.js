var dashboardDepthMesTXT, 
dashboardMeterMesTXT, 
dashboardKiloMeterMesTXT,
latTXT, 
longTXT, 
copyToClipboardMessageOkTXT, 
copyToClipboardMessageBadTXT,
AISstatusTXT = {},
AISshipTypeTXT = {},
relBearingTXT,
showMapsTogglerTXT,
versionTXT;
var i18n;

function internalisationApply() {
//
let i18nFileName = navigator.language.split(',',1)[0].split(';',1)[0].split('-',1)[0].toLowerCase()+'.json';	// хотя она и так должна быть LowerCase, но то должна.
i18nFileName = 'fi.json';
//console.log('internationalisation.js [internalisationApply] i18nFileName=',i18nFileName,navigator.language);

let xhr = new XMLHttpRequest();
xhr.open('GET', '/plugins/galadrielmap_sk/', false); 	// оно не успевает к нужному, поэтому синхронно
xhr.send();
if (xhr.status == 200) { 	// Успешно
	try {
		let data = JSON.parse(xhr.responseText); 	// 
		versionTXT = data.version;	// глобальная переменная
		document.title = 'GaladrielMap SignalK edition '+versionTXT;
	}
	catch(err) { 	// а ваще облом, ибо нефиг
	}
}
/* 
fetch('/plugins/galadrielmap_sk/').then(response => response.json()).then(data => {
	versionTXT = data.version;	// глобальная переменная
	document.title = 'GaladrielMap SignalK edition '+versionTXT;
}).catch((error) => {
	console.error('Get version Error:', error);
});
*/
// Глобальные подписи, которые где-то используются. Неизвестно уже, где
i18n = getI18nData(i18nFileName);
if(!i18n) {
	console.log('No localisation data, trying to use default.');
	i18n = getI18nData('en.json');
}
if(i18n){
	({	dashboardDepthMesTXT, 
		dashboardMeterMesTXT, 
		dashboardKiloMeterMesTXT,
		latTXT, 
		longTXT, 
		copyToClipboardMessageOkTXT, 
		copyToClipboardMessageBadTXT,
		AISstatusTXT,
		AISshipTypeTXT,
		relBearingTXT,
		showMapsTogglerTXT
	} = i18n);	// () тут обязательно, потому что не var {} = obj;
	//console.log(i18n);

	const inputPlaceholders = {
	 	routeSaveName : i18n.routeSaveTXT,
	 	goToPositionField : i18n.goToPositionTXT,
	 	routeSaveDescr : i18n.routeSaveDescrTXT,
	 	editableObjectName : i18n.routeSaveTXT,
	 	editableObjectDescr : i18n.editableObjectDescrTXT
	};
	 	
	const inputTitle = {
	 	routeSaveName : i18n.routeSaveTXT,
	 	goToPositionField : i18n.goToPositionTXT,
	 	routeSaveDescr : i18n.routeSaveDescrTXT,
	 	minWATCHintervalInput : i18n.realTXT,
	 	editableObjectName : i18n.routeSaveTXT,
	 	editableObjectDescr : i18n.editableObjectDescrTXT
	};
	
	for(let DOMid in i18n.stringsandliterals){
		//console.log('DOMid=',DOMid);
		try {
			document.getElementById(DOMid).innerHTML = i18n.stringsandliterals[DOMid];
		}
		catch(error){
			// там теперь есть дополнительые строки, для которых нет соответствующих объектов
			//console.log('WARNING: No such element: '+DOMid+'\t', error);
		};
	};
	for(let DOMid in inputPlaceholders){
		try {
			document.getElementById(DOMid).placeholder = inputPlaceholders[DOMid];
		}
		catch(error){
			console.log('WARNING: No such element: '+DOMid+'\t', error);
		};
	};
	for(let DOMid in inputTitle){
		try {
			document.getElementById(DOMid).title = inputTitle[DOMid];
		}
		catch(error){
			console.log('WARNING: No such element: '+DOMid+'\t', error);
		};
	};
};

function getI18nData(i18nFileName){
//fetch('internationalisation/'+i18nFileName).then(response => response.json()).then(data => {
//}).catch((error) => {
//	console.error('Get localisation strings Error:', error);
//});
xhr = new XMLHttpRequest();
xhr.open('GET', 'internationalisation/'+i18nFileName, false); 	// оно не успевает к нужному, поэтому синхронно
xhr.send();
if (xhr.status == 200) { 	// Успешно
	let data;
	try {
		data = JSON.parse(xhr.responseText); 	// 
	}
	catch(error) {
		console.error('Get localisation strings Error:', error);
		return;
	};
	//console.log('[getI18nData] data:',data);
	return data;
};
console.log('Get localisation file Error:', xhr.statusText);
return;
};		// end function getI18nData
}; // end function internalisationApply
