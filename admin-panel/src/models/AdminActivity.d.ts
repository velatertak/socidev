import { Model, Optional } from 'sequelize';
import { AdminActivityAttributes, AdminActivityCreationAttributes } from '@/types/models';

export interface AdminActivityInstance extends Model<AdminActivityAttributes, AdminActivityCreationAttributes>, AdminActivityAttributes { }

export default function (sequelize: any, DataTypes: any): typeof Model & (new () => AdminActivityInstance);
export { AdminActivityInstance as AdminActivity };