import { Request, Response } from 'express';
import pool from '../db/pool';

export class WorkersController {
  /**
   * Получить всех сотрудников
   */
  async getWorkers(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(`
        SELECT w.id, w.name, w.duty as duty_id, d.name as duty_name 
        FROM workers w 
        JOIN duties d ON w.duty = d.id 
        ORDER BY w.id
      `);
      
      const workers = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        duty_id: row.duty_id,
        duty_name: row.duty_name
      }));

      res.json(workers);
    } catch (error) {
      console.error('Ошибка при получении сотрудников:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }

  /**
   * Создать нового сотрудника
   */
  async createWorker(req: Request, res: Response): Promise<void> {
    try {
      const { name, duty_id } = req.body;

      if (!name || !duty_id) {
        res.status(400).json({ error: 'Имя и должность обязательны' });
        return;
      }

      const result = await pool.query(
        'INSERT INTO workers (name, duty) VALUES ($1, $2) RETURNING *',
        [name, duty_id]
      );

      // Получаем полную информацию о созданном сотруднике
      const workerResult = await pool.query(`
        SELECT w.id, w.name, w.duty as duty_id, d.name as duty_name 
        FROM workers w 
        JOIN duties d ON w.duty = d.id 
        WHERE w.id = $1
      `, [result.rows[0].id]);

      res.status(201).json(workerResult.rows[0]);
    } catch (error) {
      console.error('Ошибка при создании сотрудника:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }

  /**
   * Обновить сотрудника
   */
  async updateWorker(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, duty_id } = req.body;

      if (!name || !duty_id) {
        res.status(400).json({ error: 'Имя и должность обязательны' });
        return;
      }

      const result = await pool.query(
        'UPDATE workers SET name = $1, duty = $2 WHERE id = $3 RETURNING *',
        [name, duty_id, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Сотрудник не найден' });
        return;
      }

      // Получаем полную информацию об обновленном сотруднике
      const workerResult = await pool.query(`
        SELECT w.id, w.name, w.duty as duty_id, d.name as duty_name 
        FROM workers w 
        JOIN duties d ON w.duty = d.id 
        WHERE w.id = $1
      `, [id]);

      res.json(workerResult.rows[0]);
    } catch (error) {
      console.error('Ошибка при обновлении сотрудника:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }

  /**
   * Удалить сотрудника
   */
  async deleteWorker(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM workers WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Сотрудник не найден' });
        return;
      }

      res.json({ message: 'Сотрудник успешно удален' });
    } catch (error) {
      console.error('Ошибка при удалении сотрудника:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
}
