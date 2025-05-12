export async function main(ns: NS) {
    let print = ns.tprintf;
    let args = ns.args;
    let commands = Object.keys(commandMap);

    if (args.length == 0) {
        print(`Args supported: ${commands}.`);
        return;
    }

    let command = args[0].toString().toLowerCase();

    if (!commands.includes(command)) {
        print(`No such command.`);
        print(`Args supported: ${commands}.`);
        return;
    }

    commandMap[command](ns);
}

const commandMap: { [key: string]: (ns: NS) => void } = {
    "karma": (ns: NS) => getKarma(ns),
    "inf": (ns: NS) => getInfiltrations(ns),
    "gangtasks": (ns: NS) => check(ns),
}

function check(ns: NS) {
    let gang = ns.gang;
    let tasks = gang.getTaskNames().map(task => gang.getTaskStats(task));
    tasks.forEach(task => {
        let moneyGain = task.baseMoney * task.strWeight +
            task.baseMoney * task.defWeight +
            task.baseMoney * task.dexWeight +
            task.baseMoney * task.agiWeight +
            task.baseMoney * task.chaWeight +
            task.baseMoney * task.hackWeight

        ns.tprintf(`Base money: ${task.baseMoney}.`);
        ns.tprintf(`${task.name} str weight: ${task.strWeight}.`);
        ns.tprintf(`${task.name} def weight: ${task.defWeight}.`);
        ns.tprintf(`${task.name} dex weight: ${task.dexWeight}.`);
        ns.tprintf(`${task.name} agi weight: ${task.agiWeight}.`);
        ns.tprintf(`${task.name} cha weight: ${task.chaWeight}.`);
        ns.tprintf(`Money gain: ${moneyGain}.`);
        ns.tprintf(`///////////////////////////////////////////`);
    });
}

function getKarma(ns: NS) {
    let karma = ns.getPlayer().karma;
    ns.tprintf(`Karma: ${karma}`);
}

function getInfiltrations(ns: NS) {
    let infList = ns.infiltration.getPossibleLocations();
    let getInf = ns.infiltration.getInfiltration;
    infList = infList.sort((a, b) => {
        return getInf(b.name).difficulty - getInf(a.name).difficulty;
    });
    infList.forEach(i => {
        let loc = ns.infiltration.getInfiltration(i.name);
        ns.tprintf(`ERROR: /////////////////////////////`);
        ns.tprintf(`City: ${i.city}, Name: ${i.name}`);
        ns.tprintf(`Difficulty: ${loc.difficulty}`);
        ns.tprintf(`Max level: ${loc.maxClearanceLevel}`);
        ns.tprintf(`INFO: Anarchy rep: ${loc.reward.SoARep}`);
        ns.tprintf(`Cash: ${loc.reward.sellCash}`);
        ns.tprintf(`Rep: ${loc.reward.tradeRep}\n`);
    });
}
