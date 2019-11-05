import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import Queue from '../../lib/Queue';
import AnswerMail from '../jobs/AnswerMail';

class AnswerHelpOrdersController {
  async update(req, res) {
    const { help_order_id } = req.params;

    // Validate Data
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Data Validation Fails' });
    }

    // search for help_order
    const order = await HelpOrder.findOne({
      where: {
        id: help_order_id,
      },
    });
    if (!order) {
      return res.status(401).json({ error: 'Help order not founded' });
    }

    await order.update({
      answer: req.body.answer,
      answer_at: new Date(),
    });

    const helpOrder = await HelpOrder.findOne({
      where: {
        id: help_order_id,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
      attributes: ['id', 'answer', 'question', 'student_id'],
    });

    Queue.add(AnswerMail.key, {
      helpOrder,
    });

    return res.json(helpOrder);
  }
}

export default new AnswerHelpOrdersController();
