import dataSource from "../../ormconfig"
import { seedBaseUser } from "./create-base-user.seed"

dataSource
    .initialize()
    .then(async () => {
        console.log("Data Source has been initialized!")
        await seedBaseUser(dataSource);
        process.exit(0)
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
        process.exit(1);
    })