export async function main(ns: NS) {
    let upgraded: number[] = [];
    let args = ns.args || [];
    let numNodes = ns.hacknet.numNodes();

    while (upgraded.length < numNodes) {
        for (let i = 0; i < numNodes; i++) {
            if (upgraded.includes(i)) {
                continue;
            }

            let levelCost = ns.hacknet.getLevelUpgradeCost(i);
            let coreCost = ns.hacknet.getCoreUpgradeCost(i);
            let ramCost = ns.hacknet.getRamUpgradeCost(i);
            let cash = ns.getPlayer().money;

            if (levelCost == Infinity && coreCost == Infinity && ramCost == Infinity) {
                upgraded.push(i);
                continue;
            }

            if (levelCost != Infinity && cash >= levelCost) {
                ns.printf(`Upgrading Level of Node #${i}`);
                ns.hacknet.upgradeLevel(i);
            }

            if (coreCost != Infinity && cash >= coreCost) {
                ns.printf(`Upgrading Core of Node #${i}`);
                ns.hacknet.upgradeCore(i);
            }

            if (ramCost != Infinity && cash >= ramCost) {
                ns.printf(`Upgrading RAM of Node #${i}`);
                ns.hacknet.upgradeRam(i);
            }

            if (numNodes < ns.hacknet.maxNumNodes() &&
                cash >= ns.hacknet.getPurchaseNodeCost() &&
                args.includes("buy")) {

                ns.printf(`Buying a new Node #${numNodes + 1}`);
                ns.hacknet.purchaseNode();
                numNodes += 1;
                continue;
            }
        }

        await ns.sleep(200);
    }

    ns.tprintf(`Finished upgrading the Hacknet network.`);
}