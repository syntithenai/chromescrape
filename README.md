# Chrome Extension - Scraper

This repository provides an example of web scraping using chrome extension features including  background and content scripts.

A content script is code that can be run in the context of any loaded web page.
It has no script access to the page but full access to the DOM.
Javascript triggers on the DOM can be used to trigger code on the loaded web page.

A background script is the heart of a chrome extension. It registers and responds to events. A button in the chrome address bar.

To install the extension, use the the [chrome extension manager](chrome://extensions) to "Load Unpacked Extension".

At this stage all the action is in the javascript console. The extension manager provides a link to the background page where you can see the JOB COMPLETE log showing the scraped data.



An extension button is enabled for a fixed list of domains. (The extension is currently only enabled for abc.net.au)
Clicking the extension button on an enabled domain triggers a scrape.
A scrape can involve multiple javascript actions contained in multiple jobs.

Each job can specify an expect selector. Where one is set, the selector must include non whitespace textContent or all jobs are cleared.

Each job can specify an array of scrape selectors. At the completion of actions for a job, the scrape selectors are used to extract data from the web page and return it to the background process.

Actions are specified as an array of 2 element arrays.
eg [['click','#header .brand a'],['click','#header .brand b']]
If an action triggers a page load, it must be the last action in the array.

Some actions run javascript triggers that just enabled DOM rendering updates.
The jobs for these actions can be scraped immediately after  after the actions execute.

Some actions run javascript triggers that cause the page to submit.
The scraping associated with the job must run after the page finishes loading.
When a page load is noticed by the content script (using onbeforeunload event), the background script is notified that a submission is pending. When the page finishes loading, the content script onload asks the background for the job and scrapes and returns data.


## Components

Background Page - extension main controller
Extension Button - extension UI
Content Script - injected into remote page for scraping
Web App - for viewing scraped data

## Communication Channels

Chrome extensions provide an API to send messages between tabs.

```
// SEND MESSAGE
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {type:'start',job:jobs[0]}, function(response) {
		console.log('JOB accepted ',response);
	  });
	});
});

// REGISTER AS MESSAGE LISTENER
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

```

EB	--click-->	
	BG [queue jobs]  --start-->	CS

	CS 				BG     
		--job-->
		--scrape-->
		--error-->
		--submission-->


## ??



// for conditional button
	"page_action" : {
		"default_icon" : "assets/images/icon16.png",
		"default_title" : "abc website!"
	},
