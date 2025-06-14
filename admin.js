jQuery(document).ready(function ($) {

	// Handle tabs
	$('#merge-minify-refresh .nav-tab').on('click', function () {
		$(this).parent().find('.nav-tab').removeClass('nav-tab-active');
		$(this).addClass('nav-tab-active')
		if ($(this).attr('id') == "mmr-tab1") {
			$('#mmr-tab2-content').hide();
			$('#mmr-tab1-content').show();
		}
		else {
			$('#mmr-tab1-content').hide();
			$('#mmr-tab2-content').show();
		}
		return false;
	});
	$('#mmr-tab1').trigger('click');

	var $mmr_processed = $('#mmr_processed'),
		$mmr_jsprocessed = $('#mmr_jsprocessed', $mmr_processed),
		$mmr_jsprocessed_ul = $('ul', $mmr_jsprocessed),
		$mmr_cssprocessed = $('#mmr_cssprocessed', $mmr_processed),
		$mmr_cssprocessed_ul = $('ul', $mmr_cssprocessed),
		stamp = null;

	$mmr_processed.on('click', '.log', function (e) {
		e.preventDefault();
		$(this).parent().nextAll('pre').slideToggle();
	});

	$mmr_processed.on('click', '.purge', function (e) {
		e.preventDefault();
		getFiles({ purge: $(this).attr('href').substr(1) });
		$(this).parent().parent().remove();
	});

	$('.purgeall', $mmr_processed).on('click', function (e) {
		e.preventDefault();
		getFiles({ purge: 'all' }, function () {
			$mmr_jsprocessed_ul.html('');
			$mmr_jsprocessed.find('.noprocess_msg').html('None');
			$mmr_cssprocessed_ul.html('');
			$mmr_cssprocessed.find('.noprocess_msg').html('None');
		});
	});

	$('.refresh', $mmr_processed).on('click', function (e) {
		e.preventDefault();
		getFiles();
	});

	function processResponse(response, $ul) {
		$(response).each(function () {
			var $li = $ul.find('li.' + this.hash);
			if ($li.length > 0) {
				var $filename = $li.find('.filename');
				if ($filename.text() != this.filename) {
					$filename.html(this.filename);
				}
				if ($li.find('pre').text() != this.log) {
					$li.find('pre').html(this.log);
				}
				if ($li.find('.accessed').text() != 'Last Accessed: ' + this.accessed) {
					$li.find('.accessed').html('Last Accessed: ' + this.accessed);
				}
				if (this.error) {
					$filename.addClass('error');
				}
				else {
					$filename.removeClass('error');
				}
			}
			else {
				$ul.append('<li class="' + this.hash + '"><span class="filename' + (this.error ? ' error' : '') + '">' + this.filename + '</span> <span class="accessed">Last Accessed: ' + this.accessed + '</span> <span class="actions"><a href="#" class="log button button-primary">View Log</a> <a href="#' + this.hash + '" class="button button-secondary purge">Purge</a></span><pre>' + this.log + '</pre></li>');
			}
		});
	}

	function getFiles(extra, onComplete) {
		stamp = new Date().getTime();
		var data = {
			'action': 'mmr_files',
			'stamp': stamp
		};
		if (extra) {
			for (var attrname in extra) { data[attrname] = extra[attrname]; }
		}

		let blocker = new Blocker(document.getElementById("mmr_processed"));
		blocker.showLoader();

		$.post(ajaxurl, data, function (response) {
			if (stamp == response.stamp) //only update when request is the latest
			{
				if (response.js.length > 0) {
					$mmr_jsprocessed.find('.noprocess_msg').html('');
					processResponse(response.js, $mmr_jsprocessed_ul);
				}
				else {
					$mmr_jsprocessed.find('.noprocess_msg').html('None');
				}

				if (response.css.length > 0) {
					$mmr_cssprocessed.find('.noprocess_msg').html('');
					processResponse(response.css, $mmr_cssprocessed_ul);
				}
				else {
					$mmr_cssprocessed.find('.noprocess_msg').html('None');
				}

				blocker.hideLoader();
				$('#mmr_refreshed').text("Last refreshed " + new Date(stamp).toLocaleTimeString());
			}
			if (onComplete) {
				onComplete();
			}
		});
	}
	getFiles();

	// Modified from https://onezeronull.com/2013/03/25/simple-element-blocker-with-and-without-jquery/
	function Blocker(_blockedElement) {
		this.blockedElement = _blockedElement;

		this.showLoader = function () {
			// Use the default WP admin spinner
			var cssString = "background:url(/wp-admin/images/loading.gif) no-repeat center center;background-color:white;opacity:0.5;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0";

			this.theBlocker = document.createElement('div');
			this.theBlocker.style.cssText = cssString;

			// Make sure the position is set to relative
			this.blockedElement.style.position = "relative";
			this.blockedElement.appendChild(this.theBlocker);
		};

		this.hideLoader = function () {
			this.blockedElement.removeChild(this.theBlocker);
		};
	}
});