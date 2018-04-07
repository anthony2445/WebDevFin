window.onload = function() {
	var topStory= document.getElementById("topStories");
	var req;
	var request = new XMLHttpRequest();

	$( "#topStories" ).accordion();

    request.onreadystatechange = function() {
			//console.log(request.readyState);
			//console.log(request.status);
      if (request.readyState == 4 && request.status == 200) {
				req = request.responseXML
				for(var i =0; i <2; i++)
				{
        	var title = req.getElementsByTagName('entry')[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;
					var txt1 = $("<h3></h3>").text(title);   // Create with jQuery
					//$('#topStories').append(txt1);

					var updated = req.getElementsByTagName('entry')[i].getElementsByTagName('updated')[0].childNodes[0].nodeValue;
					var txt2 = $("<h4></h4>").text(updated);   // Create with jQuery
					//$('#topStories').append(txt2);

					var summary = req.getElementsByTagName('entry')[i].getElementsByTagName('summary')[0].childNodes[0].nodeValue;
					var txt3 = $("<p></p>").text(summary);   // Create with jQuery

					//var div = $("<div></div>").text(txt1, txt2, txt3);

					//$('#topStories').append(div);
					console.log('1');
					var content = req.getElementsByTagName('entry')[i].getElementsByTagName('content')[0].childNodes[0].nodeValue;
					var txt4 = $("<p></p>").text(content);   // Create with jQuery
					$('#topStories').append(txt1);
					$('#topStories').accordion("refresh");

					jQuery('<div/>', {
					    id: 'foo' + i,
					}).appendTo('#topStories');
					$('#foo' + i).append(txt2, txt3, txt4);
				}
				$('#topStories').accordion("refresh");
				//console.log(title)
    		//topStory.innerHTML = title;
				//$("body").append(txt3);
      }
    };
    request.open('GET', 'topstories.atom', true);
    request.send();

	};
