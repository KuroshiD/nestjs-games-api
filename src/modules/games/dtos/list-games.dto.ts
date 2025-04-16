import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ListGamesDto {
    @ApiProperty({
        description: "Filter by game name",
        example: "",
        required: false
    })
    @IsOptional()
    @IsString({ message: "Name must be a string" })
    name?: string;

    @ApiProperty({
        description: "Filter by platform",
        example: "",
        required: false
    })
    @IsOptional()
    @IsString({ message: "Platform must be a string" })
    platform?: string;

    @ApiProperty({ 
        required: false,
        description: 'Page number (starting from 1)', 
        default: 1, 
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "Page must be an integer" })
    @Min(1, { message: "Page must be at least 1" })
    page?: number = 1;

    @ApiProperty({ 
        required: false,
        description: 'Number of items per page', 
        default: 10, 
        type: Number
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "Limit must be an integer" })
    @Min(1, { message: "Limit must be at least 1" })
    limit?: number = 10;
}