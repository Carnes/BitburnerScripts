# BitburnerScripts

Thought it would be fun to stash my Bitburner scripts in a real source control.

## Scripts
### cashstacks.js 
Automatically purchase and upgrade hacknet servers.  Recommend using is asap.  It takes about 4 hours to build into $4.000k/s cashflow.  Kill if you need money to build.
There are two variables you can use to steer it:
 - maxServers = 100; // Max nodes to purchase
 - maxSpend = 24000000 // Max allowed cost of upgrade/purchase

### tinyhack.js
2.45 GB hacking routine that starts with weaken, progresses to grow, and then begins hacking when money is high.  Run with max threads for best effect.  You'll get periodic toast notifications of hacking gains.  It takes a long time to weaken & grow servers enough to hack for max money.  So recommend this is run on every server as early as possible.

### spread.js
A kind of self-propagating worm.  It gains root on neighboring servers, copies itself plus tinyhack.js, and attempts to propagate further.  If a server doesn't have enough ram to run spread.js then tinyhack.js is run instead.

## Usage
When starting a new run, try this:
- in terminal: ./cashstacks.js
- in terminal: ./spread.js

When your hacking level goes up and you build more advanced programs to gain root then you can kill all scripts and rerun spread.js
