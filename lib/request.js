
var request_help = "// request: \n\
// a synchronous HTTP client library for Tropo, built in the 'request' style \n\
// \n\
// forges an HTTP request towards the specified URL \n\
//      - method: GET, POST, PUT, DELETE or PATCH \n\
//      - url: Http endpoint you wish to hit \n\
//      - options lets you specify HTTP headers, timeouts... and callbacks \n\
//            * headers: set of HTTP key/values pairs \n\
//            * timeout: enforces Connect and Read timeouts, defaults to 10s \n\
//            * onTimeout(): function fired if the timeout expires \n\
//            * onError(err): function fired if an error occured \n\
//            * onResponse(response): function fired if the request is successful, see below for the structure of the response \n\
// \n\
// returns a result object with properties : \n\
//      - type: 'response', 'error' or 'timeout' \n\
//      - response: only if the type is 'response', with object properties: \n\
//            * statusCode: integer \n\
//            * headers: map of key/values pairs, values are either strings or arrays depending on the header \n\
//            * body: string \n\
//"


// request:
//     a synchronous HTTP client library for Tropo, built in the "request" style
//
// forges an HTTP request towards the specified URL
//      - method: GET, POST, PUT, DELETE or PATCH
//      - url: Http endpoint you wish to hit
//      - options lets you specify HTTP headers, timeouts... and callbacks
//            * headers: set of HTTP key/values pairs
//            * timeout: enforces Connect and Read timeouts, defaults to 10s
//            * onTimeout(): function fired if the timeout  expires
//            * onError(err): function fired if an error occured
//            * onResponse(response): function fired if the request is successful, see below for the structure of the response
//
// returns a result object with properties :
//      - type: 'response', 'error' or 'timeout'
//      - response: only if the type is 'response', with object properties:
//            * statusCode: integer
//            * headers: map of key/values pairs, values are either strings or arrays depending on the header
//            * body: string
//
// v0.4.0
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
    if ((method !== "GET") && (method !== "POST") && (method !== "PUT") && (method !== "DELETE") && (method !== "PATCH")) {
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

        connection.setDoInput(true);
        connection.setRequestMethod(method);
        connection.setInstanceFollowRedirects(false);

        if (options.headers) {
            for (var key in options.headers) {
                if (options.headers.hasOwnProperty(key)) {
                    // add header
                    var value = options.headers[key];
                    if (typeof value !== "string") {
                        log("REQUEST: headers key: " + key + " does not contain a string, ignoring...");
                    }
                    else {
                        connection.setRequestProperty(key, value);
                    }
                }
            }
        }
        if (options.json) {
             connection.setRequestProperty("Content-Type", "application/json");
        }
        
        if (options.body) {
            connection.setDoOutput(true);
            var payload = options.body;
            if (options.json) {
                payload = JSON.stringify(options.body);
            }
            var bodyWriter = connection.getOutputStream();
            org.apache.commons.io.IOUtils.write(payload, bodyWriter, "UTF-8");
            bodyWriter.flush();
            bodyWriter.close();
        }
        else {
            connection.setDoOutput(false);
            connection.connect();
        }

        var statusCode = connection.getResponseCode();
        result.response = { statusCode: statusCode };

        // Read response if exists
        var contents;
        if ((statusCode >= 200) && (statusCode < 300)) {
            var bodyReader = connection.getInputStream();
            contents = new String(org.apache.commons.io.IOUtils.toString(bodyReader, "UTF-8"));
        }
        else if ((statusCode >= 400) && (statusCode < 600)) {
            var bodyReader = connection.getErrorStream();
            if (bodyReader) {
                contents = new String(org.apache.commons.io.IOUtils.toString(bodyReader, "UTF-8"));
            }
        }
        result.response.body = contents;
        
        // Invoke response callback
        if (options.onResponse) {
            options.onResponse(result.response);
        }

        // Return response
        result.type = "response";
        return result;
    }
    catch (err) {
        log("REQUEST: could not reach url, err: " + err.message);

        // Invoke error callback
        if (options.onError) {
            options.onError(err);
        }

        // Return response
        result.type = "error";
        result.error = err;
        return result;
    }
}
//
///////////////////////////////////////////////////////////////////////////////////////

request.help = request_help;

module.exports = request;