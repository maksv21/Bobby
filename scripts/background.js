//on click on icon
chrome.browserAction.onClicked.addListener(function (tab) {
   window.open('../index.html')
});

//Чтобы установленный шрифт заработал нужно перезагрузить расширение
if(localStorage.getItem('fv-reload')) {
	window.open('../index.html');
}