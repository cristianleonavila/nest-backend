import { Injectable } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common/exceptions';

import { CreateUserDto, UpdateUserDto, LoginDto, RegisterUserDto } from './dto';

import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

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

  async register( registerUser: RegisterUserDto): Promise<LoginResponse> {
    const user = await this.create( registerUser );
    return {
      user, 
      token: this.getJwt({ id: user._id })
    }
  }

  findAll(): Promise<User[]>{
    return this.userModel.find();
  }

  findOne(id: string | number) {
    return this.userModel.findById( id );
  }

  async findUserById(id:string) {
    const user = await this.userModel.findById( id );
    const { password, ...userData } = user.toJSON();
    return userData;
  }

  update(id: number, updateAuthDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async login (login: LoginDto):Promise<LoginResponse> {
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
