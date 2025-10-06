import { Request, Response } from 'express';
import pool from '../db/pool';

export class DutiesController {
  /**
   * Получить все должности
   */
  async getDuties(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query('SELECT * FROM duties ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error('Ошибка при получении должностей:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }

  /**
   * Создать новую должность
   */
  async createDuty(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;

      if (!name || name.trim() === '') {
        res.status(400).json({ error: 'Название должности обязательно' });
        return;
      }

      const result = await pool.query(
        'INSERT INTO duties (name) VALUES ($1) RETURNING *',
        [name.trim()]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Ошибка при создании должности:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }

  /**
   * Обновить должность
   */
  async updateDuty(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || name.trim() === '') {
        res.status(400).json({ error: 'Название должности обязательно' });
        return;
      }

      const result = await pool.query(
        'UPDATE duties SET name = $1 WHERE id = $2 RETURNING *',
        [name.trim(), id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Должность не найдена' });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Ошибка при обновлении должности:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }

  /**
   * Удалить должность
   */
  async deleteDuty(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Проверяем, есть ли сотрудники с этой должностью
      const workersCheck = await pool.query(
        'SELECT COUNT(*) as count FROM workers WHERE duty = $1',
        [id]
      );

      if (parseInt(workersCheck.rows[0].count) > 0) {
        res.status(400).json({ 
          error: 'Нельзя удалить должность, к которой привязаны сотрудники' 
        });
        return;
      }

      const result = await pool.query('DELETE FROM duties WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Должность не найдена' });
        return;
      }

      res.json({ message: 'Должность успешно удалена' });
    } catch (error) {
      console.error('Ошибка при удалении должности:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
}
