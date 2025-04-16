import { Controller, Get, Query, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { GameService } from './games.service';
import { SearchGameDto } from './dtos/search-game.dto';
import { ApiOperation, ApiTags, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ListGamesDto } from './dtos/list-games.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiAuth } from '../auth/decorators/api-auth.decorator';


@ApiTags("Games")
@Controller("games")
export class GameController {
    constructor(private readonly GameService: GameService) { }

    @Get('/search')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiAuth('search a game by title')
    @ApiResponse({ status: 200, description: 'Game information returned successfully' })
    @ApiQuery({ name: 'title', required: true, description: 'Game title to search for' })
    async searchGames(@Query() SearchGameDto: SearchGameDto) {
        const { title } = SearchGameDto;   
        return await this.GameService.searchGames(title);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiAuth('List all games with optional filters')
    @ApiResponse({ status: HttpStatus.OK, description: 'Games listed successfully' })
    @ApiQuery({ name: 'name', required: false, description: 'Filter by game name' })
    @ApiQuery({ name: 'platform', required: false, description: 'Filter by platform' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (starting from 1)', type: Number })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
    ListGames(@Query() ListGamesDto: ListGamesDto) {
        const { name, platform, page, limit } = ListGamesDto;
        return this.GameService.listGames(name, platform, page, limit);
    }


}