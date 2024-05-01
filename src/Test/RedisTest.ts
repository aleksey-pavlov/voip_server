import { DatabaseRedis } from "../Core/DatabaseRedis";

(async () => {

    let redis = new DatabaseRedis();

    console.log(await redis.set("test_set", 123));
    console.log(await redis.expire("test_set", 50));
    console.log(await redis.exists("test_set"));
    console.log(await redis.zAdd("test_zadd", 140, "140"));
    console.log(await redis.zAdd("test_zadd", 150, "150"));
    console.log(await redis.zLen("test_zadd"));
    console.log(await redis.zRangeAndRem("test_zadd", 1));
    console.log(await redis.zLen("test_zadd"));

    console.log(await redis.hSet("test_hash", "field1", "value1"));
    console.log(await redis.hGet("test_hash", "field1"));
    console.log(await redis.hGetAll("test_hash"));
    console.log(await redis.hDel("test_hash", "field1"));
})();