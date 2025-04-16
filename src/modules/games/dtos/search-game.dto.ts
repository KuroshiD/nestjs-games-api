import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SearchGameDto {
    @ApiProperty({
        description: "The title of the game to search for",
        example: "minecraft"
    })
    @IsNotEmpty({ message: "Title is required" }) 
    @IsString({ message: "Title must be a string" }) 
    title!: string;
}