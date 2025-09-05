import { Model, Optional } from 'sequelize';
import { AdminSessionAttributes, AdminSessionCreationAttributes } from '@/types/models';

export interface AdminSessionInstance extends Model<AdminSessionAttributes, AdminSessionCreationAttributes>, AdminSessionAttributes { }

export default function (sequelize: any, DataTypes: any): typeof Model & (new () => AdminSessionInstance);
export { AdminSessionInstance as AdminSession };