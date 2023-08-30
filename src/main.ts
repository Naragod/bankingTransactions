import { app, port } from "./server";

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
