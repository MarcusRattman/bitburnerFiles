export async function main(ns: NS) {
    let hosts = crawler(ns, 50);
    hosts = hosts.filter(host => host != "home" && ns.getServerMaxRam(host) != 0);
    hosts.sort((h1, h2) => {
        let reqLevel1 = ns.getServerRequiredHackingLevel(h1);
        let reqLevel2 = ns.getServerRequiredHackingLevel(h2);
        return reqLevel1 - reqLevel2;
    });

    hosts.forEach((host) => {
        getRoot(ns, host);

        let cost = ns.getScriptRam("HackGrow.ts", "home");
        let serverRam = ns.getServerMaxRam(host);

        if (serverRam < cost) {
            ns.tprintf(`ERROR: Not enough RAM to run this script on ${host}: ${cost} / ${serverRam}`);
            return;
        }

        ns.scp("HackGrow.ts", host, "home");
        ns.killall(host);

        let threads = Math.floor((serverRam / cost));

        if (threads > 0) {
            ns.exec("HackGrow.ts", host, threads);
        }
    });
}

export function crawler(ns: NS, depth: number, hosts?: string[]) {
    let h = ns.scan("home");
    let result = [...h]

    if (hosts) {
        h = [...hosts];
        result = [...hosts];
    }

    h.forEach(host => {
        let neighbors = ns.scan(host).filter(n => !h.includes(n));
        result = [...new Set(result.concat(neighbors))];
    });

    if (depth > 0) {
        return crawler(ns, depth - 1, result)
    }

    return [...new Set(result)];
}

interface protocol {
    "portClosed": boolean,
    "canHack": boolean,
    "hack": (host: string) => void,
}

export function getRoot(ns: NS, name: string) {
    if (ns.hasRootAccess(name)) {
        return;
    }

    let myFiles = ns.ls("home").join(",");
    let myHackLevel = ns.getHackingLevel();
    let srvHackLevel = ns.getServerRequiredHackingLevel(name);
    let serverToHack = ns.getServer(name);
    let portsReq = ns.getServerNumPortsRequired(name);

    if (srvHackLevel > myHackLevel) {
        ns.tprintf(`WARN: Level too low to hack ${name}: ${myHackLevel} / ${srvHackLevel}`);
        return;
    }

    let hackRequired = portsReq > 0;

    let ports: { [key: string]: protocol } = {
        "SSH": {
            "portClosed": !serverToHack.sshPortOpen,
            "canHack": myFiles.includes("SSH"),
            "hack": ns.brutessh,
        },
        "FTP": {
            "portClosed": !serverToHack.ftpPortOpen,
            "canHack": myFiles.includes("FTP"),
            "hack": ns.ftpcrack,
        },
        "SMTP": {
            "portClosed": !serverToHack.smtpPortOpen,
            "canHack": myFiles.includes("SMTP"),
            "hack": ns.relaysmtp,
        },
        "HTTP": {
            "portClosed": !serverToHack.httpPortOpen,
            "canHack": myFiles.includes("HTTP"),
            "hack": ns.httpworm,
        },
        "SQL": {
            "portClosed": !serverToHack.sqlPortOpen,
            "canHack": myFiles.includes("SQL"),
            "hack": ns.sqlinject,
        },
    };

    let portsHacked = 0;

    for (let key of Object.keys(ports)) {
        let port = ports[key];

        if (!port.canHack) {
            ns.tprintf(`ERROR: Lacking malware to hack '${key}' port on ${name}`);
            continue;
        }

        if (!port.portClosed) {
            ns.printf(`INFO: Hacking not needed for ${key} of ${name}`);
            portsHacked += 1;
            continue;
        }

        if (hackRequired && port.portClosed && port.canHack) {
            port.hack(name);
            portsHacked += 1;
            continue;
        }
    }

    if (portsHacked >= portsReq) {
        ns.nuke(name);
    }
}

