


/*
	========================================================================
	The /r/place Atlas
	
	An Atlas of Reddit's /r/place, with information to each
	artwork	of the canvas provided by the community.
	
	Copyright (C) 2017 Roland Rytz <roland@draemm.li>
	Licensed under the GNU Affero General Public License Version 3
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as
	published by the Free Software Foundation, either version 3 of the
	License, or (at your option) any later version.
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
	For more information, see:
	https://draemm.li/various/place-atlas/license.txt
	
	========================================================================
*/


function initView(){

	var objectsContainer = document.getElementById("objectsList");

	var linesCanvas = document.getElementById("linesCanvas");
	var linesContext = linesCanvas.getContext("2d");
	
	var backgroundCanvas = document.createElement("canvas");
	backgroundCanvas.width = 1000;
	backgroundCanvas.height = 1000;
	var backgroundContext = backgroundCanvas.getContext("2d");

	var hovered = [];

	var lastPos = [0, 0];

	var fixed = false; // Fix hovered items in place, so that clicking on links is possible

	renderBackground();
	render();

	container.addEventListener("mousemove", function(e){
		updateHovering(e);
	});

	function updateHovering(e){
		if(!dragging && !fixed){
			var pos = [
				 (e.clientX - (container.clientWidth/2 - innerContainer.clientWidth/2 + zoomOrigin[0]))/zoom
				,(e.clientY - (container.clientHeight/2 - innerContainer.clientHeight/2 + zoomOrigin[1]))/zoom
			];

			if(pos[0] <= 1000 && pos[0] >= 0 && pos[0] <= 1000 && pos[0] >= 0){
				var newHovered = [];
				for(var i = 0; i < atlas.length; i++){
					if(pointIsInPolygon(pos, atlas[i].path)){
						newHovered.push(atlas[i]);
					}
				}

				var changed = false;

				if(hovered.length == newHovered.length){
					for(var i = 0; i < hovered.length; i++){
						if(hovered[i].id != newHovered[i].id){
							changed = true;
							break;
						}
					}
				} else {
					changed = true;
				}

				if(changed){
					hovered = newHovered;
					render();
				}
			}
		}
	}

	function renderBackground(){

		backgroundContext.clearRect(0, 0, canvas.width, canvas.height);
			
		backgroundContext.fillStyle = "rgba(0, 0, 0, 0.6)";
		backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
		
		for(var i = 0; i < atlas.length; i++){

			var path = atlas[i].path;
			
			backgroundContext.beginPath();

			if(path[0]){
				backgroundContext.moveTo(path[0][0], path[0][1]);
			}
			
			for(var p = 1; p < path.length; p++){
				backgroundContext.lineTo(path[p][0], path[p][1]);
			}

			backgroundContext.closePath();

			backgroundContext.strokeStyle = "rgba(255, 255, 255, 1)";
			backgroundContext.stroke();
		}
	}

	function render(){
		context.globalCompositeOperation = "source-over";
		context.clearRect(0, 0, canvas.width, canvas.height);

		objectsContainer.innerHTML = "";

		if(hovered.length > 0){
			container.style.cursor = "pointer";
		} else {
			container.style.cursor = "default";
		}
		

		for(var i = 0; i < hovered.length; i++){

			var element = document.createElement("div");
			element.className = "object";
			
			var html = '<h2>'+hovered[i].name+'</h2>';
			if(hovered[i].description){
				html += '<p>'+hovered[i].description+'</p>';
			}
			if(hovered[i].website){
				html += '<a target="_blank" href='+hovered[i].website+'>Website</a>';
			}
			if(hovered[i].subreddit){
				if(hovered[i].subreddit.substring(0, 2) == "r/"){
					hovered[i].subreddit = "/" + hovered[i].subreddit;
				} else if(hovered[i].subreddit.substring(0, 1) != "/"){
					hovered[i].subreddit = "/r/" + hovered[i].subreddit;
				}
				html += '<a target="_blank" href=https://reddit.com'+hovered[i].subreddit+'>'+hovered[i].subreddit+'</a>';
			}
			element.innerHTML = html;

			objectsContainer.appendChild(element);

			hovered[i].element = element;

			
			var path = hovered[i].path;
			
			context.beginPath();

			if(path[0]){
				context.moveTo(path[0][0], path[0][1]);
			}
			
			for(var p = 1; p < path.length; p++){
				context.lineTo(path[p][0], path[p][1]);
			}

			context.closePath();

			context.globalCompositeOperation = "source-over";

			context.fillStyle = "rgba(0, 0, 0, 1)";
			context.fill();
		}

		updateLines();

		context.globalCompositeOperation = "source-out";
		context.drawImage(backgroundCanvas, 0, 0);

		for(var i = 0; i < hovered.length; i++){
			
			var path = hovered[i].path;
			
			context.beginPath();

			if(path[0]){
				context.moveTo(path[0][0], path[0][1]);
			}
			
			for(var p = 1; p < path.length; p++){
				context.lineTo(path[p][0], path[p][1]);
			}

			context.closePath();

			context.globalCompositeOperation = "source-over";

			context.strokeStyle = "rgba(0, 0, 0, 1)";
			context.stroke();
		}

		
	}

	function toggleFixed(e){
		if(!fixed && hovered.length == 0){
			return 0;
		}
		fixed = !fixed;
		if(!fixed){
			updateHovering(e);
			render();
		}
	}

	function updateLines(){
		
		linesCanvas.width = container.clientWidth;
		linesCanvas.height = container.clientHeight;
		linesContext.lineCap = "round";
		linesContext.lineWidth = Math.max(Math.min(zoom*1.5, 16*1.5), 1);
		linesContext.strokeStyle = "#000000";
		
		for(var i = 0; i < hovered.length; i++){
			var element = hovered[i].element;
			
			linesContext.beginPath();
			linesContext.moveTo(element.offsetLeft + element.clientWidth - 10, element.offsetTop + 20);
			linesContext.lineTo(
				 ~~(hovered[i].center[0]*zoom) + innerContainer.offsetLeft// + container.clientWidth/2 - innerContainer.clientWidth/2
				,~~(hovered[i].center[1]*zoom) + innerContainer.offsetTop - 50// + container.clientHeight/2 - innerContainer.clientHeight/2
			);
			linesContext.stroke();
		}
		
		linesContext.lineWidth = Math.max(Math.min(zoom, 16), 1);
		linesContext.strokeStyle = "#FFFFFF";
		
		for(var i = 0; i < hovered.length; i++){
			var element = hovered[i].element;
			
			linesContext.beginPath();
			linesContext.moveTo(element.offsetLeft + element.clientWidth - 10, element.offsetTop + 20);
			linesContext.lineTo(
				 ~~(hovered[i].center[0]*zoom) + innerContainer.offsetLeft// + container.clientWidth/2 - innerContainer.clientWidth/2
				,~~(hovered[i].center[1]*zoom) + innerContainer.offsetTop - 50// + container.clientHeight/2 - innerContainer.clientHeight/2
			);
			linesContext.stroke();
		}
	}

	window.addEventListener("resize", updateLines);
	window.addEventListener("mousemove", updateLines);
	window.addEventListener("dblClick", updateLines);
	window.addEventListener("wheel", updateLines);

	container.addEventListener("mousedown", function(e){
		lastPos = [
			 e.clientX
			,e.clientY
		];
	});

	container.addEventListener("mouseup", function(e){
		if(Math.abs(lastPos[0] - e.clientX) + Math.abs(lastPos[1] - e.clientY) <= 4){
			toggleFixed(e);
		}
	});
	
}

