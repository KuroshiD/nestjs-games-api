import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../entities/user.entity";

export const seedBaseUser = async (dataSource: DataSource) => {
    const userRepository = dataSource.getRepository(User);

    try {
        const hashedPassword = await bcrypt.hash('admin', 10)

        const user = userRepository.create({
            username: 'admin',
            email: "admin@admin.com",
            password: hashedPassword,
        })

        await userRepository.save(user);
        console.log('Base user seeded successfully!');
    } catch (error) {
        console.error('Error seeding base user:', error);
    }
}