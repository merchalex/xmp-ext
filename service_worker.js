let schema={
    login:"",
    premium:false,
    junk:true,
    zindex:true,
    rightClick:true,
    on:true
}
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason=="install"){
        chrome.tabs.create({url:chrome.runtime.getURL('html/welcome.html')})
    }
    chrome.contextMenus.create({
    title:"Download preset",
    id:"xmp-ext-menu",
    contexts:['image'],
    documentUrlPatterns:["<all_urls>"]
    },(parentContext)=>{});
    checkLoginAndPremium();
    chrome.storage.local.get(['xmp'],(result)=>{
        if(!result || !result.xmp){
            chrome.storage.local.set({xmp:schema});
        }
    });
 });
chrome.contextMenus.onClicked.addListener((info,tab)=>{
    chrome.tabs.sendMessage(tab.id,{msg:"check-and-download-xmp"});
});
chrome.runtime.onMessage.addListener(function(req,res,reply){
    if(req.msg=="get-data"){
        chrome.storage.local.get(['xmp'],(result)=>{
            let data={};
            if(result && result.xmp) data=result.xmp;
            reply(data)
        });
    }else
    if(req.msg=="check-premium"){
        checkLoginAndPremium();
    }
    return true;
})
let interval;
const checkIfValid=(str)=>{
	let valid;
	if(str){
		let possible=['Pro','Admin'];
		for(let i=0;i<possible.length;i++){
			if(str.indexOf(possible[i])!=-1){
				valid=true;
				break;
			}
		}
	}
	return valid;
}
const checkLogin=()=>{
    fetch("https://presetninja.com/settings/profile").then(res=>res.text()).then((res)=>{
        chrome.storage.local.get(['xmp'],(result)=>{
            let data=schema;
            if(result && result.xmp) data=result.xmp;
            if(res && res.split('id="status">') && res.split('id="status">')[1]){
                data.login=true;

              if(checkIfValid(res.split('id="status">')[1].split('</span>')[0])){
                    data.premium=true;
                }else{
                    data.premium=false;
                }
            }else{
                data.login=false;
                data.premium=false;
            }
            chrome.storage.local.set({xmp:data});
            if(data.on){
                if(data.login && data.premium){
                  setIcon("on")
                }else
                if(data.login && !data.premium){
                  setIcon("orange")
                }else{
                  setIcon("black")
                }
            }
        });
    })
}
const checkLoginAndPremium=()=>{
    if(interval) clearInterval(interval);
    checkLogin();
    interval=setInterval(()=>{
        checkLogin();
    },1000*30*60);
}
const setIcon=(name)=>{
    chrome.action.setIcon({
        path:{
            "16": chrome.runtime.getURL(`/img/${name}.png`),
            "32": chrome.runtime.getURL(`/img/${name}.png`),
        }
    });
}
chrome.windows.onCreated.addListener((currentWindow)=>{
    checkLoginAndPremium();
})
