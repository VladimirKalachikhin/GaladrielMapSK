var dashboardDepthMesTXT, 
dashboardMeterMesTXT, 
latTXT, 
longTXT, 
copyToClipboardMessageOkTXT, 
copyToClipboardMessageBadTXT,
AISstatusTXT = {},
relBearingTXT,
versionTXT;
var i18n;

function internalisationApply() {
//
let i18nFileName;
if(navigator.language.includes('ru')) i18nFileName = 'ru.json';
else i18nFileName = 'en.json';
//i18nFileName = 'en.json';

const xhr = new XMLHttpRequest();
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
fetch('internationalisation/'+i18nFileName).then(response => response.json()).then(data => {
	// Глобальные подписи, которые где-то используются. Неизвестно уже, где
	//console.log(data);
	i18n = data;
	({	dashboardDepthMesTXT, 
		dashboardMeterMesTXT, 
		latTXT, 
		longTXT, 
		copyToClipboardMessageOkTXT, 
		copyToClipboardMessageBadTXT,
		AISstatusTXT,
		relBearingTXT
	} = i18n);	// () тут обязательно, потому что не var {} = obj;
	//console.log(i18n);

	const inputPlaceholders = {
	 	routeSaveName : i18n.routeSaveTXT,
	 	goToPositionField : i18n.goToPositionTXT,
	 	routeSaveDescr : i18n.routeSaveDescrTXT,
	 	editableObjectName : i18n.routeSaveTXT,
	 	editableObjectDescr : i18n.editableObjectDescrTXT
	}
	 	
	const inputTitle = {
	 	routeSaveName : i18n.routeSaveTXT,
	 	goToPositionField : i18n.goToPositionTXT,
	 	routeSaveDescr : i18n.routeSaveDescrTXT,
	 	minWATCHintervalInput : i18n.realTXT,
	 	editableObjectName : i18n.routeSaveTXT,
	 	editableObjectDescr : i18n.editableObjectDescrTXT
	}
	
	for(let DOMid in i18n.stringsandliterals){
		//console.log('DOMid=',DOMid);
		try {
			document.getElementById(DOMid).innerHTML = i18n.stringsandliterals[DOMid];
		}
		catch(error){
			// там теперь есть дополнительые строки, для которых нет соответствующих объектов
			//console.log('WARNING: No such element: '+DOMid+'\t', error);
		}
	}
	for(let DOMid in inputPlaceholders){
		try {
			document.getElementById(DOMid).placeholder = inputPlaceholders[DOMid];
		}
		catch(error){
			console.log('WARNING: No such element: '+DOMid+'\t', error);
		}
	}
	for(let DOMid in inputTitle){
		try {
			document.getElementById(DOMid).title = inputTitle[DOMid];
		}
		catch(error){
			console.log('WARNING: No such element: '+DOMid+'\t', error);
		}
	}
}).catch((error) => {
	console.error('Get localisation strings Error:', error);
});
} // end function internalisationApply
