export function getProcessArgv(name: string) {
    let argvName = "--" + name;
    if (process.argv.indexOf(argvName) != -1) {
        return process.argv[process.argv.indexOf(argvName) + 1];
    }
    return null;
}

export function getProcessVar(name: string) {
    let argv = getProcessArgv(name);

    if (argv !== null) {
        return argv;
    }

    return process.env[name];
}