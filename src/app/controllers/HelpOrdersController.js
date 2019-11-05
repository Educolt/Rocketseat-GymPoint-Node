import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrdersController {
  async store(req, res) {
    const { student_id } = req.params;

    // validate data
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Data Validation Fails' });
    }

    // verify if student exist
    const studentExist = await Student.findByPk(student_id);
    if (!studentExist) {
      return res.status(401).json({ error: 'Student not founded' });
    }

    const helpOrder = await HelpOrder.create({
      student_id,
      question: req.body.question,
    });

    return res.json(helpOrder);
  }

  async index(req, res) {
    const { student_id } = req.params;

    // search student
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(401).json({ error: 'Student not founded' });
    }

    const helpOrders = await HelpOrder.findAll({
      where: {
        student_id,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
      attributes: ['id', 'question', 'student_id', 'answer'],
    });

    if (helpOrders.length === 0) {
      return res
        .status(400)
        .json({ error: 'Student do not have help_orders to list' });
    }
    return res.json(helpOrders);
  }
}

export default new HelpOrdersController();
