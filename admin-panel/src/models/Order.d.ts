import { Model, Optional } from 'sequelize';
import { OrderAttributes, OrderCreationAttributes } from '@/types/models';

export interface OrderInstance extends Model<OrderAttributes, OrderCreationAttributes>, OrderAttributes { }

export default function (sequelize: any, DataTypes: any): typeof Model & (new () => OrderInstance);
export { OrderInstance as Order };