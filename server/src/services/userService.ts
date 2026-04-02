import { DatabaseFunction } from '../database/databasePool';
import { User } from '../models/userModel';
import { UserProfile } from '../models/userProfileModel';
import { UserFlag } from '../models/userFlagModel';
import { UserRepository } from '../repositories/userRepository';
import { UserProfileRepository } from '../repositories/userProfileRepository';
import { UserFlagRepository } from '../repositories/userFlagRepository';
import { LookupRepository } from '../repositories/lookupRepository';

console.log('Cargando servicio de usuario');

export class UserService {
  private userRepository: UserRepository;
  private userProfileRepository: UserProfileRepository;
  private userFlagRepository: UserFlagRepository;
  private lookupRepository: LookupRepository;

  constructor(private db: DatabaseFunction) {
    this.userRepository = new UserRepository(db);
    this.userProfileRepository = new UserProfileRepository(db);
    this.userFlagRepository = new UserFlagRepository(db);
    this.lookupRepository = new LookupRepository(db);
  }

  async getProfile(userId: number): Promise<{ user: User; profile: UserProfile | null; personalDataFilled: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    const profile = await this.userProfileRepository.getProfile(userId);
    const personalDataFilled = await this.userFlagRepository.getPersonalDataFlag(userId);
    
    return { user, profile, personalDataFilled };
  }

  async updateProfile(userId: number, profileData: any): Promise<void> {
    // Since we're using the new abstraction, we don't need to manage connections manually
    await this.userProfileRepository.updateProfile(userId, profileData);

    // Determine if required personal data fields are filled
    // Required fields: primer_nombre, primer_apellido, tipo_identificacion, numero_identificacion
    const hasRequiredFields =
      profileData.primer_nombre && profileData.primer_nombre.trim().length > 0 &&
      profileData.primer_apellido && profileData.primer_apellido.trim().length > 0 &&
      profileData.tipo_identificacion && profileData.tipo_identificacion.trim().length > 0 &&
      profileData.numero_identificacion && profileData.numero_identificacion.trim().length > 0;

    await this.userFlagRepository.setPersonalDataFlag(userId, hasRequiredFields);
  }

  async updateStatus(userId: number, status: string): Promise<void> {
    const statusRow = await this.getStatusIdByName(status);
    if (!statusRow) {
      throw new Error('Estado no disponible');
    }
    
    await this.userRepository.updateStatus(userId, statusRow.id);
  }

  private documentChanged(currentProfile: UserProfile | null, newProfile: any): boolean {
    if (!currentProfile) return false;
    return currentProfile.tipo_identificacion !== newProfile.tipo_identificacion || 
           currentProfile.numero_identificacion !== newProfile.numero_identificacion;
  }

  private async getStatusIdByName(status: string): Promise<any> {
    const [rows]: any = await this.db(
      'SELECT id FROM statuses WHERE name = ? LIMIT 1',
      [status]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async updateKwhPrice(adminUserId: number, price: number): Promise<{ kwh_price: number }> {
    // Call the stored procedure
    await this.db('CALL sp_set_kwh_price(?, ?)', [adminUserId, price]);
    
    // Get the updated price from settings
    const [priceRows]: any = await this.db(
      'SELECT CAST(value AS DECIMAL(10,2)) as kwh_price FROM settings WHERE `key` = ? LIMIT 1',
      ['kwh_price']
    );
    
    if (!Array.isArray(priceRows) || priceRows.length === 0) {
      throw new Error('Failed to retrieve updated kWh price');
    }
    
    return { kwh_price: priceRows[0].kwh_price };
  }
}