/** @param {NS} ns */
export async function main(ns) {
	ns.clearPort(11);
	while(true){	
		try{	
		var request = ns.readPort(11);
		if(request != "NULL PORT DATA")
			handleRequest(JSON.parse(request));
		}
		catch(e){
			p(e);
		}
		await ns.asleep(1000);
	}

	function handleRequest(request){
		printRequest(request);
		if(request.killAllFirst)
			ns.killall(request.target);
		if(request.command == "tinyhack")
			maxExec(request.target, "tinyhack.js")
	}

	function maxExec(hostname, script){
		var server = ns.getServer(hostname);
		var ram = server.maxRam - server.ramUsed;
		var cost = ns.getScriptRam(script, server.hostname);
		var threads = Math.floor(ram/cost);
		if(threads < 1){
			p(server.hostname+": can't run " + script + ".  Not enough free ram. "+server.ramUsed+"/"+server.maxRam);
			return;
		}
		rexec(script, server.hostname, threads);
	}

	function rexec(script, hostname, threads)
	{
		p(hostname+": running " + script + " (x"+threads+")");
		ns.exec(script, hostname, threads);
	}

	function p(msg){
		ns.tprint(msg);
	}

	function printRequest(r){
		p(r.command + " " + r.target);
	}
}