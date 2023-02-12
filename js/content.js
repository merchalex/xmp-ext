let data={},cssDisabled=false,interval;
const showError=()=>{
	$("#xmp-ext-error").remove();
	$('body').prepend(`
		<div id="xmp-ext-error" style="width:300px;border-radius:10px;text-align:center:height:200px;background:red;position:fixed;z-index:123456789;">
		  <h1 style="color:white">No xmp found</h1>
		  <button id="hide-xmp-error">Hide</button>
		</div>
	`)
}
const checkAndDownloadXmp=(imageUrl,defaultName)=>{
	xmpEditor.helpers.urlToArrayBuffer(imageUrl).then(function(aryBufer){
       let xmp=xmpEditor.jpgReadXmp(aryBufer),
           imgName=window.location.hostname;
       if(imgName.split(".").length>1){
       	let tary=imgName.split(".");
       	tary.pop();
       	imgName=tary.join(" - ");
       }
       imgName=imgName+" - ";
       if(xmp){
       	let splitXmp=xmp.split('</crs:HasSettings>');
       	//okay
       	if(defaultName) imgName=imgName+defaultName.substr(0,defaultName.lastIndexOf('.jpg')+1);
       	if(imgName.charAt(imgName.length-1)=='.') imgName = imgName.substring(0,imgName.length-1)
       	if(splitXmp.length>1) xmp=`${splitXmp[0]}</crs:HasSettings>
				<crs:Name>
				<rdf:Alt>
				<rdf:li xml:lang="x-default">${imgName}</rdf:li>
				</rdf:Alt>
				</crs:Name>
				<crs:ShortName>
				<rdf:Alt>
				<rdf:li xml:lang="x-default"/>
				</rdf:Alt>
				</crs:ShortName>
				<crs:SortName>
				<rdf:Alt>
				<rdf:li xml:lang="x-default"/>
				</rdf:Alt>
				</crs:SortName>
				<crs:Group>
				<rdf:Alt>
				<rdf:li xml:lang="x-default">PresetNinja</rdf:li>
				</rdf:Alt>
				</crs:Group>
				<crs:Description>
				<rdf:Alt>
				<rdf:li xml:lang="x-default"/>
				</rdf:Alt>
				</crs:Description> ${splitXmp[1]}`;
       	if(data.junk){
       		xmp=xmp.replace(/<crs:LensProfileEnable\>(.*?)<\/crs:LensProfileEnable\>/g,"");
       	    xmp=xmp.replace(/<crs:LensManualDistortionAmount>(.*?)<\/crs:LensManualDistortionAmount>/g,"");
       	    xmp=xmp.replace(/<crs:Temperature>(.*?)<\/crs:Temperature>/g,"");
       	    xmp=xmp.replace(/<crs:Tint>(.*?)<\/crs:Tint>/g,"");
       	    xmp=xmp.replace(/<crs:WhiteBalance>(.*?)<\/crs:WhiteBalance>/g,"");
       	    xmp=xmp.replace(/<crs:VignetteAmount>(.*?)<\/crs:VignetteAmount>/g,"");
       	}
       	  var blob = new Blob([xmp], {type: "text/xmp;charset=utf-8"});
          saveAs(blob, imgName+".xmp");
       }else{
       	showError();
       }
    }).catch((err)=>{
    	showError();
    })
}
const checkForActiveRightClickImage=()=>{
	let imageUrl=$(`[xmp-right-click='true']`).attr("src");
	if(imageUrl){
		let imageName=imageUrl.substring(imageUrl.lastIndexOf('/')+1);
		checkAndDownloadXmp(imageUrl,imageName);
	}
}
const unlinkCss=()=>{
	cssDisabled=true;
	let sheets=document.styleSheets;
    for(let i=0;i<sheets.length;i++){
        let sheet=sheets[i];
        if(sheet) sheet.disabled=cssDisabled;
    }
}
const allowCss=()=>{
	cssDisabled=false;
	let sheets=document.styleSheets;
    for(let i=0;i<sheets.length;i++){
    	let sheet=sheets[i];
        if(sheet) sheet.disabled=cssDisabled;
    }
}
const displayGreenButton=(img)=>{
	$("#ext-emp-download,#ext-emp-error").remove();
	let left= img.get(0).getBoundingClientRect().left+10,
        top= img.get(0).getBoundingClientRect().top+10;
	$('body').prepend(`
		<img id="ext-emp-download" src="${chrome.runtime.getURL("img/green.png")}" style="width:45px;height:45px;position:fixed;z-index:123456789;border-radius:20px;margin-top:${top}px;left:${left}px">
	`)
}
const displayRedButton=(img)=>{
	$("#ext-emp-download,#ext-emp-error").remove();
	let left= img.get(0).getBoundingClientRect().left+10,
        top= img.get(0).getBoundingClientRect().top+30;
	$('body').prepend(`
		<img id="ext-emp-error" src="${chrome.runtime.getURL("img/red.png")}" style="width:45px;height:45px;position:fixed;z-index:123456789;border-radius:20px;margin-top:${top}px;left:${left}px">
	`)
}
const highZindex=()=>{
	$("img").each(function(){
		if($(this).width()>100 && $(this).attr("src") && !$(this).hasClass('xmp-ext-zindex')) $(this).addClass("xmp-ext-zindex");
	})
}
const addHigherZindex=()=>{
	if(interval) clearInterval(interval);
	if(data.on && data.zindex){
		highZindex();
	    interval=setInterval(highZindex,2000);
	}else{
		$(".xmp-ext-zindex").removeClass('xmp-ext-zindex');
	}
}

$(document).on("mouseover","img",function(){
	let src=$(this).attr("src"),
	    img=$(this),
	    imgWidth=img.width(),
	    imgHeight=img.height();
	if(data.on && src && src.indexOf(".svg")==-1 && imgWidth>100 && imgHeight>100){
		if($(this).attr("ext-xmp")){
			if($(this).attr("ext-xmp")=="yes"){
				displayGreenButton(img);
			}else{
				displayRedButton(img);
			}
		}else{
			xmpEditor.helpers.urlToArrayBuffer(src).then(function(aryBufer){
				let xmp=xmpEditor.jpgReadXmp(aryBufer),
                    imgName="xmp-ext-file";
                if(xmp && xmp.indexOf("<crs:HasSettings>True</crs:HasSettings>")!=-1){
                	img.attr("ext-xmp","yes").attr("src",src);
                	displayGreenButton(img);
                }else{
       	          img.attr("ext-xmp","no");
       	          displayRedButton(img);
                }
            }).catch((err)=>{
    	        img.attr("ext-xmp","no");
    	        displayRedButton(img);
            })
		}
	}
})
$(document).on("mouseout","img",function(){
	$("#ext-emp-download,#ext-emp-error").remove();
})
document.addEventListener("contextmenu",function(event){
	if(data.rightClick){
		event.returnValue = true;
		event.stopPropagation && event.stopPropagation();
	}
	$("[xmp-right-click='true']").removeAttr("xmp-right-click");
	$(event.target).attr("xmp-right-click","true");
}, true);
chrome.runtime.onMessage.addListener((req,res,reply)=>{
	if(req.msg=="check-and-download-xmp"){
		checkForActiveRightClickImage()
	}else
	if(req.msg=="unlink-css"){
		unlinkCss();
	}else
	if(req.msg=="relink-css"){
		allowCss();
	}else
	if(req.msg=="updates"){
		data=req.data;
		if(!data.on){
			allowCss();
		}
		addHigherZindex();
	}else
	if(req.msg=="css-status"){
		reply(cssDisabled);
	}
})
$(document).on("click","#hide-xmp-error",function(){
	$("#xmp-ext-error").remove();
})

window.onload=()=>{
	chrome.runtime.sendMessage({msg:"get-data"},(res)=>{
		if(res.login && res.premium && res.on){
			data=res;
			if(res.zindex) addHigherZindex();
		}
		let url=window.location.href;
		if(url.indexOf("https://presetninja.com/settings/profile")!=-1 && !res.login) chrome.runtime.sendMessage({msg:"check-premium"});
	    if(url=="https://presetninja.com/" || url=="https://presetninja.com") chrome.runtime.sendMessage({msg:"check-premium"});
	})
}
