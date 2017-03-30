# Tropo Emulator for Javascript

The emulator helps you check your JS scripts will execute successfully on the Tropo Scripting Cloud platform.


## Quick start

The emulator has been tested with the full set of [Tropo Ready samples](https://github.com/ObjectIsAdvantag/tropo-ready-vscode/tree/master/samples), 
but let's run it with the local samples for now:

```shell
> npm install -g tropo-emulator-js
> git clone https://github.com/ObjectIsAdvantag/tropo-ready-vscode
> cd tropo-ready-vscode
> cd samples
> tropoready 02-askforinput.js
[Tropo answers   ] ...
[Tropo asks      ] Hi. For sales, press 1. For support, press 2.
[User  chooses   ] ... choice: 1
[Tropo says      ] sales is not available right now.
[Tropo hangs up  ] ...
[      ALL DONE  ] simulation completed
```

If you already have a Tropo Voice Inbound script at hand, simply go with the commands below:

```shell
> npm install -g tropo-emulator-js
> tropoready <your-tropo-script.js>
...
[      ALL DONE  ] simulation completed
```

## How to test for Inbound/Outbound Tropo calls for Voice or SMS

The tropoready command emulates an Inbound Call by default.

For examples of Outbound and SMS calls, read through or [check the Makefile](tests/Makefile) located in the tests folder

```shell
> npm install -g tropo-emulator-js
> tropoready --help
Usage: tropoready [--script] <your-script.js>

Simulates a Tropo runtime environment to quickly check for obvious inconsistencies (syntax error, wrong arguments).
By default, starts the specified script in the context of a Tropo Inbound Voice call.

To test for an Outbound SMS call, try:
   > tropoready <your-script.js> --outbound --SMS

To pass parameters, try:
   > tropoready <your-script.js> --parameters "phonenumber=+33678007800" "msg=Hello world!"

Supported options:
   -c, --callerID '+33678007800' : sets the callerID for Inbound calls. Ignored if the call is Outbound
   --checkOptions                : if true, verifies that the script 'Choice Options' pattern are well-formed
   -h,--help                     : shows usage
   --initialText                 : set the specified initial text. Ignored if the call is not on a SMS channel
   -o, --outbound                : starts the script in the context of an outbound call
   -p, --parameters              : injects variables parameters, example: -p 'phonenumber=+33678007800'
   -s, --SMS                     : marks the call as a text channel, whether inbound or outbound
   [--script] filename.js        : specify the script to start. Note that the '--script' mention is optional
   -v,--version                  : shows version
```


### Outbound calls

Use the --outbound or -o option to emulate a Tropo Outbound Call.

If you need to [pass parameters](https://www.tropo.com/docs/scripting/quickstarts/making-call/passing-parameters) to your script, 
use the --parameters options

```shell
> npm install -g tropo-emulator-js
> git clone https://github.com/ObjectIsAdvantag/tropo-samples
> cd tropo-samples
> tropoready tests/send-sms.js --outbound --parameters "phonenumber=+33678007800" "msg=hello friends"
```


### Modify the callerID of a Tropo Inbound call

You can specify a callerID with the --callerID option

```shell
> npm install -g tropo-emulator-js
> git clone https://github.com/ObjectIsAdvantag/tropo-samples
> cd tropo-samples
> tropoready javascript/tutorial/13-callerid-reject.js
[Tropo rejects   ] ...
[      ALL DONE  ] simulation completed

> tropoready javascript/tutorial/13-callerid-reject.js --callerID "4075551111"
[Tropo answers   ] ...
[Tropo says      ] Hello world!
[Tropo hangs up  ] ...
[      ALL DONE  ] simulation completed
```

### SMS calls

Add the -s or --SMS option to start a test with a Tropo SMS Call (whether inbound or outbound)

```shell
> npm install -g tropo-emulator-js
> git clone https://github.com/ObjectIsAdvantag/tropo-samples
> cd tropo-samples

# Example with an SMS Outbound Call 
> tropoready samples/bidirectional-sms.js --SMS --outbound --parameters "toNumber=+33678007800"
[Tropo calls     ] +33678007800
[Tropo says      ] what about coffee ? (yes/no)
[      ALL DONE  ] simulation completed

# Example with an SMS Inbound Call 
> tropoready samples/bidirectional-sms.js --SMS --initialText "yes"
[Tropo says      ] go get some !
[      ALL DONE  ] simulation completed
```

## HTTP client API calls

Then comes the time where you want to invoke external APIs from your Tropo script.

As the Tropo Cloud platform runs your JS script on Rhino, you've not choice but to use the java.net bindings.

To make it more JS-friendly, this project proposes an HTTP client library inspired from the popular nodejs request.
Please meet [trequest](lib/trequest.js) for Tropo Request.

Here's a sample leveraging the trequest library to speak the number of stars of a Github project
```shell
> tropoready samples/speak-my-github-stars.js
[Tropo answers   ] ...
[Tropo waits     ] ... for 1000 milliseconds
[Tropo says      ] Welcome to Github Stars !
[Tropo waits     ] ... for 1000 milliseconds
[Tropo says      ] Asking GitHub...
[      LOG       ] fetched 8 star(s)
[Tropo says      ] Congrats, project has 8 stars says Github
[      ALL DONE  ] simulation completed
```

This other example takes an incoming Github account and project name, and responds its stars.
```shell
> tropoready samples/text-my-github-starts.js --SMS --initialText "CiscoDevNet awesome-ciscospark"
[      LOG       ] fetching GitHub starts for: CiscoDevNet/awesome-ciscospark
[      LOG       ] fetched 34 star(s)
[Tropo says      ] Congrats, project has 34 stars on Github
[      ALL DONE  ] simulation completed
```

To use the trequest library simply add it to your Tropo script.
Note that the tropoready command embedds the version of the library it mimics:

```shell
> tropoready --trequest > my-script.js
> cat my-script.js
```





