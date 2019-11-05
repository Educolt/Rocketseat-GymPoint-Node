import { Op } from 'sequelize';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    const { student_id } = req.params;

    // Verify if student exist
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(401).json({ error: 'Student not founded' });
    }

    // verify if already checkin on day
    const alreadyCheckin = await Checkin.findOne({
      where: {
        created_at: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
      },
    });
    if (alreadyCheckin) {
      return res.status(400).json({ error: 'Already checkin today' });
    }

    // verify how many checkins in a week
    const isOnLimit = subDays(new Date(), 6);
    const countCheckins = await Checkin.count({
      where: {
        student_id,
        created_at: {
          [Op.gte]: isOnLimit,
        },
      },
    });

    if (countCheckins >= 5) {
      return res.status(400).json({
        error: 'Only 5 checkin on per 7 days',
      });
    }

    const checkin = await Checkin.create({
      student_id,
    });

    return res.status(200).json({ msg: 'Checkin successfully', checkin });
  }

  async index(req, res) {
    // Verify if student exist
    const student = await Student.findByPk(req.params.student_id);
    if (!student) {
      return res.status(401).json({ error: 'Student not founded' });
    }

    // get checkins
    const checkins = await Checkin.findAll({
      student_id: req.params.student_id,
    });

    // filter the checkins
    const checkinList = [];

    // eslint-disable-next-line array-callback-return
    checkins.map(checkin => {
      // eslint-disable-next-line eqeqeq
      if (checkin.student_id == req.params.student_id) {
        checkinList.push(checkin);
      }
    });

    return res.json(checkinList);
  }
}

export default new CheckinController();
