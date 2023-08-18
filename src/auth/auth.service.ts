import { Injectable } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common/exceptions';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
    private userModel: Model<User>
  ) {

  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
        const newUser = new this.userModel( createUserDto );
        return await newUser.save();      
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
}
