import { exec } from "child_process";

exec(`sox ./assets/fb47fbe77587c1005d7a7711e89b8694.gsm -n stat`, (error, stdout, stderr) => {
    console.error(stdout);
    console.log(stderr);
});

