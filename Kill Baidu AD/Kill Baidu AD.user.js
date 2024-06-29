// ==UserScript==
// @name               百度广告(首尾推广及右侧广告)清理
// @name:zh-CN         百度广告(首尾推广及右侧广告)清理
// @name:zh-TW         百度廣告(首尾推廣及右側廣告)清理
// @name:en            Kill Baidu AD
// @namespace          hoothin
// @version            1.23.7
// @description        彻底清理百度搜索(www.baidu.com)结果首尾的推广广告、二次顽固广告、右侧广告，去除重定向，删除百家号
// @description:zh-CN  彻底清理百度搜索(www.baidu.com)结果首尾的推广广告、二次顽固广告、右侧广告，去除重定向，移除百家号
// @description:zh-TW  徹底清理百度搜索(www.baidu.com)結果首尾的推廣廣告、二次頑固廣告、右側廣告，去除重定向，刪除百家號
// @description:en     Just Kill Baidu AD
// @author             hoothin
// @match              *://www.baidu.com/*
// @match              *://m.baidu.com/*
// @match              *://greasyfork.org/*/scripts/24192-*
// @exclude            *://m.baidu.com
// @exclude            *://m.baidu.com/
// @exclude            *://www.baidu.com
// @exclude            *://www.baidu.com/
// @grant              GM_xmlhttpRequest
// @grant              GM_addStyle
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_openInTab
// @grant              GM_registerMenuCommand
// @grant              GM_unregisterMenuCommand
// @connect            *
// @run-at             document-start
// @license            MIT License
// @compatible         chrome 测试通过
// @compatible         firefox 测试通过
// @compatible         opera 未测试
// @compatible         safari 未测试
// ==/UserScript==

(function() {
    'use strict';
    var MO = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver, killBaijiaType = 1, killRight, killRightStyle, killRightRegister, hidePicture, hidePictureStyle, hidePictureRegister, blackList;
    if (MO) {
        var observer = new MO(function(records) {
            records.map(function(record) {
                if (record.addedNodes.length) {
                    [].forEach.call(record.addedNodes, function(addedNode) {
                        clearOneAD(addedNode);
                    });
                }
            });
        });
        var option = {
            'childList': true,
            'subtree': true
        };
        observer.observe(document, option);
    }

    function checkBaijia(item) {
        var itemHref = item.querySelector("a").href;
        item.style.display = "none";
        if (itemHref.indexOf("baidu.com") == -1) return;
        var gmxhr = GM_xmlhttpRequest({
            url: itemHref,
            headers: {
                "Accept": "text/html"
            },
            method: "head",
            onreadystatechange: function(response) {
                if (response.readyState == 4) {
                    if (response.finalUrl.indexOf("baijiahao.baidu.com") != -1) {
                        item.remove();
                    } else {
                        item.style.display = "";
                    }
                    gmxhr.abort();
                }
            }
        });
    }

    function checkMobileItem(item) {
        let mu = item.dataset.log;
        if (mu) {
            try {
                mu = JSON.parse(mu).mu;
            } catch (e) {
                return;
            }
        }
        if (!mu) return;
        if (/^https:\/\/baijiahao\.baidu\.com/.test(mu)) {
            item.remove();
            return;
        } else {
            let title = item.querySelector('[data-module="title"]');
            let isBlack = checkBlackList(mu, title && title.innerText);
            if (isBlack) {
                item.remove();
                return;
            }
        }
    }

    function checkLeftItem(item) {
        let mu = item.getAttribute("mu");
        if (mu) {
            if (/^https:\/\/baijiahao\.baidu\.com/.test(mu)) {
                item.remove();
                return;
            } else {
                let title = item.querySelector('h3');
                let isBlack = checkBlackList(mu, title && title.innerText);
                if (isBlack) {
                    item.remove();
                    return;
                }
                let link = item.querySelector("a[href*='www.baidu.com/link']");
                if (link) link.href = mu;
            }
        }
        let s = item.getAttribute("style");
        if (s && /display:(table|block)\s!important/.test(s)) {
            item.remove();
        } else {
            let baozhang = item.querySelector("[data-baodata]");
            if (baozhang) {
                item.remove();
                return;
            }
            var span = item.querySelector("div>span");
            if (span && span.innerHTML == "广告") {
                item.remove();
            }
            [].forEach.call(item.querySelectorAll("span,a"), function(span) {
                if (span && (span.innerHTML == "广告" || span.getAttribute("data-tuiguang"))) {
                    item.remove();
                }
            });
            if (killBaijiaType == 2) {
                [].forEach.call(item.querySelectorAll("a>div>span+img"), function(img) {
                    if (img && /^https?:\/\/pic\.rmb\.bdstatic\.com/.test(img.src)) {
                        //checkBaijia(item);
                        item.remove();
                    }
                });
            }
        }
    }

    function checkRightTable(item) {
        for (let i = 0; i < item.length; i++) {
            let d = item[i];
            if (d.id != "con-ar") {
                d.remove();
            }
        }
    }

    function checkRightAd(item) {
        var nra = item.querySelectorAll("a");
        for (let i = 0; i < nra.length; i++) {
            let d = nra[i];
            if (d.innerHTML == "广告") {
                item.remove();
                break;
            }
        }
    }

    function removeEcAd(ele) {
        var mAds = ele.querySelectorAll(".ec_wise_ad,.ec_youxuan_card,.page-banner");
        for (let i = 0; i < mAds.length; i++) {
            let mAd = mAds[i];
            mAd.remove();
        }
        var baiduapp = ele.querySelector("#copyright+div");
        if (baiduapp && baiduapp.querySelector("[ref='open']")) {
            baiduapp.remove();
        }
        var list = ele.querySelectorAll(ele.id === "results" ? ".result" : "#results>.result");
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            checkMobileItem(item);
        }
    }

    function clearAD() {
        if (!document.querySelectorAll) return;
        if (killRight) {
            document.body.classList.add("killRight");
        } else document.body.classList.remove("killRight");
        removeEcAd(document);
        var list = document.querySelectorAll("#content_left>div,#content_left>table");
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            checkLeftItem(item);
        }

        var eb = document.querySelectorAll("#content_right>table>tbody>tr>td>div");
        checkRightTable(eb);

        var nr = document.querySelector("#content_right>div>div>div");
        if (nr) {
            checkRightAd(nr);
        }
    }

    function clearOneAD(ele) {
        if (ele.nodeType != 1) return;
        if (ele.classList.contains("ec-tuiguang") || ele.classList.contains("ec_wise_ad") || ele.classList.contains("ec_youxuan_card") || ele.classList.contains("page-banner")) {
            ele.remove();
            return;
        }
        if (ele.parentNode && ele.parentNode.id == "content_left" && (ele.nodeName == "DIV" || ele.nodeName == "TABLE")) {
            checkLeftItem(ele);
        } else if (ele.parentNode && ele.parentNode.id == "content_right") {
            if (ele.nodeName == "TABLE") {
                var eb = ele.querySelectorAll("tbody>tr>td>div");
                checkRightTable(eb);
            }
            if (ele.nodeName == "DIV") {
                var nr = ele.querySelector("div>div");
                if (nr) {
                    checkRightAd(nr);
                }
            }
        } else {
            removeEcAd(ele);
            let eles = ele.querySelectorAll("#content_left>div,#content_left>table");
            [].forEach.call(eles, e => {clearOneAD(e)});
        }
    }
    function initCss() {
        killRightStyle && killRightStyle.parentNode && killRightStyle.parentNode.removeChild(killRightStyle);
        if (killRight) {
            killRightStyle = GM_addStyle(`
            #content_right,[tpl="recommend_list"],#rs_new {
                display: none;
            }
            #container.sam_newgrid {
                width: calc(100% - 150px);
            }
            #container.sam_newgrid #content_left {
                column-width: 560px;
                width: 100%;
            }
            #content_left .result-op, #content_left .result {
                page-break-inside: avoid;
            }
            `);
        }
        hidePictureStyle && hidePictureStyle.parentNode && hidePictureStyle.parentNode.removeChild(hidePictureStyle);
        if (hidePicture) {
            hidePictureStyle = GM_addStyle(`
            #wrapper_wrapper {
                background: rgba(228, 228, 228, 0.29);
            }
            #container.sam_newgrid .c-container .t a, #container.sam_newgrid .c-container .c-title a,
            #container.sam_newgrid .c-container .t a em, #container.sam_newgrid .c-container .c-title a em {
                text-decoration: auto;
            }
            #result_logo {
                opacity: 0.75;
            }
            .cos-col[style*="width:33"],.cos-col[style*="width:25"],.c-span3,.c-span4,.c-span6>.c-img,[tpl="short_video"],[data-module="gp-peopleintro-img-click"],div[class^="img-container"],[data-module="normal-img"],[role="img"],.c-gap-inner-y-img,div[class*="only-multi-image"] {
                display: none;
            }
            .new-pmd .c-span9,.cos-col[style*="width:33"]+div,.cos-col[style*="width:25"]+div {
                width: 100%!important;
            }
            a,a:active,#content_right a {
                color: rgb(51,51,51);
            }
            em {
                color: #4E6EF2!important;
            }
            .c-container.result[tpl], .result-op.c-container[tpl], .result-op.xpath-log.new-pmd[tpl] {
                padding-top: 0px;
                padding-bottom: 25px;
                border-bottom: 1px solid rgba(211, 211, 211, 0.63);
            }
            `);
        }
    }

    function checkBlackList(url, title) {
        if (!blackList || !blackList.forEach) return false;
        for (let i = 0; i < blackList.length; i++) {
            try {
                let isBlack = checkBlack(url, title, blackList[i]);
                if (isBlack) return true;
            } catch (e) {
                console.log(e);
            }
        }
        return false;
    }

    function checkBlack(url, title, pattern) {
        pattern = pattern && pattern.replace(/\s*#.*/, "");
        if (!pattern || !pattern.trim() || pattern.indexOf("#") === 0 || pattern.indexOf("!") === 0 || pattern.indexOf(" ") === 0 || pattern.indexOf("Update") === 0) return false;
        if (pattern.indexOf("/") === 0) {
            let match = pattern.match(/^\/(.*)\/(\w*)$/);
            if (match) {
                return new RegExp(match[1], match[2]).test(url);
            }
        }
        if (pattern.indexOf("title") === 0) {
            let match = pattern.replace("title", "").trim();
            if (match.indexOf("/") === 0) {
                match = match.match(/^\/(.*)\/(\w*)$/);
                if (match) {
                    return new RegExp(match[1], match[2]).test(title);
                }
            } else if (match.indexOf("=~") === 0) {
                match = match.match(/^=~\s*\/(.*)\/(\w*)$/);
                if (match) {
                    return new RegExp(match[1], match[2]).test(title);
                }
            } else if (match.indexOf("=") === 0) {
                match = match.match(/^=\s*"(.*)"$/);
                if (match) {
                    return title === match[1];
                }
            } else if (match.indexOf("^=") === 0) {
                match = match.match(/^\^=\s*"(.*)"$/);
                if (match) {
                    return title.indexOf(match[1]) === 0;
                }
            } else if (match.indexOf("$=") === 0) {
                match = match.match(/^\$=\s*"(.*)"$/);
                if (match) {
                    return title.endsWith(match[1]);
                }
            } else if (match.indexOf("*=") === 0) {
                match = match.match(/^\*=\s*"(.*)"$/);
                if (match) {
                    return title.indexOf(match[1]) !== -1;
                }
            }
        }
        return matchPattern(url, pattern);
    }

    function matchPattern(url, pattern) {
        if (pattern === '<all_urls>') {
            return true;
        }
        let match = pattern.match(/^(\*|[\w-]+):\/{2,3}(?:(\*|\*\.[^/*]+|[^/*]+)\/)?(.*)$/);
        if (!match) return url.indexOf(pattern) !== -1;
        const [, scheme, host, path] = match;
        const urlScheme = url.split(':')[0];
        const urlParam = new URL(url);
        if (scheme === '*' || urlScheme === scheme) {
            if (host !== '*') {
                const urlHost = urlParam.hostname;
                if (host.startsWith('*')) {
                    const hostPattern = host.slice(2);
                    if (!urlHost.endsWith(hostPattern)) return false;
                } else {
                    if (urlHost !== host) return false;
                }
            }
            const urlPath = urlParam.pathname + urlParam.search;
            const pathRegex = new RegExp(`^${path.replace(/([\.\?])/g, '\\$1').replace(/\*/g, '.*')}$`);
            return pathRegex.test(urlPath);
        }
        return false;
    }

    function registerMenuCommand() {
        initCss();
        hidePictureRegister = GM_registerMenuCommand(hidePicture ? "✅ 恢复图片与样式" : "❌ 隐藏图片并简化样式", () => {
            GM_unregisterMenuCommand(killRightRegister);
            GM_unregisterMenuCommand(hidePictureRegister);
            hidePicture = !hidePicture;
            GM_setValue("hidePicture", hidePicture);
            registerMenuCommand();
        });
        killRightRegister = GM_registerMenuCommand(killRight ? "✅ 恢复右边栏与布局" : "❌ 隐藏右边栏并多列显示", () => {
            GM_unregisterMenuCommand(killRightRegister);
            GM_unregisterMenuCommand(hidePictureRegister);
            killRight = !killRight;
            GM_setValue("killRight", killRight);
            registerMenuCommand();
        });
    }
    try {
        killRight = !!GM_getValue("killRight");
        hidePicture = !!GM_getValue("hidePicture");
        blackList = GM_getValue("blackList") || [];
        if (location.host === "greasyfork.org") {
            function initConfig() {
                let parent = document.querySelector('#additional-info');
                let baseCon = document.createElement('div');
                baseCon.style.margin = '20px';
                parent.insertBefore(baseCon, parent.children[0]);
                let checkIndex = 0;
                let createCheckbox = (name, defaultValue) => {
                    let box = document.createElement('div');
                    let checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = defaultValue;
                    let id = 'stcnsc-checkbox' + checkIndex++;
                    checkbox.id = id;
                    let label = document.createElement('label');
                    label.setAttribute('for', id);
                    label.innerText = name;
                    box.appendChild(checkbox);
                    box.appendChild(label);
                    baseCon.appendChild(box);
                    return checkbox;
                };
                let hidePictureInput = createCheckbox('隐藏图片并简化样式', hidePicture);
                let killRightInput = createCheckbox('隐藏右边栏并多列显示', killRight);
                let importInput = document.createElement('textarea');
                importInput.placeholder = '订阅 uBlacklist 规则：如 https://git.io/ublacklist';
                importInput.style.width = '100%';
                importInput.style.marginBottom = '10px';
                baseCon.appendChild(importInput);
                let blackListInput = document.createElement('textarea');
                blackListInput.placeholder = '*://*.12345.cn/*\n*://*.54321.com/*\n一行一条';
                blackListInput.style.width = '100%';
                blackListInput.style.minHeight = "60px";
                blackListInput.value = blackList.join("\n");
                baseCon.appendChild(blackListInput);
                function saveBlackList() {
                    GM_setValue("blackList", blackList);
                }
                let saveBtn = document.createElement('button');
                saveBtn.innerText = '保存';
                saveBtn.style.display = 'block';
                saveBtn.style.fontSize = 'x-large';
                saveBtn.style.fontWeight = 'bold';
                saveBtn.style.pointerEvents = 'all';
                saveBtn.style.cursor = 'pointer';
                saveBtn.addEventListener("click", function(e) {
                    hidePicture = hidePictureInput.checked;
                    killRight = killRightInput.checked;
                    GM_setValue("hidePicture", hidePicture);
                    GM_setValue("killRight", killRight);
                    if (importInput.value) {
                        alert("读取规则中……");
                        let importUrls = importInput.value.trim().split("\n");
                        importUrls.forEach(url => {
                            url = url && url.trim();
                            if (!url) return;
                            GM_xmlhttpRequest({
                                url: url,
                                onload: function(res) {
                                    let result = res.response || res.responseText;
                                    if (!result) return;
                                    blackList = blackList.concat(result.split("\n"));
                                    blackList = blackList.filter((value, index) => blackList.indexOf(value) === index);
                                    saveBlackList();
                                    blackListInput.value = blackList.join("\n");
                                }
                            });
                        });
                    } else {
                        blackList = blackListInput.value.split("\n");
                        saveBlackList();
                    }
                    alert("设置完毕");
                });
                baseCon.appendChild(saveBtn);
                baseCon.appendChild(document.createElement("hr"));
            }
            if (document.readyState == "complete") {
                initConfig();
            } else {
                document.addEventListener("readystatechange", e => {
                    if (document.readyState == "complete") {
                        initConfig();
                    }
                });
            }
            return;
        }
        registerMenuCommand();
        GM_registerMenuCommand("🔧 打开设置页", () => {
            GM_openInTab("https://greasyfork.org/scripts/24192", {active: true});
        });
    } catch(e) {}
    if (document.readyState == "complete" || document.readyState == "interactive") {
        clearAD();
    } else {
        document.addEventListener("readystatechange", e => {
            if (document.readyState == "complete" || document.readyState == "interactive") {
                clearAD();
            }
        });
    }
})();