
console.log('popup loaded');
document.addEventListener('DOMContentLoaded', function() {
	var jobs=[];

	console.log('content loaded');

	document.getElementById('storagebutton').onclick=function() {
		console.log('click storage');
		chrome.runtime.sendMessage({type:'dump',}, function(response) {
			console.log(['sent dump request',response]);
		});
		//chrome.storage.local.get(null, function(res) {
			  //// Notify that we saved.
			  //console.log('Data loaded',res);
			//});
	}
	document.getElementById('scrapebutton').onclick=function() {
		// add job
		console.log('Adding jobs ');
		// home
		//jobs.push({actions: [['click','#header .brand a']], expect:'#container_header', scrape: ['news','.module-body','.module-body > ol > li']});
		// just in
		//jobs.push({actions: [['click','#n-justin a']], expect:'.article-index', scrape: ['newsjustin','.article-index','li']});
		jobs=[];
		jobs.push({actions: [['click','#header .brand a']], expect:'#container_header'});
		jobs.push({actions: [['click','.weather-details-link']], expect:'#weather_details', scrape: ['weather','#weather_details','.forecast li .weather-forecast-description']});
		jobs.push({actions: [['click','#n-justin a']], expect:'.article-index', scrape: ['newsjustin','.article-index','li']});
		console.log(jobs);
		
		// send to bg script
		chrome.runtime.sendMessage({type:'queue', jobs: jobs}, function(response) {
			console.log(['popup queued jobs']);
		});
	};
});
