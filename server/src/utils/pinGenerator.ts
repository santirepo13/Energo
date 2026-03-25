import crypto from 'crypto';

export interface PinGenerator {
  generateSts20Token: (cardNumber: string, amountCOP: number, kwh: number) => string;
}

export class PinGenerator implements PinGenerator {
  private readonly STS_BASE_DATE = new Date(Date.UTC(1993, 0, 1));

  generateSts20Token(cardNumber: string, amountCOP: number, kwh: number): string {
    const key = this.deriveMeterKey(cardNumber);
    const tokenType = 0x01;
    const amountCents = Math.max(0, Math.round(amountCOP * 100));
    const days = this.daysSinceStsEpoch(new Date());
    const nonce = Math.floor(Math.random() * 65536);

    const payload = Buffer.alloc(9);
    payload.writeUInt8(tokenType, 0);
    payload.writeUInt32BE(amountCents >>> 0, 1);
    payload.writeUInt16BE(days & 0xffff, 5);
    payload.writeUInt16BE(nonce, 7);

    const mac = crypto.createHmac('sha256', key).update(payload).digest();
    const first16 = mac.subarray(0, 16);
    const big = BigInt('0x' + first16.toString('hex'));
    const body = (big % (10n ** 19n)).toString().padStart(19, '0');
    const check = this.luhnCheckDigit(body);
    return body + check;
  }

  private deriveMeterKey(cardNumber: string): Buffer {
    const master = process.env.STS_MASTER_KEY || process.env.SESSION_SECRET || 'insecure-dev-sts-key';
    return crypto.createHmac('sha256', master).update(String(cardNumber)).digest().subarray(0, 16);
  }

  private daysSinceStsEpoch(d: Date): number {
    const ms = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - this.STS_BASE_DATE.getTime();
    return Math.max(0, Math.floor(ms / 86400000));
  }

  private luhnCheckDigit(bodyDigits: string): string {
    let sum = 0;
    for (let i = bodyDigits.length - 1, alt = 0; i >= 0; i--, alt ^= 1) {
      let n = bodyDigits.charCodeAt(i) - 48;
      if (alt === 1) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
    }
    const check = (10 - (sum % 10)) % 10;
    return String(check);
  }
}
