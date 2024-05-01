import * as mysql from "mysql";

export class DatabaseMysql {

    private pool: mysql.Pool;

    public constructor(configUri: string) {
        this.pool = mysql.createPool(configUri);
    }

    private async getConnection(): Promise<mysql.PoolConnection> {
        return new Promise<mysql.PoolConnection>((resolve, reject) => {
            this.pool.getConnection((error, connection) => {
                if (error) {
                    reject(error);
                }

                resolve(connection);
            });
        });
    }

    public async query(sql: string, params: any[]) {
        let connection = await this.getConnection();
        return new Promise<any>((resolve, reject) => {
            connection.query(sql, params, (error, result) => {
                connection.release();
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
        });
    }

    public async close() {
        let connection = await this.getConnection();
        connection.destroy();
    }

    public getConfigDBName() 
    {
        return this.pool.config['connectionConfig']['database'];
    }
}

export class DiStatTables {
    public static Messages = "messages";
    public static Voices = "voices";
}