import Sequelize from 'sequelize';
import User from '../app/models/User';
import Student from '../app/models/Student';
import Plan from '../app/models/Plan';
import Registration from '../app/models/Registration';
import Checkin from '../app/models/Checkin';
import HelpOrder from '../app/models/HelpOrder';
import dbConfig from '../config/database';

const models = [User, Student, Plan, Registration, Checkin, HelpOrder];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.conn = new Sequelize(dbConfig);

    models.map(m => m.init(this.conn));
    models.map(m => m.associate && m.associate(this.conn.models));
  }
}

export default new Database();
