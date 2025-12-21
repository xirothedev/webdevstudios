import { Query } from '@nestjs/cqrs';

import { userInfoDto } from '../dto/userInfo.dto';

export class GetProfileQueryByToken extends Query<userInfoDto> {
  constructor(public readonly token: string) {
    super();
  }
}
