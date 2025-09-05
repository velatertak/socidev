import { Model, Optional } from 'sequelize';
import { UserAttributes, UserCreationAttributes } from '@/types/models';

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
    validatePassword(password: string): Promise<boolean>;
}

export default function (sequelize: any, DataTypes: any): typeof Model & (new () => UserInstance);
export { UserInstance as User };