import { Model, Optional } from 'sequelize';
import { TransactionAttributes, TransactionCreationAttributes } from '@/types/models';

export interface TransactionInstance extends Model<TransactionAttributes, TransactionCreationAttributes>, TransactionAttributes { }

export default function (sequelize: any, DataTypes: any): typeof Model & (new () => TransactionInstance);
export { TransactionInstance as Transaction };