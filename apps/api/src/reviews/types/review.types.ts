import { Product, Review, User } from 'generated/prisma/client';

export type UserPublic = Pick<User, 'id' | 'fullName' | 'avatar'>;

export type ProductPublic = Pick<Product, 'id' | 'slug'>;

export type ReviewWithRelations = Review & {
  user: UserPublic;
  product: ProductPublic;
};
