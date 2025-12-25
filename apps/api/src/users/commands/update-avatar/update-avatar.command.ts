export class UpdateAvatarCommand {
  constructor(
    public readonly userId: string,
    public readonly file: Express.Multer.File
  ) {}
}
