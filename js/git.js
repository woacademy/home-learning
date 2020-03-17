/**
 * leona.js
 * Several functions for fetching and displaying the current list of home learning resources.
 *
 * Note: `XMLHTTPRequest` has been used in place of `fetch` due to limited compatibility on older browsers.
 */
const GITHUB_USER = 'woacademy';
const GITHUB_REPO = 'home-learning';

/**
 * Generate the file hierarchy.
 * 
 * @param {Object} hierarchy HTML string representing the file hierarchy.
 * @param {String} Parent directory to use when constructing anchor href.
 */
function formatHierarchy(hierarchy, parentdir) {
    var hierarchyElement = document.createElement('pre');
    hierarchyElement.innerHTML = hierarchy;

    // Remove directory anchors (TODO: this is really bad...)
    var hold = true;
    while (hold) {
        var changed = false;
        var anchors = hierarchyElement.getElementsByTagName('a');
        Array.prototype.forEach.call(anchors, function(anchor) {
            console.log(anchor.href);
            if (/\/$/.test(anchor.href)) {
                console.log(anchor.innerHTML);
                var replacement = document.createElement('span');
                replacement.innerHTML = '<strong>' + anchor.innerHTML + '</strong>';

                anchor.parentNode.replaceChild(replacement, anchor);
                changed = true;
                return;
            }
        });

        if (!changed)
            hold = false;
    }

    // Fix file anchors.
    var files = hierarchyElement.getElementsByTagName('a');
    Array.prototype.forEach.call(anchors, function(anchor) {
        anchor.href = 'https://woacademy.github.io/home-learning/Resources/' + parentdir + anchor.href.slice(27);
        anchor.innerHTML = '<em>' + anchor.innerHTML + '</em>';
    });

    return hierarchyElement.outerHTML;
}

/**
 * Fetch a specified version of the file hierarchy from GitHub.
 * 
 * @param {String} sha SHA of the GitHub revision to fetch.s
 */
function fetchHierarchy(sha) {
    var ks3 = new XMLHttpRequest();
    ks3.open('GET', 'https://raw.githubusercontent.com/' + GITHUB_USER +  '/' + GITHUB_REPO + '/' + sha + '/treeks3.html');
    ks3.send();
    ks3.onload = function() {
            var ks3hierarchy = formatHierarchy(ks3.responseText, 'KS3/');
            document.getElementById(GITHUB_REPO).innerHTML += '<h2>KS3</h2><br>' + ks3hierarchy + '<br><hr><br>';
			
			var ks4 = new XMLHttpRequest();
			ks4.open('GET', 'https://raw.githubusercontent.com/' + GITHUB_USER +  '/' + GITHUB_REPO + '/' + sha + '/treeks4.html');
			ks4.send();
			ks4.onload = function() {
				var ks4hierarchy = formatHierarchy(ks4.responseText, 'KS4/');
				document.getElementById(GITHUB_REPO).innerHTML += '<h2>KS4</h2><br>' + ks4hierarchy;
			};
    };
}

/**
 * Display the latest SHA and rate limit information (debug only?).
 * 
 * @param {String} sha SHA of the GitHub being used.
 */
function displayInfo(sha, extra) {
    var rateLimit = new XMLHttpRequest();
    rateLimit.open('GET', 'https://api.github.com/rate_limit');
    rateLimit.send();
    rateLimit.onload = function() {
        var rateLimitJSON = JSON.parse(rateLimit.responseText);

        if (sha == 'master' || Math.round((+ new Date() - new Date(extra.commit.committer.date).getTime()) / 1000) > 300) {
            document.getElementById(GITHUB_REPO).innerHTML += '<div id="sha"><strong><a id="update" href="http://www.woacademy.co.uk/wp-content/uploads/2020/03/coronavirus-update-17032020.pdf">Please click here to view our latest update regarding the coronavirus (COVID-19) disease.</a></strong><br><br><i class="fa fa-info-circle fa-fw" aria-hidden="true"></i> Home Learning resources can be found below, they are updated once an hour on the hour.<br>'
                + '<i class="fa fa-exclamation-triangle fa-fw" aria-hidden="true"></i> Current version: ' + sha + ' (l=' + rateLimitJSON.resources.core.remaining + ';r=' + (rateLimitJSON.resources.core.reset - Math.round(+new Date() / 1000)) + ')</div><br>';

            fetchHierarchy(sha);
        } else {
            document.getElementById(GITHUB_REPO).innerHTML += '<div id="shabad"><strong><a id="update" href="http://www.woacademy.co.uk/wp-content/uploads/2020/03/coronavirus-update-17032020.pdf">Please click here to view our latest update regarding the coronavirus (COVID-19) disease.</a></strong><br><br><i class="fa fa-info-circle fa-fw" aria-hidden="true"></i> Resources have recently been synced, please wait another ' + (Math.round((5 - ((+ new Date() - new Date(extra.commit.committer.date).getTime()) / 60000)) * 100) / 100) + ' minutes for them to be displayed below.<br>'
                + '<i class="fa fa-exclamation-triangle fa-fw" aria-hidden="true"></i> Current version: ' + sha + ' (l=' + rateLimitJSON.resources.core.remaining + ';r=' + (rateLimitJSON.resources.core.reset - Math.round(+new Date() / 1000)) + ')</div><br>';
        }
    }
}

/**
 * Fetch the latest commit SHA using the GitHub API. This approach prevents the hierarchy becoming stale due to caching.
 */
(function fetchLatestCommit() {
    var request = new XMLHttpRequest();
    request.open('GET', 'https://api.github.com/repos/' + GITHUB_USER + '/' + GITHUB_REPO + '/commits/master');
    request.send();
    request.onload = function() {
        displayInfo(request.status == 200 ? JSON.parse(request.responseText).sha : 'master', JSON.parse(request.responseText));
    };
})();
