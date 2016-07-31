var jobs=[]


function scrape(job) {
	console.log(['SCRAPE',job]);
	var sent=false;
	if (job.scrape && job.scrape.length==3) {
		console.log(['SCRAPE have params']);
		var parent=document.querySelector(job.scrape[1]);
		if (parent!=null) { 
			console.log(['SCRAPE have parent',parent]);
			console.log(['SCRAPE search parent for kids matching ',job.scrape[2]]);
			var children=parent.querySelectorAll(job.scrape[2]);
			var childValues=[];
			for (var i=0; i < children.length; i++) {
				childValues.push(children[i].innerHTML);
			}
			var myResponse = {};
			myResponse[job.scrape[0]]=childValues;
			console.log(['CS sending back scrape results',childValues]);
			var sent=true;
			chrome.runtime.sendMessage({type:'scrape', response: myResponse}, function(response) {
				console.log(['CS sent back scrape results']);
			});
		}
	}
	if (!sent)  {
		chrome.runtime.sendMessage({type:'scrape', response: null}, function(response) {
			console.log(['CS sent back scrape results']);
		});
	}
}

function scrapeAndNext(request) {
	console.log('SCRAPE AND NEXT',request);
	if (request.job !=null && request.job.expect != null) {
		console.log(['SCRAPE AND NEXT have expect']);
		var expect=document.querySelector(request.job.expect);
		console.log('expect',expect);
		if (expect != null && expect.textContent != null && expect.textContent.length>0) {
			console.log('SCRAPE AND NEXT expect has content ',expect.textContent);
			scrape(request.job);
		} else {
			console.log('SCRAPE AND NEXT fail expect');
			// FAIL expectation
			chrome.runtime.sendMessage({type:'fail', response: 'Failed to meet expectation'}, function(response) {
				console.log(['CS sent back fail']);
			});
		}
	} else {
		console.log('SCRAPE AND NEXT no expect now scrape ');
		scrape(request.job);
	}
}

function runActionsForJob(job) {
	console.log('HANDLE JOB ',job);
	if (job.actions != null) {
		// catch submission resulting from actions and notify the bg page 
		var submit = function(event) {
			chrome.runtime.sendMessage({type:'submission'}, function(response) {
				console.log(['CS sent back submission']);
			});
		}
		window.addEventListener('beforeunload', submit);
		console.log('SCRIPT EXEC ',job.actions);
		for (var i=0; i < job.actions.length; i++) {
			// handle actions - click 
			// TODO - fillField, selectValue, check, submits
			if (job.actions[i][0]=='click') {
				console.log('click '+job.actions[i][1]);
				if (document.querySelector(job.actions[i][1]) != null) {
					document.querySelector(job.actions[i][1]).click();
				}
			}
		}
		window.removeEventListener('beforeunload',submit);
	}
	
}

// ONMESSAGE
// content script accepts start messages
// a job parameter is passed with the request
// RUN the action steps associated with the job
// if the job.nosubmit=true, scrape and send back the results (including error if job.expect fails)
chrome.runtime.onMessage.addListener( 
	function(request, sender, sendResponse) {
		try {
			console.log('SCRIPT  ',request, sender, sendResponse);
			if (request.type="start" && request.job !=null) {
				runActionsForJob(request.job);
				// query for current job and check if it has already been posted
				chrome.runtime.sendMessage({type: 'job'}, function(response) {
					console.log(['GOT BACK JOB after actions',response]);
					if (response !=null && response.job != null) {
						// if not posted, scrape and send now
						if (!response.job.submitted) {
							scrapeAndNext(response);
						}
					}
				});
			}
		} catch (e) {
			console.log(e);
		}
	}
);


// ONLOAD
// check for jobs when page loads
// if there is a current job, scrape for it and return the results (or error if job.expect fails)
chrome.runtime.sendMessage({type: 'job'}, function(response) {
	try {
		if (response !=null && response.job != null) {
			console.log(['GOT BACK JOB',response]);
			scrapeAndNext(response);
		} else {
			console.log(['NO JOB AVAILABLE',response]);
		
		}
	} catch (e) {
		console.log(e);
	}
});
  
  
  
 //alert(window.location.hostname);
/*
if (window.location.hostname.includes('anz.com')) {
	// wait for page to finish load and render (angular)
	setTimeout(function() {
		console.log('timeout');
		// switch on page header
		var accountsHeader=document.getElementById('Youraccounts');
		var accountDetailsHeader=document.getElementById('Accountoverview');
		//console.log(['aa',accountsHeader,accountDetailsHeader]);
		// ACCOUNTS LIST
		if (accountsHeader && accountsHeader.textContent.length>0)  {
			var accounts=document.getElementById('normalLayout').querySelectorAll('.listViewAccountWrapperYourAccounts');
			var scraped=[];
			for (var a = 0; a < accounts.length; a++) {
				//console.log('----------------------------------------');
				//console.log(accounts[a].innerHTML);
				scraped.push({
					'name':accounts[a].querySelector('.accountNameSection')? accounts[a].querySelector('.accountNameSection').textContent.trim() : '',
					'number':accounts[a].querySelector('.accountNoSection') ? accounts[a].querySelector('.accountNoSection').textContent.trim() : '',
					'balance':accounts[a].querySelector('.currentBalTD') ? accounts[a].querySelector('.currentBalTD').textContent.trim() : ''
				});
			}
			//console.log(scraped);
			chrome.runtime.sendMessage({scraped: scraped}, function(response) {
				console.log(['BG RESP',response]);
			});
		// TRANSACTIONS LIST
		} else if (accountDetailsHeader && accountDetailsHeader.textContent.length>0)  {
			// switch on normal account vs credit card
			var transactionBlock='';
			if (document.getElementById('content-txn-hist-id') != null) {
				transactionBlock=document.getElementById('content-txn-hist-id');
			} else {
				console.log(['FF',document.getElementById('mainContent')]);
				console.log(['FF',document.getElementById('mainContent').parentNode]);
				console.log(['FF',document.getElementById('mainContent').parentNode.querySelector('.tabsContainerCC')]);
				//var transactionBlock=document.getElementById('mainContent').querySelectorAll('.tabsContainerCC')[0];
				transactionBlock=document.getElementById('mainContent').parentNode.querySelector('.tabsContainerCC');
			}
			//console.log(transactionBlock);
			if (transactionBlock)  {
				var txn=transactionBlock.querySelectorAll('.displayTable');
				
				var scraped=[];
				for (var i = 0, len = txn.length; i < len; i++) {
					scraped.push({
						'date':txn[i].querySelector('.dateNMonthSection') ? txn[i].querySelector('.dateNMonthSection').textContent.trim() : '',
						// cc vs normal account
						'description':txn[i].querySelector('.tran-desc-div-stmts') ? txn[i].querySelector('.tran-desc-div-stmts').textContent.trim() : (txn[i].querySelector('.tran-desc-div') ? txn[i].querySelector('.tran-desc-div').textContent.trim() : ''),
						'amount':txn[i].querySelector('.tran-amount-div') ? txn[i].querySelector('.tran-amount-div').textContent.trim() : '',
						'balance': txn[i].querySelector('.tran-balance-div') ? txn[i].querySelector('.tran-balance-div').textContent.trim() : ''
					});
				}
				//console.log(scraped);
				chrome.runtime.sendMessage({scraped: scraped}, function(response) {
					console.log(['BG RESP',response]);
				});
			// OTHER
			} else {
				console.log('other');
			}
		}
	},15000);
	//[0].querySelector('.accountNavLink').click();
		//setTimeout(function() {
			//scraped=[];
			
		//},10000);
	
	
	
	
	
//	alert('anz');
	// wait for page load
	
	//document.addEventListener('onload', function () {
		//alert('anz after wait');
		//document.getElementById('crn').value='sdfasdf';
	//});
	
	//setTimeout(function() {
		//alert('anz after wait');
		//// trigger content ??
		//document.getElementById('crn').value='';
		//console.log([document.getElementById('Password'), document.getElementById('crn')]);
		//if (document.getElementById('Password') != null && document.getElementById('crn')!=null) {
			//document.getElementById('crn').value='266783351';
			//document.getElementById('Password').value='thuiespasdfasdf';
		//}
	//},15000);
	////var pw=prompt('Password?');
	//.value=pw;
	//
	//document.getElementById('SignonButton').click();

}
*/
/*
window.location='https://www.anz.com/INETBANK/login.asp';
setTimeout(function() {
	
	setTimeout(function() {
			
	},15000);
},10000);

 * */

