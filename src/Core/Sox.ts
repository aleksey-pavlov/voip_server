import { exec } from "child_process";

export function gsmDuration(file: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {

        exec(`sox ${file} -n stat`, (error, stdout, stderr) => {

            if (error)
                return reject(error);

            let rows = stdout ? stdout.split("\n") : stderr ? stderr.split("\n") : [];
            for (let i in rows) {
                let pair = rows[i].split(":");
                if (pair[0].match("Length"))
                    return resolve(Number(pair[1]));
            }

            return resolve(0);
        });
    });
}

export function mixedFiles(file1: string, file2: string, fileout: string): Promise<void> {

    return new Promise<void>((resolve, reject) => {
        exec(`sox -M ${file1} ${file2} ${fileout}`, (err, stdout, stderr) => {

            if (err)
                return reject(err);

            return resolve();

        });
    });
}

