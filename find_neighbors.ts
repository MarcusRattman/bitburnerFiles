export async function main(ns: NS) {
    if (ns.args) {
        let server = ns.args[0].toString();
        let neighbors = ns.scan(server);
        ns.tprint(neighbors);
    } else {
        ns.tprintf(`No args specified`);
    }
}
