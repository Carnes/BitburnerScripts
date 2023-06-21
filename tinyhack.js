export async function main(ns) {	
	var target = ns.args[0] || ns.getHostname();
	var serverMaxMoney = ns.getServerMaxMoney(target);
	var moneyThreshOnlyGrow = serverMaxMoney * 0.10;
	var moneyThreshOnlyHack = serverMaxMoney * 0.80;
	var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
	var toastSpamDelayMinutes = 2;
	var toastDuration = 3000;
	var lastToastTime = addMinutes(new Date(), toastSpamDelayMinutes *-1);
	var pendingGains = 0;
	var randomGrowBonus = 0.2;

	if(serverMaxMoney == 0)
	{
		ns.tprint(target + " has no money to hack.");
		ns.exit();
	}

	ns.disableLog("getServerSecurityLevel");

	while(true) {
		var moneyAvailable = ns.getServerMoneyAvailable(target);
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			await ns.weaken(target);
		}
		else if (moneyAvailable < moneyThreshOnlyGrow) {
			await ns.grow(target);
		}		
		else if (moneyAvailable < moneyThreshOnlyHack && Math.random() +randomGrowBonus > (moneyAvailable / moneyThreshOnlyHack)) {
			await ns.grow(target);
		}
		else {
			var gains = await ns.hack(target);
			if(gains > 0 || pendingGains > 0)
				toast(gains);
		}
	}	

	function addMinutes(date, minutes) {
		return new Date(date.getTime() + minutes*60000);
	}

	function toast(newGains)
	{
		pendingGains += newGains;
		if(addMinutes(lastToastTime, toastSpamDelayMinutes) < new Date())
		{
			var gains = Math.floor(pendingGains).toLocaleString();
			pendingGains = 0;
			lastToastTime = new Date();
			ns.toast("Hacked $"+gains+" from "+target, "success", toastDuration);
		}
	}
}