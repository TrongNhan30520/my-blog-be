import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/Entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/loginUser.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: 'trantien1199temp@gmail.com',
    pass: 'yahx zwtn ioqv ngmn',
  },
});

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({
      email: registerUserDto.email,
    });

    if (user) {
      throw new HttpException('Email already exist', HttpStatus.BAD_REQUEST);
    }
    const hashPassword = await this.hashPassword(registerUserDto.password);
    const otp = await this.generateOTP();
    const otpExpire = new Date(new Date().getTime() + 1000 * 60 * 5); // 5 minutes
    await this.sendOtp(registerUserDto.email, otp);
    return await this.userRepository.save({
      ...registerUserDto,
      password: hashPassword,
      refresh_token: 'refresh_token_temporary',
      otp,
      otp_expire_at: otpExpire,
    });
  }

  async reSendOTP(email: string): Promise<any> {
    const user = await this.userRepository.findOneBy({
      email: email,
    });
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }
    if (user.status === 1) {
      throw new HttpException('Verified user', HttpStatus.BAD_REQUEST);
    }
    const otp = await this.generateOTP();
    const otpExpire = new Date(new Date().getTime() + 1000 * 60 * 5); // 5 minutes
    await this.sendOtp(email, otp);
    return await this.userRepository.update(user.id, {
      otp,
      otp_expire_at: otpExpire,
    });
  }

  async verifyOTP(email: string, otpCode: number): Promise<any> {
    const user = await this.userRepository.findOneBy({
      email: email,
    });
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }
    if (user.otp !== otpCode) {
      throw new HttpException('Otp Invalid', HttpStatus.BAD_REQUEST);
    }
    if (new Date(user.otp_expire_at) < new Date()) {
      throw new HttpException('Otp expired', HttpStatus.BAD_REQUEST);
    }
    return await this.userRepository.update(user.id, {
      status: 1,
    });
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new HttpException('Email is not exist', HttpStatus.UNAUTHORIZED);
    }
    const checkVerifyEmail = user.status === 0 ? false : true;
    if (!checkVerifyEmail) {
      throw new HttpException(
        'Email has not been verified',
        HttpStatus.BAD_REQUEST,
      );
    }
    const checkPass = bcrypt.compareSync(loginUserDto.password, user.password);
    if (!checkPass) {
      throw new HttpException('Email is not correct', HttpStatus.UNAUTHORIZED);
    }
    //generate  access token and refresh token

    const payload = { id: user.id, email: user.email };
    return this.generateToken(payload);
  }

  async refreshToken(refresh_token: string): Promise<any> {
    try {
      const verify = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
      const checkExist = await this.userRepository.findOneBy({
        email: verify.email,
        refresh_token,
      });
      if (checkExist) {
        return this.generateToken({ id: verify.id, email: verify.email });
      } else {
        throw new HttpException(
          'Refresh token is not valid',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Refresh token is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async generateToken(payload: { id: number; email: string }) {
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    });
    await this.userRepository.update(
      { email: payload.email },
      { refresh_token: refresh_token },
    );

    return { access_token, refresh_token };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  private async generateOTP(): Promise<number> {
    const generate: number = await new Promise((res) =>
      crypto.randomBytes(3, (err, buffer) => {
        res(
          Number(parseInt(buffer.toString('hex'), 16).toString().substr(0, 6)),
        );
      }),
    );
    return generate;
  }

  private async sendOtp(email: string, otp: number): Promise<boolean> {
    if (email) {
      try {
        await transporter.sendMail({
          from: '"My Blog 👻" <myblog@gmail.com>', // sender address
          to: email, // list of receivers trongnhan30520@gmail.com
          subject: 'Verify otp code', // Subject line
          text: ``, // plain text body
          html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
          <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
              <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">My Blog</a>
            </div>
            <p style="font-size:1.1em">Hi,</p>
            <p>Thank you for choosing My Blog. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
            <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
            <p style="font-size:0.9em;">Regards,<br />My Blog</p>
            <hr style="border:none;border-top:1px solid #eee" />
            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
              <p>My Blog Inc</p>
              <p>1200 Huynh Tan Phat</p>
              <p>Ho Chi Minh</p>
            </div>
          </div>
        </div>`,
        });
        return true;
      } catch (error) {
        return false;
      }
    } else return false;
  }
}
