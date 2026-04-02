import { DatabaseFunction } from '../database/databasePool';
import { User } from '../models/userModel';
import { UserRepository } from '../repositories/userRepository';
import { EnergyCardRepository } from '../repositories/energyCardRepository';

export type AdminUserDetail = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login: string | null;
  role: string | null;
  status: string | null;
  meters: Array<{
    card_number: string;
    name: string | null;
    current_balance: number;
    current_kwh: number;
    last_recharge: string | null;
  }>;
};

export class AdminService {
  private userRepository: UserRepository;
  private energyCardRepository: EnergyCardRepository;

  constructor(private db: DatabaseFunction) {
    this.userRepository = new UserRepository(db);
    this.energyCardRepository = new EnergyCardRepository(db);
  }

  async getAllUsers(): Promise<User[]> {
    // Use the repository method that calls the stored procedure
    return await this.userRepository.getAllUsers();
  }

  async getUserDetail(userId: number): Promise<AdminUserDetail | null> {
    // Get user basic info from the stored procedure
    const user = await this.userRepository.getUserById(userId);
    if (!user) return null;

    // Get meters for this user
    const meters = await this.energyCardRepository.findByUserId(userId);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      last_login: user.last_login,
      role: user.role,
      status: user.status,
      meters: meters.map(m => ({
        card_number: m.card_number,
        name: m.name,
        current_balance: m.current_balance,
        current_kwh: m.current_kwh,
        last_recharge: m.last_recharge,
      })),
    };
  }

  async getUserLogs(userId: number): Promise<any[]> {
    // Returns security logs filtered by username associated with the user ID
    return await this.userRepository.getUserLogs(userId);
  }

  async suspendUser(userId: number): Promise<void> {
    // Suspend user by setting status to 'Suspendido'
    await this.userRepository.updateStatusByName(userId, 'Suspendido');
  }

  async unsuspendUser(userId: number): Promise<void> {
    // Unsuspend user by setting status to 'Activo'
    await this.userRepository.updateStatusByName(userId, 'Activo');
  }

  async updateUserEmail(userId: number, email: string): Promise<void> {
    await this.userRepository.updateEmail(userId, email);
  }

  async updateUserStatus(userId: number, status: string): Promise<void> {
    // Update user status by name using the stored procedure that handles lookup
    await this.userRepository.updateStatusByName(userId, status);
  }

  async sendPasswordResetLink(userId: number): Promise<void> {
    // Generate a secure reset token and store it in the database
    const token = await this.userRepository.generatePasswordResetToken(userId);
    // Note: Email sending would be handled by an email service
    // The token is stored and can be used with the reset password endpoint
  }

  async linkCardToUser(userId: number, cardNumber: string, name?: string): Promise<void> {
    // This would typically transfer ownership of a card to a user
    // First we need to find the card to get its ID
    const card = await this.energyCardRepository.findByCardNumber(cardNumber);
    if (card) {
      await this.energyCardRepository.transferOwnership(card.id, userId);
    }
  }

  async removeUserCard(userId: number, cardNumber: string): Promise<void> {
    // This would typically release a card from a user
    await this.energyCardRepository.release(userId, cardNumber, null);
  }
}