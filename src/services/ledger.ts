import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface Transaction {
  id: string;
  from_account: string;
  to_account: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}

/**
 * Double-entry bookkeeping transaction.
 * Debits from_account, credits to_account atomically.
 */
export async function createTransaction(
  fromAccount: string,
  toAccount: string,
  amount: number,
  currency: string,
  idempotencyKey: string
): Promise<Transaction> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Idempotency check
    const existing = await client.query(
      'SELECT * FROM transactions WHERE idempotency_key = $1',
      [idempotencyKey]
    );
    if (existing.rows.length > 0) return existing.rows[0];

    // Check balance
    const balance = await client.query(
      'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE',
      [fromAccount]
    );
    if (!balance.rows[0] || balance.rows[0].balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Debit source
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromAccount]
    );

    // Credit destination
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toAccount]
    );

    // Record transaction
    const result = await client.query(
      `INSERT INTO transactions 
       (from_account, to_account, amount, currency, status, idempotency_key)
       VALUES ($1, $2, $3, $4, 'completed', $5)
       RETURNING *`,
      [fromAccount, toAccount, amount, currency, idempotencyKey]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
