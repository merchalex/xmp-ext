let info={},activeTabId;
const displayView=(viewname)=>{
	$('.main-view').hide();
	$(`.main-view[view='${viewname}']`).show();
}
const displaySaved=()=>{
	$("#saved").show();
	setTimeout(function(){
		$("#saved").hide();
	},2000)
}
const enableDisbaleSetting=()=>{
	if(info.on){
		$(".settings").removeClass('disable')
	}else{
		$(".settings").addClass('disable')
	}
}
$(document).on("change","#on",function(){
	info.on=$("#on").prop("checked");
	
	chrome.storage.local.set({xmp:info});
	chrome.tabs.query({},(tabs)=>{
			tabs.forEach((tab)=>{
			  if(tab.url && tab.url.indexOf("http")!=-1){
				  chrome.tabs.sendMessage(tab.id,{msg:"updates",data:info});
			  }
		  })
	})
	assignCheckboxStyle();
	enableDisbaleSetting();
})
$(document).on("change","#right-click,#junk,#style",function(){
	info.on=$("#on").prop("checked");
	if(info.on){
		info.rightClick=$("#right-click").prop("checked");
	    info.junk=$("#junk").prop("checked");
	    info.zindex=$("#style").prop("checked");
	    chrome.storage.local.set({xmp:info});
	    chrome.tabs.query({},(tabs)=>{
			tabs.forEach((tab)=>{
			  if(tab.url && tab.url.indexOf("http")!=-1){
				  chrome.tabs.sendMessage(tab.id,{msg:"updates",data:info});
			  }
		    })
	    })
	    enableDisbaleSetting();
	}
})
$(document).on("click","#disable-css",function(){
	chrome.tabs.query({active:true,currentWindow:true},function(tabs){
		if(tabs[0].id && tabs[0].url && tabs[0].url.indexOf("http")!=-1){
			chrome.tabs.sendMessage(tabs[0].id,{msg:"unlink-css"});
		}
    });
    $(this).hide();
    $("#enable-css").show();
})
$(document).on("click","#enable-css",function(){
	chrome.tabs.query({active:true,currentWindow:true},function(tabs){
		if(tabs[0].id && tabs[0].url && tabs[0].url.indexOf("http")!=-1){
			chrome.tabs.sendMessage(tabs[0].id,{msg:"relink-css"});
		}
    });
    $(this).hide();
    $("#disable-css").show();
})
const assignCheckboxStyle=()=>{
	if(info.on){
	    $("#right-click").prop("checked",info.rightClick);
		$("#junk").prop("checked",info.junk);
		$("#style").prop("checked",info.zindex);
	}else{
		$("#right-click,#junk,#style").prop("checked",false);
	}
}
window.onload=()=>{
	chrome.storage.local.get(['xmp'],(result)=>{
		if(result && result.xmp){
			if(result.xmp.login && result.xmp.premium){
				displayView("home");
				info=result.xmp;
			  $("#on").prop("checked",info.on);
			  assignCheckboxStyle();
			  enableDisbaleSetting();
			}else{
				if(!result.xmp.login){
					displayView("login");
				}else
				if(!result.xmp.premium){
					displayView("payment")
				}
			}
		}else{
			chrome.storage.local.set({xmp:schema});
		}
	});
	displayView('login');
}

chrome.tabs.query({active:true,currentWindow:true},function(tabs){
	if(tabs[0].id && tabs[0].url && tabs[0].url.indexOf("http")!=-1){
		chrome.tabs.sendMessage(tabs[0].id,{msg:"css-status"},(res)=>{
			if(res){
				$("#enable-css").show();
				$("#disable-css").hide();
			}
		});
	}
});

