//
// Lean Overlay
//
(function($){
	$.fn.extend({
		leanModal:function(options){
			var defaults={top:100,overlay:0.5,closeButton:null};
			var overlay=$("<div id='lean_overlay'></div>");
			$("body").append(overlay);
			options=$.extend(defaults,options);

			return this.each(function(){
				var o=options;
				$(this).click(function(e){
					var modal_id=$(this).attr("href");
					$("#lean_overlay").click(function(){
						close_modal(modal_id);
					});
					$(o.closeButton).click(function(){
						close_modal(modal_id);
					});
					var modal_height=$(modal_id).outerHeight();
					var modal_width=$(modal_id).outerWidth();
					$("#lean_overlay").css({"display":"block",opacity:0});
					$("#lean_overlay").fadeTo(200,o.overlay);
					$(modal_id).css({"display":"block","position":"fixed","opacity":0,"z-index":11000,"left":50+"%","margin-left":-(modal_width/2)+"px","top":o.top+"px"});
					$(modal_id).fadeTo(200,1);
					e.preventDefault()
				})
			});

			function close_modal(modal_id){
				$("#lean_overlay").fadeOut(200);
				$(modal_id).css({"display":"none"})
			}
		}
	})
})(jQuery);


//
// Dots
//
var Dots = (function(window, document, $, undefined){

	var size = 5,
		that = this;

console.log(this);

	$('#stations').prepend('<div class="dots"></div>');

	$("#stations").on("click", '.dots span.dot', function(event){
		var dot = parseInt($(this).html());
		$('#stations .container').css('margin-left', '-'+dot*520+'px');
		$('.dots span').removeClass('dot-active');
		$(this).addClass('dot-active');
	});

	return {
		init: function(s) {
			var liLength = $('#stations .container').children('.page').length;
console.log('liLength: '+liLength);

			for (i = 0; i < liLength; i++) {
				$('#stations .dots').append('<span class="dot">'+(i)+'</span>');
			}

			$('.dots span:nth-child(1)').addClass('dot-active');
		}
	}

})(window, document, jQuery);


//
// NowPlaying
//
var NowPlaying = (function(window, document, $, undefined) {

	var station,
		station_name,
		size = 320,
		pGress,
		pTosh,
		previous,
		track = {};

	$('#played').append('<div class="page"><ul></ul></div>');

	function getURL(station) {
		return 'proxy.php?url=http%3A%2F%2Fwww.live365.com%2Fpls%2Ffront%3Fhandler%3Dplaylist%26cmd%3Dview%26viewType%3Dxml%26handle%3D'+station+'%26maxEntries%3D1%26tm%3D1348157450841';
//		return 'http://www.live365.com/pls/front?handler=playlist&cmd=view&viewType=xml&handle='+this.station+'&maxEntries=1&tm=1348157450841';
	}

	function handlePLSData(data) {
//console.log(data);
		var xml = data.contents;
		var refresh = $(xml).find('Refresh').html();
		redraw(xml);
		wikiContent.draw($(xml).find('Artist').html());

		pTosh = setTimeout(function() {
			$.post(getURL(station), handlePLSData);
		}, (refresh*1000));
	}

	function redraw(obj) {
//console.log($(obj).find('visualURL').html());
		var visualURL = $(obj).find('visualURL').html().split('|');
		var visualURLEle = [];
		var visualURLData = {};

		if (track.artist && track.artist != previous) {
			$('#played ul').prepend('<li><img src="'+track.img+'" width="130"><div><strong>'+track.artist+'</strong></div><div>'+track.title+'</div><div><em>'+track.album+'</em></div></li>');
			previous = track.artist;
		}

		for(var i = 0; i < visualURL.length; i++) {
			visualURLEle = visualURL[i].split('=');
			visualURLData[visualURLEle[0]] = visualURLEle[1];
		}
//console.log(visualURLData);

		track.img = unescape(visualURLData.img);
		track.artist = $(obj).find('Artist').html();
		track.title = $(obj).find('Title').html();
		track.seconds = $(obj).find('Seconds').html();
		track.album = $(obj).find('Album').html();
		track.refresh = $(obj).find('Refresh').html();

console.log('track.img: '+track.img);
		if (track.img && track.img != 'undefined' && track.img.indexOf('noimage') == -1) {
			track.img = track.img.replace(/SL1[36]0/, 'SL320');
		} else {
			track.img = '/images/missing.png';
		}
console.log('this setStation station: '+station);
console.log('this setStation name: '+station_name);
		$('#cover').attr('src', track.img);
		$('#station').html(station_name);
		$('#artist strong').html(track.artist);
		$('#title').html(track.title);
		$('#time').html(formatTrackTime(track.seconds));
		$('#album em').html(track.album);

		if (pGress) clearInterval(pGress);
		var playedSoFar = Math.max(track.seconds - track.refresh, 0);
		pGress = setInterval(function() {
			var pVal = Math.round((playedSoFar++ * 100) / track.seconds);
			if (pVal > 100) {
				clearInterval(pGress);
			} else {
				$('#progress').css('width', pVal+'%');
			}
		},1000);
	}

	function formatTrackTime(seconds){
		var s = '';
		if (isNaN(seconds))
			seconds = 0;
		if (seconds >= 60)
			s = parseInt(seconds/60);
		seconds = seconds % 60;
		s += (seconds > 9) ? ":" : ":0";
		s += seconds;
		return s;
	}

	return {
		setStation: function(s) {
			station = s.station;
			station_name = s.name;
console.log('setStation station: '+s.station);
console.log('setStation name: '+s.name);
			if (pTosh) clearTimeout(pTosh);
			$.post(getURL(station),  handlePLSData);
		}
	}

}(window, document, jQuery));


//
// Genres
//
var Genres = (function(window, document, $, undefined) {

	var station,
		list = '',
		firstCol = false;
		genres = [
			'Alternative',
			'Blues',
			'Classical',
			'Country',
			'Easy Listening',
			'Electronic/Dance',
			'Folk',
			'Freeform',
			'Hip-Hop/Rap',
			'Inspirational',
			'International',
			'Jazz',
			'Latin',
			'Metal',
			'New Age',
			'Oldies',
			'Pop',
			'R&B/Urban',
			'Reggae',
			'Rock',
			'Seasonal/Holiday',
			'Soundtracks',
			'Talk'
		];

	$('#genres').html('<div class="container"></div>');

	for (i = 0; i < genres.length; i++) {
		list += '<li data-genre="'+genres[i].toLowerCase()+'"><h3>'+genres[i]+'</h3></li>';
console.log(i + ' : ' + genres.length + ' : ' + (genres.length / 2) + ' : ' + ((genres.length - 1) / 2) + ' : ' + firstCol);
		if ((i + 1) > (genres.length / 2) && !firstCol) {
			$('#genres .container').append('<div class="page row"><ul class="genres sixcol">'+list+'</ul></div>');
			list = '';
			firstCol = true;
		}
	}
	$('#genres .container .page').append('<ul class="genres sixcol last">'+list+'</ul>');

	$('#genres').on('click', 'button', function() {
		$(this).parent().parent().css('margin-left', 0);
		$(this).parent().remove();
	});

	$("#genres .genres li").click(function(){
console.log($(this).attr('data-genre'));
		var url = 'http://www.live365.com/cgi-bin/directory.cgi?site=xml&access=PUBLIC&rows=5&only=P&genre='+escape($(this).attr('data-genre'));

		$('#genres .container').css('margin-left', '-520px');

		$.ajax({
			type: 'GET',
			url: 'proxy.php?url='+encodeURIComponent(url),
			contentType: 'text/xml',
			success: draw
		});

		function draw(data) {
			var xml = data.contents;
			var list = '';
			xml = xml.replace(/\<\!\[CDATA\[(.*)\]\]\>/g, "$1");

			$(xml).find('LIVE365_STATION').each(function(){
				var ele = $(this).find('STATION_TITLE').html();
				var stn = $(this).find('STATION_BROADCASTER').html();
				var des = $(this).find('STATION_DESCRIPTION').html();
				var gen = $(this).find('STATION_GENRE').html();
				var playing = (station == stn) ? 'playing' : '';
				list += '<li data-station="'+stn+'" class="'+ playing +'"><h3>'+ele+'</h3><p>'+des+'</p><p><em>'+gen+'</em></p></li>';
			});

			$('#genres .container').append('<div class="page"><button class="button">« Back to Genres</button><ul class="stations">'+list+'</ul></div>');
		}
	});

	return {
		setStation: function(s) {
			station = s.station;
		}
	}

})(window, document, jQuery);


//
// Player
//
(function(window, document, $, undefined) {

	var station	= 'wava2',
		station_name = 'Hot Hits Atlanta - WAVA',
		defaultVolume = 0.8,
		timer = 0,
		simplePlayer = $('audio').get(0);

	$('#control').click(function() {
		if (simplePlayer.paused) {
//			simplePlayer.load();
			simplePlayer.play();
		} else {
			simplePlayer.pause();
		}
	});

	$(simplePlayer).bind('abort', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('canplay', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('canplaythrough', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('durationchange', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('ended', function(e) {
		console.log(e.type);
		$('#control span').removeClass().addClass('play');
//		simplePlayer.src = 'http://www.live365.com/play/'+config.station;
//		simplePlayer.load();
	});

	$(simplePlayer).bind('error', function(e) {
		console.log(e.type);
		console.log(simplePlayer.error);
		$('#control span').removeClass().addClass('error');
		$('#stations ul li').removeClass();
		$('#genres ul li').removeClass();
		$('#stations ul li[data-station="'+station+'"]').addClass('error');
		$('#genres ul li[data-station="'+station+'"]').addClass('error');

		setTimeout(function(){
			$('#control span').removeClass().addClass('play');
			$('#stations ul li').removeClass();
//			simplePlayer.load();
			if (!simplePlayer.paused) {
				simplePlayer.load();
				simplePlayer.play();
			} else {
				simplePlayer.pause();
			}
		}, 3000);
	});

	$(simplePlayer).bind('loadeddata', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('loadedmetadata', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('loadstar', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('pause', function(e) {
		console.log(e.type);
		$('#control span').removeClass().addClass('play');
		$('#stations ul li').removeClass();
		$('#genres ul li').removeClass();
	});

	$(simplePlayer).bind('play', function(e) {
		console.log(e.type);
		$('#control span').removeClass().addClass('buffer');
		$('#stations ul li').removeClass();
		$('#genres ul li').removeClass();
		$('#stations ul li[data-station="'+station+'"]').addClass('buffering');
		$('#genres ul li[data-station="'+station+'"]').addClass('buffering');
	});

	$(simplePlayer).bind('playing', function(e) {
		console.log(e.type);
		$('#control span').removeClass().addClass('pause');
		$('#stations ul li').removeClass();
		$('#genres ul li').removeClass();
		$('#stations ul li[data-station="'+station+'"]').addClass('playing');
		$('#genres ul li[data-station="'+station+'"]').addClass('playing');
	});

	$(simplePlayer).bind('progress', function(e) {
//				console.log(e.type);
	});

	$(simplePlayer).bind('ratechange', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('readystatechange', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('seeked', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('seeking', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('stalled', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('suspend', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('timeupdate', function(e) {
//				console.log(e.type);
	});

	$(simplePlayer).bind('volumechange', function(e) {
		console.log(e.type);
	});

	$(simplePlayer).bind('waiting', function(e) {
		console.log(e.type);
	});

	$('#stations, #genres').on('click', '.stations li', function(event) {
console.log($(this).attr('data-station'));
console.log(station);
		if ($(this).attr('data-station') == station) {
			if (simplePlayer.paused) {
//				simplePlayer.load();
				simplePlayer.play();
			} else {
				simplePlayer.pause();
			}
		} else {
			station = $(this).attr('data-station');
			simplePlayer.src = 'http://www.live365.com/play/'+station;
//			simplePlayer.load();
			simplePlayer.play();
console.log('to setStation station: '+station);
console.log('to setStation name: '+this);
console.log('to setStation name: '+$(this).find('h3').html());
			NowPlaying.setStation({station: station, name: $(this).find('h3').html()});
			Genres.setStation({station: station});
		}

		window.location.hash = '';
	});

	var myVar = setInterval(function(){
		var buffered = 0;
		if (simplePlayer.buffered != null && simplePlayer.buffered.length) {
			buffered = simplePlayer.buffered.end(simplePlayer.buffered.length -1);
		}

		$('#debug').html(
			'<div class="page">'+
				'timer: '+timer+'<br>'+
				'paused: '+simplePlayer.paused+'<br>'+
				'duration: '+simplePlayer.duration+'<br>'+
				'currentTime: '+simplePlayer.currentTime+'<br>'+
				'buffered: '+buffered+'<br>'+
//				'seekable: '+simplePlayer.seekable.end(0)+'<br>'+
				'readyState: '+simplePlayer.readyState+'<br>'+
				'preload: '+simplePlayer.preload+'<br>'+
				'currentSrc: '+simplePlayer.currentSrc+
			'</div>'
		);

		timer += 1;
	},1000);

//	simplePlayer.play();

	simplePlayer.volume = defaultVolume;
//	simplePlayer.src = 'http://currentstream1.publicradio.org:80';
	simplePlayer.src = 'http://www.live365.com/play/'+station;
//	simplePlayer.load();

console.log('Calling first time: '+station+', '+station_name);
	NowPlaying.setStation({station: station, name: station_name});

}(window, document, jQuery));


//
// Wikipedia
//
var wikiContent = function() {
	$('#wiki').html('<div class="page"></div>');
	var $wiki_content = $("#wiki .page");

	var draw = function(artist) {
		if (! artist) {
			$wiki_content.html('No results...');
			return;
		}

		artist = artist.toLowerCase();
		artist = artist.replace('$', 's');
		artist = artist.replace(/ \&.*/, '');
		artist = artist.replace(/ w\/ .*/, '');
		artist = artist.replace(/ f\/ .*/, '');
		artist = artist.replace(/ and .*/, '');
		artist = artist.replace(/ with .*/, '');
		artist = artist.replace(/ fea.*/, '');
		artist = artist.replace(/\/.*/, '');
		artist = StripAccents(artist);
console.log('wikiContent: draw('+artist+')');
		$.ajax({
			url: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=site:en.wikipedia.org "'+artist+'" singer OR band OR entertainer OR genres OR labels',
			dataType: 'jsonp',
			success: function(data) {
				var text = '',
					title = '',
					resultsLength = data.responseData.results.length;
				if (resultsLength > 0) {
					for (var i = 0; i < resultsLength; i++) {
						var xURL = decodeURI(data.responseData.results[i].unescapedUrl);
						var xTitle = decodeURI(data.responseData.results[i].titleNoFormatting);
//console.log('wikiContent: xTitle: '+artist);
						if (xTitle.toLowerCase().indexOf(artist.toLowerCase()) > -1) {
							text = xURL;
							title = text.substring(text.indexOf("wiki/") + 5);
							break;
						}
					}
				}
//console.log('wikiContent: title('+title+')');
				if (! title) {
					$wiki_content.html('No results...');
					return;
				}
				$wiki_content.html('Searching...');
//console.log('wikiContent: Searching...');
				$.ajax({
					url: 'http://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&rvprop=content&rvsection=0&rvlimit=1&callback=?&redirects',
					dataType: 'json',
					data: { titles: title },
					success: function(data) {
						for (pageid in data.query.pages) break;
						if (pageid == '-1')
						{
							$wiki_content.html('No results...');
							return;
						}
						$wiki_content.html('');
						var thistext = data.query.pages[pageid].revisions[0]['*'];
						thistext = thistext.replace(/{{.*?}}/g, '');
//console.log('wikiContent: calling wiki');
						$.ajax({
							url: 'http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?',
							dataType: 'json',
							data: { text: thistext },
							success: function(parsedata) {
								var pd = parsedata.parse.text['*'];
								pd = pd.replace("<p><br /></p>", '');
								var text = $('<div>' + pd + '</div>');
								$(text).find('a').removeAttr('href');
								if($(text).find('.infobox .image').parent().html()) {
									$wiki_content.append('<div style="float: right; width: 230px; margin: 0 0 5px 15px;">' + $(text).find('.infobox .image').parent().html() + '</div>');
								}
								$(text).find('table,sup,.error').remove();
								$wiki_content.append('<div class="subtitle">'+data.query.pages[pageid].title+'</div>')
									.append( $(text).find('p') )
									.append('<p><i>More from <a class="external" target="_blank" href="http://en.wikipedia.org/wiki/' + data.query.pages[pageid].title + '">Wikipedia*</a></i></p>');
								$('#wiki_footnote').append('<p style="margin-top: 2em;">*The above entry is from <a class="external" target="_blank" href="http://www.wikipedia.org/">Wikipedia</a>, the user-contributed, free encyclopedia. It is licensed under the terms of the <a class="external" target="_blank" href="http://www.gnu.org/copyleft/fdl.html">GNU Free Documentation License</a> or the <a class="external" target="_blank" href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike 3.0 Unported License</a>.</p>');
								var wImage = $('.image img', $wiki_content),
									wImageWidth = wImage.attr("width"),
									wImageHeight = wImage.attr("height");
								wImage.css({
									"margin" : "5px",
									"height" : (220 * wImageHeight) / wImageWidth + "px",
									"width" : "220px"
								});
								if(typeof(top.AdjHeight) !== "undefined"){
									top.AdjHeight();
								}
							}
						});
					}
				});
			}
		});
	};

	return {
		draw: draw
	};
}();


//
// Top Stations
//
(function($, window) {
	var document = window.document;
	var url = 'http://www.live365.com/cgi-bin/directory.cgi?site=xml&access=PUBLIC&rows=100&only=P';
	$.ajax({
		type: 'GET',
		url: 'proxy.php?url='+encodeURIComponent(url),
		contentType: 'text/xml',
		success: draw
	});

	function draw(data) {
		var xml = data.contents;
		var list = '';
		var count = 0;
		xml = xml.replace(/\<\!\[CDATA\[(.*)\]\]\>/g, "$1");
		$('#stations').append('<div class="container"></div>');

		$(xml).find('LIVE365_STATION').each(function(){
			var ele = $(this).find('STATION_TITLE').html();
			var stn = $(this).find('STATION_BROADCASTER').html();
			var des = $(this).find('STATION_DESCRIPTION').html();
			var gen = $(this).find('STATION_GENRE').html();
			list += '<li data-station="'+stn+'"><h3>'+ele+'</h3><p>'+des+'</p><p><em>'+gen+'</em></p></li>';
			count++;

			if (count % 5 == 0) {
				$('#stations .container').append('<div class="page"><ul class="stations">'+list+'</ul></div>');
				list = '';
				count = 0;
			}
		});

		Dots.init();
	}
})(jQuery, window);


//
// Tabs
//
(function(window, document, $, undefined) {

	$('#tabs > div').hide();
	$('#tabs > div:first').show();
	$('#tabs > ul li:first').addClass('selected');

	$('#tabs > ul li a').click(function(){
		$('#tabs > ul li').removeClass('selected');
		$(this).parent().addClass('selected');
		var currentTab = $(this).attr('href');
		$('#tabs > div').hide();
		$(currentTab).show();
		window.location.hash = 'navigation';

		return false;
	});

})(window, document, jQuery);


//
// StripAccents
//
var StripAccents = (function () {
  var in_chrs   = 'àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
      out_chrs  = 'aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY',
      chars_rgx = new RegExp('[' + in_chrs + ']', 'g'),
      transl    = {}, i,
      lookup    = function (m) { return transl[m] || m; };

  for (i=0; i<in_chrs.length; i++) {
    transl[ in_chrs[i] ] = out_chrs[i];
  }

  return function (s) { return s.replace(chars_rgx, lookup); }
})();


//
// Feedback
//
$(function() {

	$("#feedback button").click(function() {
		$('input[type="text"], textarea').removeClass();

		var name = $("input[name='name']");
		if (name.val() == "") {
			name.addClass('error');
			name.focus();
			return false;
		} else {
			name.addClass('good');
		}

		var email = $("input[name='email']");
		if (email.val() == "") {
			email.addClass('error');
			email.focus();
			return false;
		} else {
			email.addClass('good');
		}

		var comment = $("textarea[name='comment']");
		if (comment.val() == "") {
			comment.addClass('error');
			comment.focus();
			return false;
		} else {
			comment.addClass('good');
		}

		var dataString = 'name='+ name.val() + '&email=' + email.val() + '&comment=' + comment.val();

		$.ajax({
			type: "POST",
			url: "/bin/process.php",
			data: dataString,
			success: function() {
				$('form').html("<div id='message'></div>");
				$('#message').html("<h2>Feedback Form Submitted!</h2>")
					.append("<p>We will be in touch soon.</p>")
					.hide()
					.fadeIn(1500, function() {
						$('#message').append('<img id="checkmark" src="images/checkmark.png" width="40px">');
					});
			}
		});

		return false;
	});
});

