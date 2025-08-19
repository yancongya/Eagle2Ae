class DragSaver{#$dropArea;#clientX;#clientY;#dragstartX;#dragstartY;#onFirstDragEvent;#lastDragX=0;#lastDragY=0;#dragCount=0;constructor({onDragStart:e,onDragEnd:a,onDrop:r}){this.onDragStart=e||function(){},this.onDragEnd=a||function(){},this.onDrop=r||function(){},this.#generateDropArea(),this.#registerGlobalEvents(),eagle.preference.changed(()=>{eagle.logger.info("[drag-saver] preference changed, regenerate drop area"),this.#generateDropArea()}),eagle.i18n.changed(()=>{eagle.logger.info("[drag-saver] i18n changed, regenerate drop area"),this.#generateDropArea()})}#hideDropArea(){1===eagle.preference.dragMode&&this.#$dropArea[0].close(),this.#dragCount=0,this.#dragstartX=0,this.#dragstartY=0,setTimeout(()=>{this.#$dropArea&&this.#$dropArea.detach&&this.#$dropArea.detach()},50)}#makeDraggable(e){e.draggable=!0}#restoreDraggable(e){var a="AUDIO"===e.nodeName,r="VIDEO"===e.nodeName;(a||r)&&(a&&e.blur(),e.removeAttribute("draggable"))}#registerGlobalEvents(){let a=this;eagle.logger.info("[drag-saver] register global events"),$(document).on("dragstart","img, a, video, audio, [eagle-src]",e=>{eagle.preference.isURLBlackList(location.href)||this.#onDragStart(e,a)}),$(document).on("focus","audio",function(){this.getAttribute("eagle-src-loading")||eagle.preference.isURLBlackList(location.href)||this.getAttribute("draggable")||(eagle.logger.info("[content] focus on audio, set draggable to true"),a.#makeDraggable(this))}),$(document).on("focus","video, video[eagle-src]",function(){this.getAttribute("eagle-src-loading")||eagle.preference.isURLBlackList(location.href)||this.getAttribute("draggable")||(eagle.logger.info("[content] focus on video set draggable to true"),a.#makeDraggable(this))}),eagle.env.browser.isFirefox()?($(document).on("mouseover","video, video[eagle-src]",function(){this.getAttribute("eagle-src-loading")||eagle.preference.isURLBlackList(location.href)||this.getAttribute("draggable")||(eagle.logger.info("[content] mousedown on video set draggable to true"),a.#makeDraggable(this))}),$(document).on("mouseout","video, video[eagle-src]",function(){this.getAttribute("eagle-src-loading")||eagle.preference.isURLBlackList(location.href)||this.getAttribute("draggable")&&(eagle.logger.info("[content] mouseout on video set draggable to false"),a.#restoreDraggable(this))})):$(document).on("mousedown","video, video[eagle-src]",function(){this.getAttribute("eagle-src-loading")||eagle.preference.isURLBlackList(location.href)||this.getAttribute("draggable")||(eagle.logger.info("[content] mousedown on video set draggable to true"),a.#makeDraggable(this))})}#generateDropArea(){var e;eagle.preference.isURLBlackList(location.href)||(document.documentElement,e=`
			--eagle-add-light-icon-url: url(&quot;${e=eagle.extension.path}images/plus.svg&quot;);
			--eagle-add-dark-icon-url: url(&quot;${e}images/plus-dark.svg&quot;);
			--eagle-folder-light-icon-front-url: url(&quot;${e}images/add-to-eagle-front.svg&quot;);
			--eagle-folder-light-icon-back-url: url(&quot;${e}images/add-to-eagle-back.svg&quot;);
			--eagle-folder-dark-icon-front-url: url(&quot;${e}images/add-to-eagle-front-dark.svg&quot;);
			--eagle-folder-dark-icon-back-url: url(&quot;${e}images/add-to-eagle-back-dark.svg&quot;);
		`,0===$("#eagle-drag-images").length&&$('<div id="eagle-drag-images" style="position: fixed; top: -100000px;"></div>').appendTo("body"),0===eagle.preference.dragMode&&(this.#$dropArea=void 0),$("body").off("dragleave dragenter dragover drop",".eagle-drop-area-item"),1===eagle.preference.dragMode&&(this.#$dropArea=$(`
				<dialog eagle-extension translate="no">
					<div id="eagle-drop-area" class="eagle-drop-area" style="${e}">
						<div class="eagle-drop-area-content">
							<div class="eagle-left-panel">
								<div class="eagle-drop-area-item" folder-id="">
									<div class="eagle-drop-area-description">
										<div class="add-to-eagle-icon">
											<div class="back"></div>
											<div class="front"></div>
										</div>
										<div class="title">${eagle.i18n.words["dragSaver.drag"]}</div>
									</div>
								</div>
							</div>
							<div class="eagle-right-panel">
								<div class="eagle-hidable-area">
									<div id="eagle-drop-area-folders" class="eagle-scrolling"></div>
									<hr>
								</div>
								<div class="eagle-drop-area-item" folder-id="choose">
									<div class="plus-icon"></div>
									<div class="title">${eagle.i18n.words["dragSaver.drag-choose"]}</div>
								</div>
							</div>
						</div>
					</div>
					<div id="eagle-drop-area-overlay"></div>
				</dialog>
			`),this.#$dropArea.attr("eagle-extension",""),this.#$dropArea.attr("eagle-extension-theme",eagle.preference.displayTheme),this.#$dropArea.attr("eagle-extension-locale",eagle.preference.getPreferredLocale()),this.#$dropArea.attr("eagle-extension-os",eagle.env.os.name),this.#$dropArea.attr("eagle-browser",eagle.env.browser.name)),2===eagle.preference.dragMode&&(this.#$dropArea=$(`
				<div eagle-extension translate="no" id="eagle-drop-area" class="eagle-drop-bottom-area" style="${e}">
					<div class="eagle-drop-area-content">
						<div class="add-to-eagle-icon" style="width: 112px; height: 88px;">
							<div class="back"></div>
							<div class="front"></div>
						</div>
						<div class="title">${eagle.i18n.words["dragSaver.drag"]}</div>
					</div>
				</div>
				<div id="eagle-drop-area-overlay"></div>
			`),this.#$dropArea.attr("eagle-extension",""),this.#$dropArea.attr("eagle-extension-theme",eagle.preference.displayTheme),this.#$dropArea.attr("eagle-extension-locale",eagle.preference.getPreferredLocale()),this.#$dropArea.attr("eagle-extension-os",eagle.env.os.name)),1===eagle.preference.dragMode&&$("body").on("dragleave",".eagle-drop-area-item",e=>($(e.target).removeClass("dragenter"),!1)).on("dragenter",".eagle-drop-area-item",e=>($(e.target).addClass("dragenter"),!1)).on("dragover",".eagle-drop-area-item",()=>!1).on("drop",".eagle-drop-area-item",async e=>{var a,r;if(e.stopPropagation(),await eagle.env.isReady())return r=$(e.currentTarget).attr("folder-id"),a=(a=$(e.currentTarget).attr("extend-tags")||"")&&a.split(",")||[],r={event:e,element:eagle.elementInspector.getTarget(),folderID:r,extendTags:a},$(e.target).removeClass("dragenter"),this.onDrop(r),!1}),2===eagle.preference.dragMode&&this.#$dropArea.on("dragleave",()=>(this.#$dropArea.removeClass("dragover"),!1)).on("dragenter",function(){return $(this).addClass("dragenter"),!1}).on("dragover",()=>(this.#$dropArea.addClass("dragover"),!1)).on("drop",e=>(e.stopPropagation(),this.onDrop({event:e,element:eagle.elementInspector.getTarget()}),$(this).removeClass("dragenter"),!1)),1!==eagle.preference.dragMode&&2!==eagle.preference.dragMode)||this.#$dropArea.on("click",e=>{this.#$dropArea&&0<this.#$dropArea.parent().length&&this.#onDragEnd(e,this)})}#showDropArea(r){var t=r.self;if((0!==t.#dragstartX||0!==t.#dragstartY)&&(this.#$dropArea.appendTo("body"),1===eagle.preference.dragMode&&this.#$dropArea[0].showModal(),2!==eagle.preference.dragMode)){var o=$(t.#$dropArea[0].querySelector(".eagle-drop-area")),i=o.outerWidth(),g=o.outerHeight();let e=t.#lastDragX,a=t.#lastDragY;"Top"===r.orientation&&(e-=128,a=a-g+20),"Bottom"===r.orientation&&(e-=128,a-=20),"Right"===r.orientation&&(e-=20,a-=g/2),r.orientation,"TopRight"===r.orientation&&(e-=20,a-=g/2),"TopLeft"===r.orientation&&(e-=128,a=a-g+20),"BottomRight"===r.orientation&&(e-=20,a-=g/2),"BottomLeft"===r.orientation&&(e-=128,a-=20),a&&e?(a<20&&(a=20),e<20&&(e=20),a+g>window.innerHeight&&(a=window.innerHeight-g-20),e+i>window.innerWidth&&(e=window.innerWidth-i-10),o.css({left:e,top:a}),$("#eagle-drop-area-folders").scrollTop(0)):this.#$dropArea.detach()}}async#refreshRecentFolders(){try{var e=await eagle.folder.recent();const i=this.#$dropArea.find("#eagle-drop-area-folders");i.empty(),e&&0<e.length?(e.length=16,e.forEach(e=>{var{icon:e="folder",iconColor:a="black",extendTags:r=[],name:t,id:o}=e,e=eagle.extension.path+`images/folder-icons/ic_${e}.png`,o=`
							<div class="eagle-drop-area-item" folder-id="${o}" extend-tags="${r.join()}">
								<div class="folder-icon">
									<div class="color-${a}" style="width: 20px; height: 20px; mask-image: url('${e}'); -webkit-mask-image: url('${e}');" />
								</div>
								<div class="title">${t}</div>
							</div>
						`;i.append(o)})):i.append(`<div class="eagle-drop-area-empty">${eagle.i18n.words["dragSaver.drag-empty"]}</div>`)}catch(e){}}#generateDragImage(e){if(e&&"IMG"===e.nodeName){var a,r;if(140<e.naturalWidth)return a=140/e.width*e.height,(r=document.createElement("canvas")).width=140,r.height=a,r.getContext("2d").drawImage(e,0,0,140,a),$("#eagle-drag-images").empty().append(r),r}return!e||"VIDEO"!==e.nodeName&&"AUDIO"!==e.nodeName?null:e}async#onDragStart(e,t){var a,r,o;eagle.preference.dragEnable&&0!=eagle.preference.dragMode&&!(0<$("[contenteditable='true']").has(e.target).length)&&(eagle.elementInspector.setTarget(e),a=e.dataTransfer||e.originalEvent.dataTransfer,r=eagle.elementInspector.getTarget())&&((o=t.#generateDragImage(r))&&(a.setDragImage(o,0,0),t.#restoreDraggable(r)),$(e.target).off("drag").on("drag",e=>{var a,r;eagle.preference.dragEnable&&(r=e.clientX||t.#clientX,a=e.clientY||t.#clientY,t.#lastDragX===r&&t.#lastDragY===a||(t.#lastDragX=r,t.#lastDragY=a,t.#dragCount++,r=Math.sqrt(Math.pow(r-t.#dragstartX,2)+Math.pow(a-t.#dragstartY,2)),10<t.#dragCount&&30<r&&t.#onFirstDragEvent&&(t.#onFirstDragEvent(),t.#onFirstDragEvent=void 0),clearTimeout(t.dragTimeout),t.dragTimeout=setTimeout(()=>{t.#onFirstDragEvent&&(t.#onFirstDragEvent(),t.#onFirstDragEvent=void 0)},800)),clearTimeout(t.dragOutTimeout),t.dragOutTimeout=setTimeout(()=>{t.#onDragEnd(e,t)},2e3))}).off("mousemove").on("mousemove",e=>{t.#clientX=e.clientX,t.#clientY=e.clientY}).off("dragend").on("dragend",e=>{clearTimeout(t.dragTimeout),t.#onDragEnd(e,t)}),eagle.env.browser.isFirefox()&&$(document).off("dragover").on("dragover",e=>{e.preventDefault(),t.#clientX=e.originalEvent.clientX,t.#clientY=e.originalEvent.clientY}),t.#dragstartX=e.clientX,t.#dragstartY=e.clientY,this.#onFirstDragEvent=async()=>{t.#refreshRecentFolders();let e="";var a,r;1===eagle.preference.dragMode&&(a=t.#dragstartX,r=t.#dragstartY,a=t.#lastDragX-a,r=t.#lastDragY-r,e=0<r?"Bottom":"Top",e+=0<a?"Right":"Left",a<=36&&-36<=a&&(e=0<r?"Bottom":"Top"),r<=36)&&-36<=r&&0<a&&(e="Right"),this.#showDropArea({orientation:e,self:t}),eagle.logger.info(`[content] showDropArea [${e}]`)},this.onDragStart())}#onDragEnd(e,a){$(this).off("dragend mouseup mousemove drag"),a.onDragEnd(),a.#hideDropArea()}}