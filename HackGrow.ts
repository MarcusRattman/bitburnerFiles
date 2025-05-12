export async function main(ns: NS) {
    while (true) {
        let hostname = ns.getHostname();
        let maxmoney = ns.getServerMaxMoney(hostname);
        let currmoney = ns.getServerMoneyAvailable(hostname);

        let scriptram = ns.getScriptRam("HackGrow.ts");
        let maxram = ns.getServerMaxRam(hostname);
        let threads = Math.floor(maxram / scriptram);

        while (
            ns.getServerSecurityLevel(hostname) >
            ns.getServerBaseSecurityLevel(hostname)
        ) {
            await ns.weaken(hostname, { threads });
        }

        if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(hostname)) {
            await ns.hack(hostname, { threads });
        }

        while (currmoney / maxmoney < 0.4) {
            await ns.grow(hostname, { threads });
        }

        await ns.sleep(100);
    }
}
