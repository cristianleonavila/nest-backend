import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, UpdateUserDto, LoginDto, RegisterUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';
import { LoginResponse } from './interfaces/login-response';

@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @UseGuards( AuthGuard )
  @Get()
  findAll( @Request() req: Request ) {
    return this.authService.findAll();
  }

  /*@Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateUserDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }*/

  @Post('/login')
  login(@Body() loginData: LoginDto) {
    return this.authService.login( loginData );
  }

  @Post('/register')
  register(@Body() registerUser: RegisterUserDto) {
    return this.authService.register( registerUser );
  }  

  @UseGuards(AuthGuard)
  @Get('check-token')
  checkToken(@Request() req: Request): LoginResponse {
    const user = req['user'] as User;
    return {
      user, 
      token: this.authService.getJwt({id: user._id})
    };
  }
}
