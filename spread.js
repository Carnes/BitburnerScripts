
export async function main(ns) {
	const spreadPayload = createPayload("spread.js", ["tinyhack.js","spread.js"]);//,"rcom.js"]);
	const tinyHackPayload = createPayload("tinyhack.js", ["tinyhack.js"], true);
	const serverBlacklist = ["home"];	
	const maxSpreadRetry = 3;

	var selfServer = ns.getServer();
	await spreadToNeighbors(selfServer, 1);
	if(serverBlacklist.some(s=> s== selfServer.hostname)){
		p("Finished at "+selfServer.hostname);
		ns.exit();
	}
	
	var cmd = JSON.stringify({command: "tinyhack", target: selfServer.hostname, killAllFirst: true});
	vexec("rcom.js", "home",1,cmd);
	//maxExec(selfServer, "tinyhack.js");
	ns.exit();

	function p(msg){
		ns.tprint(selfServer.hostname + "# " +msg);
	}

	function createPayload(entry, dependencies, execMaxThreads = false)
	{
		var deploy = function(server){
			var hostname = server.hostname;
			ns.scp(dependencies, hostname);
		};

		var pisRunning = function(server){
			var hostname = server.hostname;
			return dependencies.some(file => ns.isRunning(file, hostname));
		};

		var pkill = function(server){
			var hostname = server.hostname;
			for(var i = 0; i< dependencies.length; i++) {
				var file = dependencies[i];
				ns.kill(file, hostname);
			}
		};

		var pexec = function(server){
			if(execMaxThreads)
				maxExec(server, payload.entry);
			else
				vexec(payload.entry, server.hostname, 1);
		}

		var ramCost = ns.getScriptRam(entry);

		var targetHasRam = function(server){
			if(server.maxRam >= ramCost)
			{
				// p(server.hostname+": enough RAM("+ramCost+") for "+entry); // debug
				return true;
			}
			p(server.hostname+": not enough RAM("+ramCost+") for "+entry); // debug
			return false;
		}

		var payload = {
			entry: entry,
			dependencies: dependencies,
			deploy: deploy,
			pisRunning: pisRunning,
			pkill: pkill,
			pexec, pexec,
			toString: () => entry,
			targetHasRam: targetHasRam,
		};

		return payload;
	}	

	async function spreadToNeighbors(server, depth){
		p(server.hostname+" spreading from here!");
		depth--;
		if(depth < 0) return;
		let nodes = ns.scan(server.hostname);
		for (let i = 0; i < nodes.length; i++) {
			var node = ns.getServer(nodes[i]);
			if(serverBlacklist.some(s=> s==node.hostname)){
				p(node.hostname+" on blacklist, skip");
				continue;
			}
			ns.tprint("\n");
			await spread(node, 0);
		}
	}

	function getRoot(server)
	{
		server = ns.getServer(server.hostname);
		p(server.hostname+" getRoot");
		var portsRemaining = server.numOpenPortsRequired - server.openPortCount;

		try{

			if(portsRemaining > 0){
				p(portsRemaining+" ports remaining.  running: brutessh");
				ns.brutessh(server.hostname);
				portsRemaining--;
			}
			if(portsRemaining > 0){
				p(portsRemaining+" ports remaining.  running: ftpcrack");
				ns.ftpcrack(server.hostname);
				portsRemaining--;
			}
			if(portsRemaining > 0){
				p(portsRemaining+" ports remaining.  running: relaysmtp");
				ns.relaysmtp(server.hostname);
				portsRemaining--;
			}			
			if(portsRemaining > 0){
				p(portsRemaining+" ports remaining and no cracks left : (");
				return;
			}

			ns.nuke(server.hostname);
			p(server.hostname+" NUKE success! ");
		}
		catch(e){ 
			p("getRoot crash: "+server.hostname+" reason: "+e);
		 };
	}

	async function spread(server, attemptNum)
	{
		server = ns.getServer(server.hostname);
		attemptNum++;
		if(attemptNum > maxSpreadRetry)
		{
			p(server.hostname+": too many retries("+maxSpreadRetry+")");
			return false;
		}

		p(server.hostname+": attempting spread.."+ (attemptNum>0?" try x"+attemptNum:""));
		await ns.asleep(1000);

		if(server.requiredHackingSkill > ns.getHackingLevel()){
			p(server.hostname+": FAIL - hack skill too high." + server.requiredHackingSkill + " > " + ns.getHackingLevel());;
			await ns.asleep(1000);
			return false;
		}
		if(server.hasAdminRights == false) {
			p(server.hostname+": attempt to get root");
			await ns.asleep(1000);
			getRoot(server);
			return await spread(server, attemptNum);
		}

		if(spreadPayload.targetHasRam(server))
		{
			deployAndRun(server, spreadPayload);
			return true;
		}
		else if(tinyHackPayload.targetHasRam(server))
		{
			deployAndRun(server, tinyHackPayload);
			return true;
		}

		p(server.hostname+": spread fail.");
		return false;
	}	

	function maxExec(server, script){
		server = ns.getServer(server.hostname); // refresh server
		var ram = server.maxRam - server.ramUsed;
		var cost = ns.getScriptRam(script, server.hostname);
		var threads = Math.floor(ram/cost);
		if(threads < 1){
			p(server.hostname+": can't run " + script + ".  Not enough free ram. "+server.ramUsed+"/"+server.maxRam);
			return;
		}
		vexec(script, server.hostname, threads);
	}

	function vexec(script, hostname, threads=1, varg=null)
	{
		p(hostname+": running " + script + " (x"+threads+")");//+ (vargs.length>0 ?vargs.toString():""));
		if(varg!=null)
			ns.exec(script, hostname, threads, varg);
		else
			ns.exec(script, hostname, threads);
	}

	function deployAndRun(server, payload)
	{
		var hostname = server.hostname;
		if(payload.pisRunning(server))
		{
			p(server.hostname+": "+payload+" already running");
			return;
		}
		payload.pkill(server);
		payload.deploy(server);
		payload.pexec(server);
	}
}