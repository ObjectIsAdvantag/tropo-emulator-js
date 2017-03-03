# Tropo Emulator for JS script

The emulator helps you check your script will execute successfully on the Tropo Javascript runtime.


## Quick start

The emulator has been tested against the [Tropo Javascript samples](https://github.com/tropo/tropo-samples),
extended with [SMS samples](https://github.com/ObjectIsAdvantag/tropo-samples).

```shell
> npm install -g tropo-emulator-js
> git clone https://github.com/ObjectIsAdvantag/tropo-samples
> cd tropo-samples
> tropoready javascript/tutorial/02-askforinput.js
[Tropo answers   ] ...
[Tropo asks      ] Hi. For sales, press 1. For support, press 2.
[User  chooses   ] ... choice: 1
[Tropo says      ] sales is not available right now.
[Tropo hangs up  ] ...
ALL GOOD !!!
```

If you already have a Tropo script at hand, simply go with
```shell
> npm install -g tropo-emulator-js
> tropoready <your-tropo-script.js>
...
ALL GOOD !!!
```

## How to test for Inbound/Outbound Tropo calls for Voice or SMS

The tropocheck command emulates an Inbound Call by default.

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
ALL GOOD !!!
> tropoready javascript/tutorial/13-callerid-reject.js --callerID "4075551111"
[Tropo answers   ] ...
[Tropo says      ] Hello world!
[Tropo hangs up  ] ...
ALL GOOD !!!
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
ALL GOOD !!!

# Example with an SMS Inbound Call 
> tropoready samples/bidirectional-sms.js --SMS --initialText "yes"
[Tropo says      ] go get some !
ALL GOOD !!!
```


