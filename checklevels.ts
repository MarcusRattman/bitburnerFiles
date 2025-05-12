export async function main(ns: NS) {
    let hosts = crawler(ns, 5);
    let myLevel = ns.getHackingLevel();
    hosts = hosts.filter(
        (host) => host != "home" && ns.getServerMaxRam(host) != 0
    );
    hosts.sort((h1, h2) => {
        let reqLevel1 = ns.getServerRequiredHackingLevel(h1);
        let reqLevel2 = ns.getServerRequiredHackingLevel(h2);
        return reqLevel1 - reqLevel2;
    });
    hosts = hosts.filter(
        (host) => ns.getServerRequiredHackingLevel(host) > myLevel
    );
    hosts.forEach((host) => {
        let hostLevel = ns.getServerRequiredHackingLevel(host);
        ns.tprintf(`\'${host}\' level is ${hostLevel}`);
    });
}

export function crawler(ns: NS, depth: number, hosts?: string[]) {
    let h = ns.scan("home");
    let result = [...h];

    if (hosts) {
        h = [...hosts];
        result = [...hosts];
    }

    h.forEach((host) => {
        let neighbors = ns.scan(host).filter((n) => !h.includes(n));
        result = [...new Set(result.concat(neighbors))];
    });

    if (depth > 0) {
        return crawler(ns, depth - 1, result);
    }

    return [...new Set(result)];
}
