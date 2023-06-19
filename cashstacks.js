/** @param {NS} ns */
export async function main(ns) {
	function budget() {
		return ns.getServerMoneyAvailable("home");
	}

	var maxServers = 100;
	var maxSpend = 24000000

     ns.disableLog("getServerMoneyAvailable");
     ns.disableLog("asleep");

	while(true)
	{
		var estimates = getEstimates();
		if(estimates.length>0)
		{
			var cheapest = estimates.sort(sortByCost)[0];
			if(cheapest.cost > maxSpend)
			{
				ns.tprint("Cheapest upgrade is "+cheapest.cost+".  Exiting.");
				ns.exit();
			}
			if(cheapest.cost <= budget())
			{
				cheapest.buy();
			}
		}
		await ns.asleep(1000);
	}

	function getEstimates()
	{
		var estimates = [];
		if(ns.hacknet.numNodes() < maxServers)
			estimates.push(getNewNodeEstimate());
		for(var i=0; i<ns.hacknet.numNodes(); i++)
		{
			estimates.push(getNodeEstimate(i));
		}
		return estimates;
	}

	function getNewNodeEstimate(index)
	{
		var obj = {
			cost: ns.hacknet.getPurchaseNodeCost(),
			buy: ()=>ns.hacknet.purchaseNode(),
		};
		return obj;
	}

	function canLevelUp(index)
	{
		var stats = ns.hacknet.getNodeStats(index);
		var canLevelUp = stats.level < (ns.hacknet.numNodes() *10)+10;
		return canLevelUp;
	}

	function getNodeEstimate(index){

		var nodeEstimates = [
			{
				cost: ns.hacknet.getRamUpgradeCost(index, 1),
				buy: ()=>ns.hacknet.upgradeRam(index, 1),
			},
			{
				cost: ns.hacknet.getCoreUpgradeCost(index, 1),
				buy: ()=>ns.hacknet.upgradeCore(index, 1),
			},			
		];

		if(canLevelUp(index))
			nodeEstimates.push({
				cost: ns.hacknet.getLevelUpgradeCost(index, 1),
				buy: ()=>ns.hacknet.upgradeLevel(index, 1),
			});

		var cheapest = nodeEstimates.sort(sortByCost);
		return cheapest[0];
	}

	function sortByCost(a, b){
		if(a.cost < b.cost) return -1;
		if(a.cost > b.cost) return 1;
		return 0;
	}
}