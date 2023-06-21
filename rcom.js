/** @param {NS} ns */
export async function main(ns) {
	ns.tryWritePort(11, ns.args[0]);
}