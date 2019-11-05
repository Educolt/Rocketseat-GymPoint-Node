import * as Yup from 'yup';
import { parseISO, addMonths, isBefore, startOfHour } from 'date-fns';
import Registration from '../models/Registration';
import User from '../models/User';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Queue from '../../lib/Queue';
import RegistrationMail from '../jobs/RegistrationMail';

class RegistrationController {
  async store(req, res) {
    // Validate Data
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .required(),
      plan_id: Yup.number()
        .integer()
        .required(),
      start_date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Field Validation Fails' });
    }

    // create and set the value of student and plan id and start date
    const { student_id, plan_id, start_date } = req.body;

    // Search for an User and verify if it is an Administrator
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not Found' });
    }
    if (user.admin !== true) {
      return res.status(400).json('User is not an Administrator');
    }

    // Verify if registration already exist
    const registrationExists = await Registration.findOne({
      where: {
        student_id,
      },
    });
    if (registrationExists) {
      return res.status(400).json({ error: 'Registration already exist' });
    }

    // Verify if student and Plan exist
    const student = await Student.findByPk(student_id);
    const plan = await Plan.findByPk(plan_id);
    if (!student) {
      return res.status(401).json({ error: 'Student not Found' });
    }
    if (!plan) {
      return res.status(401).json({ error: 'Plan not Found' });
    }

    // Check for past dates
    if (isBefore(startOfHour(parseISO(start_date)), new Date())) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }

    // create and set the value of price and end_date constants
    const price = plan.price * plan.duration;
    const end_date = addMonths(parseISO(start_date), plan.duration);

    // Create the Registration and get the id
    const { id } = await Registration.create({
      student_id,
      plan_id,
      price,
      start_date,
      end_date,
    });

    const registration = await Registration.findOne({
      where: { id },
      attributes: ['start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['price', 'title', 'duration'],
        },
      ],
    });

    await Queue.add(RegistrationMail.key, {
      registration,
    });

    // return a json with registration data
    return res.json({
      id,
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });
  }

  async index(req, res) {
    // get all registrations
    const registrations = await Registration.findAll();

    // return a json with the registrations
    return res.json(registrations);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().integer(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Field Validation fail' });
    }

    const { registration_id } = req.params;
    const { plan_id, start_date } = req.body;

    // Verify if the registration exist
    const registration = await Registration.findByPk(registration_id);
    if (!registration) {
      return res.status(401).json({ error: 'Registration not founded' });
    }

    // Verify if it is an admin
    const user = await User.findByPk(req.userId);
    if (user.admin !== true) {
      return res.status(400).json({ error: 'User is not an administrator' });
    }

    // Verify if plan exist
    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(401).json({ error: 'Plan not founded' });
    }

    // Check for past dates
    if (isBefore(startOfHour(parseISO(start_date)), new Date())) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }

    const { id, student_id } = await registration.update(req.body);

    const price = plan.price * plan.duration;
    const end_date = addMonths(registration.start_date, plan.duration);

    await registration.update({
      price,
      end_date,
    });

    return res.json({
      id,
      student_id,
      plan_id,
      price,
      end_date,
    });
  }

  async delete(req, res) {
    // Verify if exists
    const { registration_id } = req.params;
    const registration = await Registration.findByPk(registration_id);
    if (!registration) {
      return res.status(401).json({ error: 'Registration not founded' });
    }

    // Verify if it is an admin
    const user = await User.findByPk(req.userId);
    if (user.admin !== true) {
      return res.status(400).json({ error: 'User is not an administrator' });
    }

    await registration.destroy();

    return res.json();
  }
}

export default new RegistrationController();
