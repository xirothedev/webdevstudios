import { Query } from '@nestjs/cqrs';

import { userInfoDto } from '../dto/userInfo.dto';

export class GetProfileQuery extends Query<userInfoDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
