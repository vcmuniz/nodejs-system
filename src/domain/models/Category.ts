export class Category {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public description?: string,
    public image?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
