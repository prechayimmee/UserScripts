// ==UserScript==
// @name         RandomSexyPic
// @namespace    hoothin
// @version      1.3.3
// @description  Random Sexy Pictures
// @author       hoothin
// @include      https://api.lolicon.app/setu/v2*
// @include      https://api.nyan.xyz/httpapi/sexphoto*
// @include      https://huanmengii.xyz/ZY/aCOS/cos*
// @include      https://api.uomg.com/api/rand.img3*
// @include      https://api.vvhan.com/api/tao*
// @include      https://www.hlapi.cn/api/mjx*
// @include      https://3650000.xyz/api/?*
// @icon         data:image/jpg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAgACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAABgcICQX/xAAsEAABAwMEAQIFBQEAAAAAAAABAgMEBQYRAAcSITEIQRMUIjJRIyRCYYHB/8QAFgEBAQEAAAAAAAAAAAAAAAAABgQF/8QAIxEAAgEDBAEFAAAAAAAAAAAAAQMCABESBCFBUQUVMWHB8P/aAAwDAQACEQMRAD8AHNrPQdFYZlXBX6fJuRqns/NhptIUmSodhCG0nsdeCcqOAPOnVLvK3r227YVFjy6OEpLaWavEMKU2cY4utn7eseMjAHeq7vuaxtDs/VnaRSG6nIp9MffjwnMhD7jTKlpQsgZ7KcfnWQFv+sO6d0txKOxcFuw7ibqUpDUmPT4vwnWStQT+ksKJPHOfqB6Hf50Qd4vUOjlKWUj3x8Dik6PIJhO2Nojr7qo6fGtG1YUVNSrcJMl7PAzpjcZtPXkKUQCP+6CNz7Ttq+rdmP1iOKnDhq5iTBd5OMjoFbS0+evbvIGmfbm2dgVrcmq29W4MauJSwWYqpzaHUK4r+ocVAgE9eOzpmVnYaj2zt4qZQ4saOWnlhuBGYRHa+AnyPhoAGcknx3qD05qEiUY2MeR+vWgNeljTAm4l3T6vCDG3k2YffoFQfDdRhplQ5UNYK1j7hxPvyHX+6yhqm3tV2XuqrV2mJpLkpt1TiXFMltb5UMlOBnifOR1351f3owrEmgekbb52mKXVG2qU0ostjms9q5cO++8jGkp6lrQtLca6H7lp8gUCsrBcqESYSxyUPKig/wAseT76ZLcJQBB3omV4zsfapo2gq993nuhR6vUGl01EV/5pNOhO/uJCgfpSpRGG289n+vfV/wBs3LMNoNxn1olzo6HEvSgrkyHVrJWEqx2lOeIPvjU02Kzbe3VBkvPzIkl+SOSni5kke3+f1jXN3i9Vsdi2GqDakOUoBHFElCShAI8qB/GfbUmoeFrMb7mrFJLGAgbCv//Z
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-idle
// @license      MIT
// ==/UserScript==


(function() {
    'use strict';
    var setuConfig={
        "api.lolicon.app":{
            name:"Lolicon ACG SexyPic",
            url:"https://api.lolicon.app/setu/v2?r18=1&num=5",
            run:()=>{
                var searchNum=getSearchParam("num");
                var leftNum=searchNum;
                if(jsonData != "Forbidden"){
                    let datas=jsonData.data;
                    datas.forEach(function(data){
                        leftNum--;
                        let img=createImg(data.urls?data.urls.original:data.url);
                        img.title=data.title+" - "+data.author;
                    });
                }else{
                    location.href=curConfig.url;
                }
                processByTime(leftNum,loadNum=>{
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: curConfig.url.replace("num=5","num="+loadNum),
                        timeout:15000,
                        onload: function(result) {
                            let datas=JSON.parse(result.responseText).data;
                            datas.forEach(function(data){
                                let img=createImg(data.urls?data.urls.original:data.url);
                                img.title=data.title+" - "+data.author;
                            });
                        }
                    });
                },5,1000);
            },
            getSearch:(param)=>{
                return `v2?r18=${param.r18}&num=${param.num}`;
            },
            initSearch:()=>{
                var searchNum=getSearchParam("num");
                var searchR18=getSearchParam("r18");
                numInput.value=searchNum;
                r18Check.checked=searchR18==1||searchR18==2;
                sfwCheck.checked=searchR18==0||searchR18==2;
            }
        },
        "api.nyan.xyz":{
            name:"Nyan ACG SexyPic",
            url:"https://api.nyan.xyz/httpapi/sexphoto/?r18=true&num=5",
            run:()=>{
                var searchNum=getSearchParam("num");
                var leftNum=searchNum;
                var urls=jsonData.data.url;
                if(!urls instanceof Array){
                    urls=[urls];
                }
                urls.forEach(function(data){
                    leftNum--;
                    createImg(data);
                });
                processByTime(leftNum,loadNum=>{
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: curConfig.url.replace("num=5","num="+loadNum),
                        timeout:15000,
                        onload: function(result) {
                            urls=JSON.parse(result.responseText).data.url;
                            urls.forEach(function(data){
                                createImg(data);
                            });
                        }
                    });
                },5,1000);
            },
            getSearch:(param)=>{
                return `?r18=${param.r18!=0?"true":"false"}&num=${param.num}`;
            },
            initSearch:()=>{
                var searchNum=getSearchParam("num");
                var searchR18=getSearchParam("r18");
                numInput.value=searchNum;
                r18Check.checked=searchR18=="true";
                sfwCheck.checked=searchR18=="false";
            }
        },
        "buyersShow":{
            name:"Taobao Buyers Show",
            urls:["https://api.uomg.com/api/rand.img3?format=json&num=15",
                 "https://api.vvhan.com/api/tao?type=json&num=15",
                 "https://www.hlapi.cn/api/mjx1?type=json&num=15"],
            run:()=>{
                r18Check.style.display=sfwCheck.style.display=r18CheckLabel.style.display=sfwCheckLabel.style.display="none";
                var searchNum=getSearchParam("num");
                processByTime(searchNum,loadNum=>{
                    for(let i=0;i<loadNum;i++){
                        createImg(location.href.replace(/1?\?.*/,"?")+"r="+Math.random());
                    }
                },5,1000);
            },
            getSearch:(param)=>{
                return location.href.replace(/\d+$/,"")+param.num;
            },
            initSearch:()=>{
                var searchNum=getSearchParam("num");
                numInput.value=searchNum;
            }
        },
        "huanmengii.xyz":{
            name:"Cosplay Show",
            url:"https://huanmengii.xyz/ZY/aCOS/cos/?type=json&num=15",
            run:()=>{
                r18Check.style.display=sfwCheck.style.display=r18CheckLabel.style.display=sfwCheckLabel.style.display="none";
                var searchNum=getSearchParam("num");
                processByTime(searchNum,loadNum=>{
                    for(let i=0;i<loadNum;i++){
                        createImg("https://huanmengii.xyz/ZY/aCOS/cos/index.php?r="+Math.random());
                    }
                },5,1000);
            },
            getSearch:(param)=>{
                return "?type=json&num="+param.num;
            },
            initSearch:()=>{
                var searchNum=getSearchParam("num");
                numInput.value=searchNum;
            }
        },
        "3650000.xyz":{
            name:"3650000",
            url:"https://3650000.xyz/api/?type=json&mode=7&num=15",
            run:()=>{
                r18Check.style.display=sfwCheck.style.display=r18CheckLabel.style.display=sfwCheckLabel.style.display="none";
                var searchNum=getSearchParam("num");
                var searchMode=getSearchParam("mode");
                processByTime(searchNum,loadNum=>{
                    for(let i=0;i<loadNum;i++){
                        createImg(`http://3650000.xyz/api/?mode=${searchMode}&r=${Math.random()}`);
                    }
                },5,1000);
            },
            getSearch:(param)=>{
                return location.pathname+`?type=json&mode=${param.mode}&num=${param.num}`;
            },
            initSearch:()=>{
                var searchNum=getSearchParam("num");
                var searchMode=getSearchParam("mode");
                var modeObj=[
                    ["Public",""],
                    ["Weibo","1"],
                    ["Instagram","2"],
                    ["Cosplay","3"],
                    ["Nsfw","66"],
                    ["Mtcos","5"],
                    ["Legs","7"],
                    ["MoreCoser","8"],
                    ["Tuwan","9"]
                ];
                modeObj.forEach(item=>{
                    var option=document.createElement("option");
                    option.value=item[1];
                    option.innerHTML=item[0];
                    if(item[1]==searchMode){
                        option.selected=true;
                    }
                    modeSelect.appendChild(option);
                });
                modeSelect.style.display="inline";
                numInput.value=searchNum;
            }
        },
        "api.uomg.com":"buyersShow",
        "api.vvhan.com":"buyersShow",
        "www.hlapi.cn":"buyersShow",
        "api.ghser.com":"buyersShow"
    };
    var curConfig=setuConfig[document.domain],jsonData,hasFloatImg=false;
    if(!curConfig.run)curConfig=setuConfig[curConfig];
    document.title=curConfig.name;
    try{
        var firstText = "";
        for (var i = 0; i < document.body.childNodes.length; i++) {
            var curNode = document.body.childNodes[i];
            if (curNode.nodeType == 1 || curNode.nodeName == "PRE") {
                firstText = curNode.nodeValue || curNode.innerText;
                break;
            }
        }
        jsonData=JSON.parse(firstText);
    }catch(e){
        console.log(e);
        jsonData = firstText;
    }
    document.body.innerHTML="";
    var imgCon=document.createElement("div");
    var btns=document.createElement("div");
    var numInput=document.createElement("input");
    var r18Check=document.createElement("input");
    var r18CheckLabel=document.createElement("label");
    var sfwCheck=document.createElement("input");
    var sfwCheckLabel=document.createElement("label");
    var modeSelect=document.createElement("select");
    var submit=document.createElement("button");
    var referrerMeta=document.createElement("meta");
    var viewportMeta=document.createElement("meta");
    var overMask=document.createElement("div");
    var homepage=document.createElement("a");
    for(var name in setuConfig){
        var config=setuConfig[name];
        if(!config.run)continue;
        var siteA=document.createElement("a");
        var url=config.url;
        if(config.urls){
            var randomIndex=Math.floor(Math.random()*config.urls.length);
            url=config.urls[randomIndex];
            config.url=url;
        }
        siteA.href=url;
        siteA.innerHTML=config.name;
        btns.appendChild(siteA);
    }
    btns.appendChild(numInput);
    btns.appendChild(r18Check);
    btns.appendChild(r18CheckLabel);
    btns.appendChild(sfwCheck);
    btns.appendChild(sfwCheckLabel);
    btns.appendChild(modeSelect);
    btns.appendChild(submit);
    btns.appendChild(homepage);
    overMask.className="over-mask";
    imgCon.appendChild(overMask);
    referrerMeta.name="referrer";
    referrerMeta.content="never";
    document.head.appendChild(referrerMeta);
    viewportMeta.name="viewport";
    viewportMeta.content="width=device-width, initial-scale=1";
    document.head.appendChild(viewportMeta);

    curConfig.run();
    if(curConfig.initSearch)curConfig.initSearch();

    function sleep(fn,param,time) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(fn(param)), time)
        })
    }
    async function processByTime(num,fn,limit,time) {
        while(num>0){
            var loadNum=limit;
            if(num<limit)loadNum=num;
            num-=loadNum;
            await sleep(fn,loadNum,time);
        }
    }

    overMask.onclick=e=>{
        if(hasFloatImg){
            restoreImg(hasFloatImg);
        }
    };

    function restoreImg(img){
        hasFloatImg=false;
        img.style.zIndex=0;
        img.style.bottom="";
        img.style.width="100%";
        img.style.position="";
        img.style.margin="";
        document.body.style.overflow="";
        imgCon.style.maxHeight="";
        imgCon.style.maxWidth="";
        overMask.style.display="none";
        overMask.style.opacity=0;
        img.className="list-show";
        img.scrollIntoView();
    }

    function createImg(url){
        let img=document.createElement("img");
        img.src=url;
        img.className="list-show";
        img.style.width="100%";
        img.onclick=()=>{
            window.scrollTo(0,0);
            if(img.style.zIndex==2){
                restoreImg(img);
            }else if(img.style.zIndex==1){
                img.style.bottom="";
                img.style.width="";
                img.style.maxWidth="";
                img.style.maxHeight="";
                img.style.zIndex=2;
                document.body.style.overflow="";
                imgCon.style.maxHeight="100vh";
                imgCon.style.maxWidth="100vw";
            }else{
                if(hasFloatImg)return;
                hasFloatImg=img;
                document.body.style.overflow="hidden";
                img.style.bottom=0;
                if(img.naturalWidth>document.documentElement.clientWidth || img.naturalHeight>document.documentElement.clientHeight){
                    img.style.zIndex=1;
                    img.style.maxWidth="99%";
                    img.style.maxHeight="99%";
                }else{
                    img.style.zIndex=2;
                    img.style.maxWidth="";
                    img.style.maxHeight="";
                }
                img.style.width="";
                img.style.position="absolute";
                img.style.margin="auto";
                overMask.style.display="block";
                img.className="";
                setTimeout(()=>{
                    overMask.style.opacity=1;
                }, 0);
            }
        };
        imgCon.appendChild(img);
        return img;
    }

    function getSearchParam(name){
        let reg = new RegExp("(&|^)" + name + "=([^&]*)(&|$)", "i");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return decodeURIComponent(r[2]);
        };
        return "";
    }

    function submitParam(){
        var num=numInput.value,mode;
        if(modeSelect.options.length>0){
            mode=modeSelect.options[modeSelect.selectedIndex].value;
        }
        var r18=2;
        if(sfwCheck.checked && !r18Check.checked){
            r18=0;
        }else if(!sfwCheck.checked && r18Check.checked){
            r18=1;
        }
        if(numInput.value != ""){
            location.href=curConfig.getSearch({"r18":r18, "num":num, "mode":mode});
        }else{
            location.reload();
        }
    }

    GM_addStyle(`
    @media screen and (min-width: 1024px) {
      .img-con{
        overflow: auto;column-count: 5;
        -moz-column-count: 5;
        -webkit-column-count: 5;
        width: 100%;
        display: block;
      }
    }
    @media screen and (max-width: 1024px) {
      .img-con{
        overflow: auto;
        column-count: 2;
        -moz-column-count: 2;
        -webkit-column-count: 2;
        width: 100%;
        display: block;
      }
    }
    body{
      background: black;
    }
    .btns>select{
      display: none;
      height: 29px;
      border-radius: 3px 0 0 3px;
      -moz-border-radius: 3px 0 0 3px;
      -webkit-border-radius: 3px 0 0 3px;
      -ms-border-radius: 3px 0 0 3px;
      -o-border-radius: 3px 0 0 3px;
      border: none;
      color: #cacaca;
      background-color: #363636;
      font-size: 14px;
      outline: 0;
      padding: 2px 5px;
      vertical-align: top;
    }
    .over-mask{
      display: none;
      opacity: 0;
      width: 100%;
      height: 100%;
      background-color: #000000e6;
      position: fixed;
      z-index: 1;
      top: 0;
      left: 0;
      transition: opacity .3s ease-in-out;
      -moz-transition: opacity .3s ease-in-out;
      -webkit-transition: opacity .3s ease-in-out;
    }
    .list-show:hover{
      opacity: 1;
    }
    .list-show{
      opacity: 0.6;
      transition: opacity .3s ease-in-out;
      -moz-transition: opacity .3s ease-in-out;
      -webkit-transition: opacity .3s ease-in-out;
    }
    .img-con>img{
      -webkit-column-break-inside: avoid;
      break-inside: avoid;
      float: left;
      margin-bottom: 15px;
      margin-right: 15px;
      overflow: hidden;
      position: relative;
      top: 0;
      left: 0;
      right: 0;
      min-height: 200px;
      background: url(data:image/png;base64,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) no-repeat center center;
    }
    .btns{
      padding: 10px 0;
      text-align: center;
      line-height: 30px;
      position: fixed;
      z-index: 1;
      width: 100%;
      top: 0;
      left: 0;
      background: #000000de;
    }
    .btns>a{
      padding: 5px;
      background: #f8981e;
      color: black;
      border-radius: 5px;
      font-weight: bold;
      text-decoration: none;
      margin: 1px;
    }
    .btns>a:hover{
      background: #ffa31a;
    }
    .btns>label{
      background: #f8981e;
      color: black;
      border-radius: 5px;
      font-weight: bold;
      text-decoration: none;
      padding: 3px;
    }
    .btns>input[type=checkbox]{
      width:20px;
      height:20px;
      vertical-align: top;
    }
    .btns>input[type=number]{
      width: 50px;
      height: 25px;
      border-radius: 3px 0 0 3px;
      -moz-border-radius: 3px 0 0 3px;
      -webkit-border-radius: 3px 0 0 3px;
      -ms-border-radius: 3px 0 0 3px;
      -o-border-radius: 3px 0 0 3px;
      border: none;
      color: #cacaca;
      background-color: #363636;
      display: inline-block;
      font-size: 14px;
      outline: 0;
      padding: 2px 5px;
      vertical-align: top;
      margin: 0 5px;
    }
    .btns>button{
      cursor: pointer;
      background: #0075ff;
      color: white;
      border-radius: 5px;
      font-weight: bold;
      text-decoration: none;
      padding: 7px 5px 5px 5px;
      margin: 0px 10px 0 10px;
      border: 0;
    }`);

    btns.className="btns";
    document.body.appendChild(btns);
    homepage.innerHTML="Homepage";
    homepage.href="https://sleazyfork.org/en/users/8227-hoothin";
    homepage.target="_blank";
    numInput.type="number";
    numInput.title=numInput.placeholder="Number of sexy pictures";
    r18Check.type="checkbox";
    r18Check.id="r18Check";
    r18CheckLabel.innerHTML="R18 ";
    r18CheckLabel.htmlFor="r18Check";
    sfwCheck.type="checkbox";
    sfwCheck.id="sfwCheck";
    sfwCheckLabel.innerHTML="SFW ";
    sfwCheckLabel.htmlFor="sfwCheck";
    submit.innerHTML="Refresh";
    submit.onclick=submitParam;
    document.onkeyup = function(e) {
        var event = e || window.event;
        var key = event.which || event.keyCode || event.charCode;
        if (key == 13) {
            submitParam();
        }
    };

    imgCon.className="img-con";
    imgCon.style.paddingTop=parseInt(unsafeWindow.getComputedStyle(btns).height.replace("px",""))+20+"px";
    document.body.appendChild(imgCon);
})();