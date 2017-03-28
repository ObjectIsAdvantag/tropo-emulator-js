////////////////////////////////////////////////////////////////////////////////////
// trequest: an HTTP client library for Tropo, built in the "request" module style
//
// forges an HTTP request towards the specified URL, and invokes the callback
//
// options lets you specify HTTP headers and a read/connect timeout
//      - url: destination
//      - headers: set of HTTP key/values pairs
//      - timeout: applies Connect and Read timeouts
//
// callback signature is function(err, response, body)
//      - err.message: "java.net.SocketTimeoutException: Connect timed out"
//      - err.message: "java.net.SocketTimeoutException: Read timed out"
//
//      - response object containing the status code
//
//      - body contents are formatted string. When retrieving JSON data, simply use JSON.parse(body)
//
function trequest(options, cb) {
    // Tropo Emulator friendly: inject the trequest function when script is run locally
    if (global.trequest) {
        if (cb) {
            global.trequest(options, cb);
        }
        else {
            global.trequest(options);
        }
        return;
    }

    // we're now running on Tropo Scripting platform

    if (!options) {
        if (cb) cb(Error("Invalid arguments, expecting options at a minimum"), null, null);
        return;
    }

    var url = options.url;
    if (!url) {
        if (cb) cb(Error("Missing URL in options"), null, null);
        return;
    }

    var timeout = options.timeout ? options.timeout : 10000;

    // Fetch contents
    var res = {};
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
                        log("TREQUEST: headers property: " + property + " does not contain a string, ignoring...");
                    }
                    else {
                        connection.setRequestProperty(property, value);
                    }
                }
            }
        }

        connection.setDoOutput(false);
        connection.setDoInput(true);
        connection.setRequestMethod("GET");
        connection.setInstanceFollowRedirects(false);

        connection.connect();
        
        var statusCode = connection.getResponseCode();
        res.statusCode = statusCode;
        
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
            if (cb) cb(null, res, null);
        }
    }
    catch (err1) {
        log("TREQUEST: could not reach url, err: " + err1.message);
        if (cb) cb(err1, null, null);
        return;
    }

    if (cb) cb(null, res, contents);
}
//
///////////////////////////////////////////////////////////////////////////////////////