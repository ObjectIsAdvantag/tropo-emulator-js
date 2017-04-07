/*
 * Copyright (c) 2017 Tropo, now part of Cisco
 * Released under the MIT license. See the file LICENSE
 * for the complete license
 */


////////////////////////////////////////////////////////////////////////////////////
// request: a synchronous HTTP client library for Tropo, built in the "request" style
//
// forges an HTTP request towards the specified URL, and invokes the callback
//
// options lets you specify HTTP headers and a read/connect timeout
//      - method: GET, 
//      - url: destination
//      - headers: set of HTTP key/values pairs
//      - timeout: applies Connect and Read timeouts
//      - onTimeout, onError, onResponse
//
// returns a result object with properties :
//      - type: 'response', 'error' or 'timeout'
//      - response: only if the type is response, with properties
//              - statusCode
//              - headers
//              - body
//
// v0.3.0
//
function request(method, url, options) {
    // Tropo Emulator friendly: inject the trequest function when script is run locally
    if (global.request) {
        return global.request(method, url, options);
    }

    // from now on, we're running on Tropo Scripting platform
    if (!method || !url) {
        throw Error("Invalid arguments, expecting method & url at a minimum");
    }
    if (method !== "GET") {
        throw Error("Method " + method + " is not supported");
    }

    // TODO: Check URL is not malformed

    // Default timeout
    var timeout = options.timeout ? options.timeout : 10000;

    // Fetch contents
    var result = {};
    var contents = null;
    var connection = null;
    try {
        connection = new java.net.URL(url).openConnection();
        connection.setConnectTimeout(timeout);
        connection.setReadTimeout(timeout);

        if (options.headers) {
            for (var property in options.headers) {
                if (options.hasOwnProperty(property)) {
                    // add header
                    var value = options.headers[property];
                    if (typeof value !== "string") {
                        log("REQUEST: headers property: " + property + " does not contain a string, ignoring...");
                    }
                    else {
                        connection.setRequestProperty(property, value);
                    }
                }
            }
        }

        connection.setDoOutput(false);
        connection.setDoInput(true);
        connection.setRequestMethod(method);
        connection.setInstanceFollowRedirects(false);

        connection.connect();

        var statusCode = connection.getResponseCode();
        result.response = { statusCode: statusCode };

        if ((statusCode >= 200) && (statusCode < 300)) {
            var bodyReader = connection.getInputStream();

            // [WORKAROUND] We cannot use a byte[], not supported on Tropo
            // var myContents= new byte[1024*1024];
            // bodyReader.readFully(myContents);
            contents = new String(org.apache.commons.io.IOUtils.toString(bodyReader));
        }
        else if ((statusCode >= 400) && (statusCode < 600)) {
            var bodyReader = connection.getErrorStream();

            // [WORKAROUND] We cannot use a byte[], not supported on Tropo
            // var myContents= new byte[1024*1024];
            // bodyReader.readFully(myContents);
            contents = new String(org.apache.commons.io.IOUtils.toString(bodyReader));
        }
        else {
            // No contents
            contents = null;
        }

        // Return response
        result.response.body = contents;
        if (options.onResponse) {
            options.onResponse(result.response);
        }

        result.type = "response";
        return result;
    }
    catch (err1) {
        log("REQUEST: could not reach url, err: " + err1.message);
        if (options.onError) {
            options.onError(err1);
        }

        result.type = "error";
        result.error = err1;
        return result;
    }
}
//
///////////////////////////////////////////////////////////////////////////////////////


// 
// This script speaks the current number of stars for a github project
//    - star/unstar the project on github and listen to the changes in real time
//    - uses the Tropo request library to forge HTTP requests
//

answer();
wait(1000);

say("Welcome to Github Stars !")
wait(1000);

say("Asking GitHub...")

var account = "ObjectIsAdvantag";
var project = "tropo-ready-vscode";
var result = request("GET", "https://api.github.com/repos/" + account + "/" + project, {
    headers: {
        // Github administrative rule: mandatory User-Agent header (http://developer.github.com/v3/#user-agent-required
        'User-Agent': 'Tropo'
    },
    timeout: 10000,
    onTimeout: function () {
        log("could not contact Github, timeout");
        say("sorry could not contact Github, try again later...");
        hangup();
    },
    onError: function (err) {
        log("could not contact Github, err: " + err.message);
        say("sorry could not contact Github, try again later...");
        hangup();
    }
    // for test purpose, it is one or another: onReponse or result.type
    //, onResponse: function (response) {
    //    var info = JSON.parse(response.body);
    //    log("fetched " + info.stargazers_count + " star(s)");
    //    say("Congrats, project has " + info.stargazers_count + " stars, says Github.");
    //    wait(1000);
    //}
});

if (result.type == "response") {
    switch (result.response.statusCode) {
        case 200:
            var info = JSON.parse(result.response.body);
            log("fetched " + info.stargazers_count + " star(s)");
            say("Congrats, your project counts " + info.stargazers_count + " stars.")
            wait(1000);
            break;
        default:
            log("github returned statusCode: " + result.response.statusCode);
            say("Sorry, could not retreive your project stars");
            wait(1000);
            break;
    }
}

say("Bye bye...")
wait(500);
