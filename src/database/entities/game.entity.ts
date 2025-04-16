import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Game {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    title!: string;

    @Column({ nullable: true})
    description?: string;

    @Column('simple-array', { nullable: true })
    platforms?: string[];

    @Column({ type: 'date', nullable: true })
    releaseDate?: Date;

    @Column({ type: 'float', nullable: true })
    rating?: number;

    @Column({ nullable: true })
    imageUrl?: string;

}