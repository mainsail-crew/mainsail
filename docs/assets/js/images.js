function get_filesize(id, url, extension = "png") {
	url = url+"."+extension;
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", url, true);
        xhr.onreadystatechange = function() {
            if (this.readyState == this.DONE) {
			resolve({id: id, size: parseInt(xhr.getResponseHeader("Content-Length")), url: url, extension: extension})
            } 
        };
        xhr.send();
    })
}

function set_image(id, url, max_size = 20000) {
	Promise.all([
	get_filesize(id, url, "png"),
	get_filesize(id, url, "jpg"),
	//get_filesize(id, url, "jpeg"),
	//get_filesize(id, url, "gif"),
	]).then(data => {
	
		let sortbySize = function(data) {
			return data.filter(data => data.size > 2000).sort((a, b) => a.size - b.size);
		}
		let result = sortbySize(data)
		
		//console.log(result) 
		
        if (result[0].size <= max_size) {
            set_src(result[0].id, result[0].size, result[0].url);
        } else {
            replace_image(result[0].id, result[0].url, max_size);
        }
    })
}

function set_src(id, size, url) {
    screenshot = document.getElementById(id);
    screenshot.src = url;
	screenshot.classList.add("screenshot");
}

function replace_image(id, url, max_size) {
    screenshot = document.getElementById(id);
    var div = document.createElement('div');

    var a = document.createElement('a');
    a.appendChild(document.createTextNode(" here"));
    a.href = url;
    a.target = "_blank";

    div.appendChild(document.createTextNode("The file size of the screenshot has exceeded " + max_size / 1000 + "kB. For a screenshot click "));
    div.appendChild(a);
    div.appendChild(document.createTextNode("."));

    screenshot.parentNode.replaceChild(div, screenshot);
}