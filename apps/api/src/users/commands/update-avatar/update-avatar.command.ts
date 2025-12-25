export class UpdateAvatarCommand {
  constructor(
    public readonly userId: string,
    public readonly avatar: string
  ) {}
}
