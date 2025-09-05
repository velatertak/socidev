import { Model, Optional } from 'sequelize';
import { TaskAttributes, TaskCreationAttributes } from '@/types/models';

export interface TaskInstance extends Model<TaskAttributes, TaskCreationAttributes>, TaskAttributes { }

export default function (sequelize: any, DataTypes: any): typeof Model & (new () => TaskInstance);
export { TaskInstance as Task };