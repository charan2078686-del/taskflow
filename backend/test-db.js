const pool = require("./config/database");

async function testDatabase() {
    try {
        const result = await pool.query("SELECT current_database(), current_user");
        console.log("Database connected successfully");
        console.log(result.rows[0]);
    } catch (error) {
        console.error("Database connection failed");
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

testDatabase();
