import { DatabaseFunction } from '../database/databasePool';
import { EnergyCard } from '../models/energyCardModel';

export interface IEnergyCardRepository {
  findByCardNumber: (cardNumber: string) => Promise<EnergyCard | null>;
  findByUserId: (userId: number) => Promise<EnergyCard[]>;
  findByUserIdAndCardNumber: (userId: number, cardNumber: string) => Promise<EnergyCard | null>;
  create: (userId: number, cardNumber: string, name: string | null) => Promise<number>;
  updateBalance: (userId: number, cardNumber: string, balance: number, kwh: number) => Promise<void>;
  updateName: (userId: number, cardNumber: string, name: string | null) => Promise<void>;
  release: (userId: number, cardNumber: string, releasedByUserId: number | null) => Promise<void>;
  claimReleased: (cardId: number, userId: number, name: string | null) => Promise<void>;
  transferOwnership: (cardId: number, newUserId: number) => Promise<void>;
}

export class EnergyCardRepository implements IEnergyCardRepository {
  constructor(private db: DatabaseFunction) {}

  async findByCardNumber(cardNumber: string): Promise<EnergyCard | null> {
    const [rows]: any = await this.db(
      'CALL sp_energy_cards_find_by_card_number(?)',
      [cardNumber]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async findByUserId(userId: number): Promise<EnergyCard[]> {
    const [rows]: any = await this.db(
      'CALL sp_energy_cards_list_by_user(?)',
      [userId]
    );
    return Array.isArray(rows) ? rows : [];
  }

  async findByUserIdAndCardNumber(userId: number, cardNumber: string): Promise<EnergyCard | null> {
    const [rows]: any = await this.db(
      'CALL sp_energy_cards_get_by_user_and_card(?, ?)',
      [userId, cardNumber]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async create(userId: number, cardNumber: string, name: string | null): Promise<number> {
    const [rows]: any = await this.db(
      'CALL sp_energy_cards_insert(?, ?, ?)',
      [userId, cardNumber, name]
    );
    return rows[0].insertId;
  }

  async updateBalance(userId: number, cardNumber: string, balance: number, kwh: number): Promise<void> {
    await this.db('CALL sp_energy_cards_update_balance(?, ?, ?, ?)', [userId, cardNumber, balance, kwh]);
  }

  async updateName(userId: number, cardNumber: string, name: string | null): Promise<void> {
    await this.db('CALL sp_energy_cards_update_name_by_user_and_card(?, ?, ?)', [userId, cardNumber, name]);
  }

  async release(userId: number, cardNumber: string, releasedByUserId: number | null): Promise<void> {
    await this.db('CALL sp_energy_cards_release_by_user_and_card(?, ?, ?)', [userId, cardNumber, releasedByUserId]);
  }

  async claimReleased(cardId: number, userId: number, name: string | null): Promise<void> {
    await this.db('CALL sp_energy_cards_claim_released_by_id(?, ?, ?)', [cardId, userId, name]);
  }

  async transferOwnership(cardId: number, newUserId: number): Promise<void> {
    await this.db('CALL sp_energy_cards_transfer_owner(?, ?)', [cardId, newUserId]);
  }

  async linkCardToUser(userId: number, cardNumber: string, name?: string): Promise<void> {
    // First we need to find the card to get its ID
    const card = await this.findByCardNumber(cardNumber);
    if (card) {
      await this.transferOwnership(card.id, userId);
    }
  }

  async removeUserCard(userId: number, cardNumber: string): Promise<void> {
    await this.db('CALL sp_energy_cards_release_by_user_and_card(?, ?, ?)', [userId, cardNumber, null]);
  }
}