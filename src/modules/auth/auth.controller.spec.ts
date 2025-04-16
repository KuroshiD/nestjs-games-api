import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: jest.Mocked<AuthService>;

    beforeEach(() => {
        authService = {
            login: jest.fn(),
            register: jest.fn(),
            refreshToken: jest.fn(),
        } as any;
        controller = new AuthController(authService);
    });

    describe('login', () => {
        it('should call authService.login with correct dto and return result', async () => {
            const dto: LoginDto = { username: 'user', password: 'pass' };
            const result = {
                user: { id: '1', username: 'user', email: 'user@mail.com' },
                access_token: 'access',
                refresh_token: 'refresh',
            };
            authService.login.mockResolvedValue(result);

            const response = await controller.login(dto);

            expect(authService.login).toHaveBeenCalledWith(dto);
            expect(response).toEqual(result);
        });

        it('should propagate errors from authService.login', async () => {
            const dto: LoginDto = { username: 'user', password: 'wrong' };
            authService.login.mockRejectedValue(new Error('Invalid credentials'));

            await expect(controller.login(dto)).rejects.toThrow('Invalid credentials');
            expect(authService.login).toHaveBeenCalledWith(dto);
        });
    });

    describe('register', () => {
        it('should call authService.register with correct dto and return result', async () => {
            const dto: RegisterDto = { username: 'newuser', email: 'new@mail.com', password: 'password123' };
            const result = {
                user: { id: '2', username: 'newuser', email: 'new@mail.com' },
                access_token: 'access2',
                refresh_token: 'refresh2',
            };
            authService.register.mockResolvedValue(result);

            const response = await controller.register(dto);

            expect(authService.register).toHaveBeenCalledWith(dto);
            expect(response).toEqual(result);
        });

        it('should propagate errors from authService.register', async () => {
            const dto: RegisterDto = { username: 'existing', email: 'existing@mail.com', password: 'password123' };
            authService.register.mockRejectedValue(new Error('Username or email already exists'));

            await expect(controller.register(dto)).rejects.toThrow('Username or email already exists');
            expect(authService.register).toHaveBeenCalledWith(dto);
        });
    });
});