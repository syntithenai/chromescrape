//// EXTENSION BUTTON VISIBILITY
//chrome.runtime.onInstalled.addListener(function() {
  //chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    //chrome.declarativeContent.onPageChanged.addRules([
      //{
        //conditions: [
          //new chrome.declarativeContent.PageStateMatcher({
            //pageUrl: { urlContains: 'abc.net' },
          //})
        //],
        //actions: [ 
			//new chrome.declarativeContent.ShowPageAction(),
		//]
      //}
    //]);
  //});
//});

// PERSIST SCRAPE
var accounts=[];
var transactions=[];

function addAccount(name,number) {
	accounts[number]=name;
	transactions[number]=[];
}


// JOBS
var jobs=[];
var failed=[];


// EXTENSION BUTTON CLICK
//chrome.pageAction.onClicked.addListener(function(tab) {
	//// add job
	//console.log('Adding jobs to the url ' + tab.url);
	//// home
	////jobs.push({actions: [['click','#header .brand a']], expect:'#container_header', scrape: ['news','.module-body','.module-body > ol > li']});
	//// just in
	////jobs.push({actions: [['click','#n-justin a']], expect:'.article-index', scrape: ['newsjustin','.article-index','li']});
	//jobs.push({actions: [['click','#header .brand a']], expect:'#container_header'});
	//jobs.push({actions: [['click','.weather-details-link']], expect:'#weather_details', scrape: ['weather','#weather_details','.forecast li .weather-forecast-description']});
	//jobs.push({actions: [['click','#n-justin a']], expect:'.article-index', scrape: ['newsjustin','.article-index','li']});
	//console.log(jobs);
	
	//// enact first job
	//// SEND REQUEST TO CONTENT SCRIPT
	//chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  ////var message={hash: tabs[0].id,actions: jobs[0].actions, expect: jobs[0].expect, scrape: jobs[0].scrape}
	  //chrome.tabs.sendMessage(tabs[0].id, {type:'start',job:jobs[0]}, function(response) {
		//console.log('JOB accepted ',response);
	  //});
	//});
//});


// MAIN BACKGROUND BINDING
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(["BG MSG",request, sender, sendResponse]);
		// content script actions has triggered submission, store this against the current job
		if (request.type=="job") {
			console.log(['JOB query ',request]);
			sendResponse({job: jobs[0]});
		// capture scraped data, clear job and send start request to for any more jobs
		} else if (request.type=="queue") {
			//// add job
			console.log('Adding jobs');
			if (request.jobs != null && request.jobs.length>0)  {
				console.log('Have jobs');
				jobs=request.jobs; // append ??
				// enact first job
				// SEND REQUEST TO CONTENT SCRIPT
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				  chrome.tabs.sendMessage(tabs[0].id, {type:'start',job:jobs[0]}, function(response) {
					console.log('JOBs accepted ',response);
				  });
				});
			}
		} else if (request.type=="submission") {
			if (jobs.length>0) {
				jobs[0].submitted=true;
				console.log(['JOB submitted ',request]);
			}
		// content script failed expectations
		} else if (request.type=="fail") {
			console.log(['JOB FAIL ',request]);
			// clear the queue
			jobs=[];
		// request current job 	
		} else if (request.type=="scrape") {
			jobs.shift();
			console.log(['JOB complete',request, sender, sendResponse]);
			console.log('SAVING SCRAPE ',request.response)
			if (request.response != null)  {
				console.log('SAVING SCRAPE have response', request.response);
				chrome.storage.local.set( request.response, function() {
				  // Notify that we saved.
				  console.log('Scrape saved');
				});
			}
			if (jobs.length > 0)  {
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				 // var message={hash: tabs[0].id,actions: jobs[0].actions, expect: jobs[0].expect, scrape: jobs[0].scrape}
				  chrome.tabs.sendMessage(tabs[0].id, {type:'start',job:jobs[0]}, function(response) {
					console.log('NEXT JOB accepted ',response);
				  });
				});
			}
		} else if (request.type=="log") {
			console.log(['LOG',request]);
		} else if (request.type=="dump") {	
			console.log('DUMP');
			chrome.storage.local.get(null, function(res) {
			  // Notify that we saved.
			  console.log('Data loaded',res);
			});
		} else {
			console.log(['JOB invalid',request, sender, sendResponse]);
		}
	}
);
