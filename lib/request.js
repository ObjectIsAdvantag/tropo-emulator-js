
var request_help = '// \n\
// request: \n\
//     a synchronous HTTP client library for Tropo, built in the "request" style \n\
// \n\
// options lets you specify HTTP headers and a read/connect timeout \n\
//      - method: GET, \n\
//      - url: destination \n\
//      - headers: set of HTTP key/values pairs \n\
//      - timeout: applies Connect and Read timeouts \n\
//      - onTimeout, onError, onResponse \n\
// \n\
// returns a result object with properties: \n\
//      - type: "response", "error" or "timeout" \n\
//      - response: only if the type is response, with properties \n\
//              - statusCode \n\
//              - headers \n\
//              - body \n\
//'


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

request.help = request_help;

module.exports = request;