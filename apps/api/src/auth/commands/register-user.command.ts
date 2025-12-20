import { RegisterDto } from '../dto/register.dto';

export class RegisterUserCommand {
  constructor(public readonly dto: RegisterDto) {}
}
