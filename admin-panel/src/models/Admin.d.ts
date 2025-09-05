import { Model, Optional } from 'sequelize';
import { AdminAttributes, AdminCreationAttributes } from '@/types/models';

export interface AdminInstance extends Model<AdminAttributes, AdminCreationAttributes>, AdminAttributes { }

export default function (sequelize: any, DataTypes: any): typeof Model & (new () => AdminInstance);
export { AdminInstance as Admin };