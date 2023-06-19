export async function main(ns) {
	var target = ns.getHostname();
	var serverMaxMoney = ns.getServerMaxMoney(target);
	var moneyThresh = serverMaxMoney * 0.75;
	var moneyHardThresh = serverMaxMoney * 0.25;
	var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
	var toastSpamDelayMinutes = 2;
	var toastDuration = 3000;
	var lastToastTime = addMinutes(new Date(), toastSpamDelayMinutes *-1);
	var pendingGains = 0;

	ns.disableLog("getServerSecurityLevel");

	while(true) {
		var moneyAvailable = ns.getServerMoneyAvailable(target);
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			await ns.weaken(target);
		}
		else if (moneyAvailable < moneyHardThresh) {
			await ns.grow(target);
		}
		else if (Math.random() > (moneyAvailable / moneyThresh)) {
			await ns.grow(target);
		}
		else {
			var gains = await ns.hack(target);
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
			var gains = Math.floor(pendingGains);
			pendingGains = 0;
			lastToastTime = new Date();
			ns.toast("Hacked $"+gains+" from "+target, "success", toastDuration);
		}
	}
}