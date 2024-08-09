import express from "express";

const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

export default app;