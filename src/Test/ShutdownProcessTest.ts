setInterval(() => console.log("tick"), 5000);

process.on("SIGTERM", () => {
    console.log("shutdown");

    setTimeout(() => process.exit(), 5000);
});