export async function main(ns) {
	var target = ns.getHostname();
	var serverMaxMoney = ns.getServerMaxMoney(target);
	var moneyThresh = serverMaxMoney * 0.75;
	var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
	var toastSpamDelayMinutes = 2;
	var toastDuration = 3000;
	var lastToastTime = addMinutes(new Date(), toastSpamDelayMinutes *-1);
	var pendingGains = 0;

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
		else if (Math.random() > (moneyAvailable / moneyThresh)) {
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