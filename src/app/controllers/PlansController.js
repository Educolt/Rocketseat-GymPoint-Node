import * as Yup from 'yup';
import Plan from '../models/Plan';
import User from '../models/User';

class PlansController {
  async store(req, res) {
    // Validate Data
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required(),
      price: Yup.number().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Search for an User and verify if it is an Administrator
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (user.admin !== true) {
      return res.status(401).json({ error: 'User is not an Administrator' });
    }

    // Verify if the Plan already exist by title
    const planExists = await Plan.findOne({ where: { title: req.body.title } });
    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists.' });
    }

    // Create the Plan on db and catch the var for the json return
    const { title, duration, price } = await Plan.create(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async index(req, res) {
    return res.json(await Plan.findAll());
  }

  async update(req, res) {
    // Validate Data
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number().integer(),
      price: Yup.number(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Search for an User and verify if it is an Administrator
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (user.admin !== true) {
      return res.status(401).json({ error: 'User is not an Administrator' });
    }

    const { plan_id } = req.params;

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(401).json({ error: 'Plan not found' });
    }

    const { title, duration, price } = await plan.update(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    // Search for an User and verify if it is an Administrator
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (user.admin !== true) {
      return res.status(401).json({ error: 'User is not an Administrator' });
    }

    const { plan_id } = req.params;

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(401).json({ error: 'Plan not found' });
    }

    await plan.destroy();

    return res.json();
  }
}

export default new PlansController();
