import { Injectable } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common/exceptions';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
    private userModel: Model<User>,
    private jwt: JwtService
  ) {

  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel( {
        password: bcryptjs.hashSync( password, 10),
        ...userData
      } );
      await newUser.save();       
      const { password: _, ...user } = newUser.toJSON();
      return user;
    } catch (error) {
      if ( error.code === 11000 ) {
        throw new BadRequestException(`El correo ${createUserDto.email} ya existe!`);
      }
      throw new InternalServerErrorException("Ocurrió un error inesperado, por favor intente en unos minutos");
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async login (login: LoginDto) {
    const { email, password } = login;
    const user = await this.userModel.findOne({email});
    console.log(user);
    if ( !user ) {
      throw new UnauthorizedException("Not valid credentials - email");
    }
    if ( !bcryptjs.compareSync( password, user.password )) {
      throw new UnauthorizedException("Not valid credentials - password");
    }
    
    const { password: _, ...userData } = user.toJSON();
    
    return {
      user: userData,
      token: this.getJwt({ id: user.id })
    };

  }

  getJwt( payload: JwtPayload ) {
    return this.jwt.sign(payload);
  }
}
