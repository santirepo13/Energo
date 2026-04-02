import { DatabaseFunction } from '../database/databasePool';
import { EnergyCard } from '../models/energyCardModel';
import { EnergyCardRepository } from '../repositories/energyCardRepository';

console.log('Cargando servicio de tarjeta de energía');

export class EnergyCardService {
  private energyCardRepository: EnergyCardRepository;

  constructor(private db: DatabaseFunction) {
    this.energyCardRepository = new EnergyCardRepository(db);
  }

  async getCardsByUser(userId: number): Promise<EnergyCard[]> {
    return await this.energyCardRepository.findByUserId(userId);
  }

  async getCardByUserAndNumber(userId: number, cardNumber: string): Promise<EnergyCard | null> {
    return await this.energyCardRepository.findByUserIdAndCardNumber(userId, cardNumber);
  }

  async addCard(userId: number, cardNumber: string, name: string | null): Promise<EnergyCard> {
    // Since we're using the new abstraction, we don't need to manage connections manually
    const existingCard = await this.energyCardRepository.findByCardNumber(cardNumber);
    if (existingCard) {
      if (existingCard.user_id == null) {
        await this.energyCardRepository.claimReleased(existingCard.id, userId, name);
        const card = await this.getCardByUserAndNumber(userId, cardNumber);
        if (!card) {
          throw new Error('Failed to claim card');
        }
        return card;
      } else {
        throw new Error('Card number already exists');
      }
    } else {
      await this.energyCardRepository.create(userId, cardNumber, name);
      const card = await this.getCardByUserAndNumber(userId, cardNumber);
      if (!card) {
        throw new Error('Failed to create card');
      }
      return card;
    }
  }

  async updateCardName(userId: number, cardNumber: string, name: string | null): Promise<EnergyCard> {
    await this.energyCardRepository.updateName(userId, cardNumber, name);
    
    const card = await this.getCardByUserAndNumber(userId, cardNumber);
    if (!card) {
      throw new Error('Card not found');
    }
    return card;
  }

  async releaseCard(userId: number, cardNumber: string): Promise<void> {
    await this.energyCardRepository.release(userId, cardNumber, userId);
  }

  async linkCardToUser(userId: number, cardNumber: string): Promise<void> {
    // Find the card first
    const card = await this.energyCardRepository.findByCardNumber(cardNumber);
    if (!card) {
      throw new Error('Card not found');
    }
    
    // Transfer ownership using the repository method
    await this.energyCardRepository.transferOwnership(card.id, userId);
  }

  async removeUserCard(userId: number, cardNumber: string): Promise<void> {
    // Find the card first
    const card = await this.energyCardRepository.findByCardNumber(cardNumber);
    if (!card) {
      throw new Error('Card not found');
    }
    
    // Release the card using the repository method
    await this.energyCardRepository.release(userId, cardNumber, userId);
  }
}