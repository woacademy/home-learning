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
 * @param {Object} hierarchy JSON Object representing a level of the file hierarchy.
 * @param {String} current The current hierarchy HTML.
 */
function generateHierarchy(hierarchy, current) {
    current += '<li><i class="fa fa-folder-open" aria-hidden="true"></i> <strong>' + hierarchy.dirname + '</strong><ul>';

    // Display files.
    hierarchy.files.forEach(function(file) {
        current += '<li><i class="fa fa-file-pdf" aria-hidden="true"></i> <a href="https://woacademy.github.io/' + GITHUB_REPO + '/' + encodeURI(file.filepath) + '">' + file.filename + '</a>' + '</li>';
    });

    // Recursively display folders.
    hierarchy.dirs.forEach(function(dir) {
        current += generateHierarchy(dir, '');
    });

    current += '</ul></li>';
    return current;
}

/**
 * Fetch a specified version of the file hierarchy from GitHub.
 * 
 * @param {String} sha SHA of the GitHub revision to fetch.
 */
function fetchHierarchy(sha) {
    var request = new XMLHttpRequest();
    request.open('GET', 'https://raw.githubusercontent.com/' + GITHUB_USER +  '/' + GITHUB_REPO + '/' + sha + '/tree.html');
    request.send();
    request.onload = function() {
            //var hierarchy = generateHierarchy(JSON.parse(request.responseText), '');
            document.getElementById(GITHUB_REPO).innerHTML += '<pre>' + request.responseText + '</pre>';
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
            document.getElementById(GITHUB_REPO).innerHTML += '<div id="sha"><i class="fa fa-info-circle fa-fw" aria-hidden="true"></i> home-learning@' + sha + '<br>'
                + '<i class="fa fa-exclamation-triangle fa-fw" aria-hidden="true"></i> l=' + rateLimitJSON.resources.core.remaining + ';r=' + (rateLimitJSON.resources.core.reset - Math.round(+new Date() / 1000)) + '</div><br>';

            fetchHierarchy(sha);
        } else {
            document.getElementById(GITHUB_REPO).innerHTML += '<div id="shabad"><i class="fa fa-exclamation-triangle fa-fw" aria-hidden="true"></i> Resources have recently been synced, please allow up to 5 minutes for them to be displayed below. (l=' + rateLimitJSON.resources.core.remaining + ';r=' + (rateLimitJSON.resources.core.reset - Math.round(+new Date() / 1000)) + ';t=' + Math.round((+ new Date() - new Date(extra.commit.committer.date).getTime()) / 1000) + ')</div><br>';
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
