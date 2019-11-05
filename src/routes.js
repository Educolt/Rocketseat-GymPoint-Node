import { Op } from 'sequelize';
import { Router } from 'express';
// eslint-disable-next-line import/no-duplicates
import UserController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
// eslint-disable-next-line import/no-duplicates
import StudentController from './app/controllers/StudentController';
import PlansController from './app/controllers/PlansController';
import RegistrationsController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrdersController from './app/controllers/HelpOrdersController';
import AnswerHelpOrdersController from './app/controllers/AnswerHelpOrdersController';

import Student from './app/models/Student';
import HelpOrder from './app/models/HelpOrder';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// rota de criação de usuario
routes.post('/users', UserController.store);
// rota de criação de sessão
routes.post('/sessions', SessionController.store);

// rota de criação de checkin
routes.post('/students/:student_id/checkins', CheckinController.store);
// rota para listagem de checkins
routes.get('/students/:student_id/checkins', CheckinController.index);

// rota de criação de Help_orders
routes.post('/students/:student_id/help-orders', HelpOrdersController.store);
// rota para listagem de Help_orders
routes.get('/students/:student_id/help-orders', HelpOrdersController.index);
// rota para listagem de help_order sem resposta
routes.get('/students/:student_id/help-orders/no_answer', async (req, res) => {
  const { student_id } = req.params;

  // search student
  const student = await Student.findByPk(student_id);
  if (!student) {
    return res.status(401).json({ error: 'Student not founded' });
  }

  const orders = await HelpOrder.findAll({
    where: {
      student_id,
      answer: {
        [Op.is]: null,
      },
    },
    attributes: ['id', 'student_id', 'answer'],
    include: [
      {
        model: Student,
        as: 'student',
        attributes: ['name', 'email'],
      },
    ],
  });

  if (orders.length === 0) {
    return res.status(400).json({ error: 'No help_orders without answer' });
  }

  return res.json(orders);
});

// Middleware de auenticação de usuario
routes.use(authMiddleware);

// rota de criação de student
routes.post('/students', StudentController.store);
// rota de atualização de dados do student
routes.put('/students/:student_id', StudentController.update);

// rota de atualização de dados do usuario
routes.put('/users', UserController.update);

// rota para listagem de Planos
routes.get('/plans', PlansController.index);
// rota de criação de Planos
routes.post('/plans', PlansController.store);
// rota para update de plano
routes.put('/plans/:plan_id', PlansController.update);
// rota de delete de plano
routes.delete('/plans/:plan_id', PlansController.delete);

// rota de listagem de matriculas
routes.get('/registrations', RegistrationsController.index);
// rota de criação de matricula
routes.post('/registrations', RegistrationsController.store);
// rota de update de matricula
routes.put('/registrations/:registration_id', RegistrationsController.update);
// rota de delete de matricula
routes.delete(
  '/registrations/:registration_id',
  RegistrationsController.delete
);

// rota para resposta de Help_orders
routes.put(
  '/help-orders/:help_order_id/answer',
  AnswerHelpOrdersController.update
);

export default routes;
