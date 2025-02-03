export async function main(ns: NS) {
    let gang = ns.gang;
    let args = ns.args;

    if (args.length == 0) {
        ns.tprintf("WARN: No args specified.");
        ns.tprintf("INFO: List of all available commands:");
        ns.tprintf(`INFO: ${Object.keys(commandTaskMap)}`);
        return;
    }

    let command = args[0].toString().toLowerCase();

    if (!Object.keys(commandTaskMap).includes(command)) {
        ns.tprintf("ERROR: Incorrect command.");
        return;
    }

    let goons = gang.getMemberNames();

    for (let goon of goons) {
        commandTaskMap[command as commandType](ns, goon);
    }

    const miscCommands = [
        "ascend", "upgrade",
        "reset", "combat",
        "hacking", "charisma",
        "warfare", "ascup",
    ];

    if (!miscCommands.includes(command)) {
        let worst = getWorstGoon(ns);
        commandTaskMap.vigilante(ns, worst);
    }
}

function getWorstGoon(ns: NS) {
    let allGoons = ns.gang.getMemberNames();
    let worst = allGoons[0];

    allGoons.forEach(goon => {
        let prev = ns.gang.getMemberInformation(worst);
        let curr = ns.gang.getMemberInformation(goon);
        let prevStats = prev.agi + prev.def + prev.dex + prev.str;
        let currStats = curr.agi + curr.def + curr.dex + curr.str;

        if (currStats < prevStats) {
            worst = curr.name;
        }
    });

    return worst;
}

function setTask(ns: NS, goonName: string, taskName: string) {
    ns.gang.setMemberTask(goonName, taskName);
}

function goonAscend(ns: NS, goonName: string) {
    ns.gang.ascendMember(goonName);
    commandTaskMap.combat(ns, goonName);
}

function goonUpgrade(ns: NS, goonName: string) {
    let upgrades = ns.gang.getEquipmentNames();
    let goon = ns.gang.getMemberInformation(goonName);
    let cash = ns.getPlayer().money;

    for (let upgrade of upgrades) {
        let upgradeInstalled = goon.upgrades.includes(upgrade) || goon.augmentations.includes(upgrade);

        if (upgradeInstalled) {
            continue;
        }

        if (!upgradeInstalled && ns.gang.getEquipmentCost(upgrade) > cash) {
            ns.tprintf(`WARN: Not enough cash to buy '${upgrade}' for '${goonName}'`);
            return;
        }

        ns.gang.purchaseEquipment(goonName, upgrade);
    }
}

function goonAscendUpgrade(ns: NS, goonName: string) {
    goonAscend(ns, goonName);
    goonUpgrade(ns, goonName);
}

type commandType =
    "ascend" | "upgrade" | "ascup" |
    "reset" | "mug" | "drugs" | "strongarm" |
    "con" | "rob" | "arms" | "blackmail" |
    "traffick" | "terror" | "vigilante" | "combat" |
    "hacking" | "charisma" | "warfare";

const commandTaskMap: { [key in commandType]: (ns: NS, goonName: string) => void } = {
    "ascend": (ns: NS, goonName: string) => goonAscend(ns, goonName),
    "upgrade": (ns: NS, goonName: string) => goonUpgrade(ns, goonName),
    "ascup": (ns: NS, goonName: string) => goonAscendUpgrade(ns, goonName),
    "reset": (ns: NS, goonName: string) => setTask(ns, goonName, "Unassigned"),
    "mug": (ns: NS, goonName: string) => setTask(ns, goonName, "Mug People"),
    "drugs": (ns: NS, goonName: string) => setTask(ns, goonName, "Deal Drugs"),
    "strongarm": (ns: NS, goonName: string) => setTask(ns, goonName, "Strongarm Civilians"),
    "con": (ns: NS, goonName: string) => setTask(ns, goonName, "Run a Con"),
    "rob": (ns: NS, goonName: string) => setTask(ns, goonName, "Armed Robbery"),
    "arms": (ns: NS, goonName: string) => setTask(ns, goonName, "Traffick Illegal Arms"),
    "blackmail": (ns: NS, goonName: string) => setTask(ns, goonName, "Threaten & Blackmail"),
    "traffick": (ns: NS, goonName: string) => setTask(ns, goonName, "Human Trafficking"),
    "terror": (ns: NS, goonName: string) => setTask(ns, goonName, "Terrorism"),
    "vigilante": (ns: NS, goonName: string) => setTask(ns, goonName, "Vigilante Justice"),
    "combat": (ns: NS, goonName: string) => setTask(ns, goonName, "Train Combat"),
    "hacking": (ns: NS, goonName: string) => setTask(ns, goonName, "Train Hacking"),
    "charisma": (ns: NS, goonName: string) => setTask(ns, goonName, "Train Charisma"),
    "warfare": (ns: NS, goonName: string) => setTask(ns, goonName, "Territory Warfare"),
}

/* 
Unassigned,
Mug People,
Deal Drugs,
Strongarm Civilians,
Run a Con,
Armed Robbery,
Traffick Illegal Arms,
Threaten & Blackmail,
Human Trafficking,
Terrorism,
Vigilante Justice,
Train Combat,
Train Hacking,
Train Charisma,
Territory Warfare
*/