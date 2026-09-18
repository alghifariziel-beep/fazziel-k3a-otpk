import { ContainerSize } from '../types/terminal';

/**
 * Validates container number format according to ISO 6346
 * Must be 4 uppercase letters followed by 7 numeric digits (11 characters total)
 * e.g., MSKU8291034, CMAU1234567
 */
export function validateContainerNumber(containerNumber: string): {
  isValid: boolean;
  error?: string;
} {
  if (!containerNumber) {
    return { isValid: false, error: 'Nomor petikemas wajib diisi' };
  }

  const clean = containerNumber.trim().toUpperCase();

  if (clean.length !== 11) {
    return { 
      isValid: false, 
      error: `Panjang nomor petikemas harus 11 karakter (sekarang: ${clean.length}). Format: 4 huruf + 7 angka.` 
    };
  }

  const isoRegex = /^[A-Z]{4}[0-9]{7}$/;
  if (!isoRegex.test(clean)) {
    return { 
      isValid: false, 
      error: 'Format ISO 6346 tidak valid. Harus diawali 4 huruf kapital (misal: MSKU) diikuti 7 digit angka (misal: 1234567).' 
    };
  }

  return { isValid: true };
}

/**
 * Calculate TEU based on container size
 */
export function calculateTeu(size: ContainerSize): number {
  if (size === '20GP' || size === '20RF' || size === '20TK') {
    return 1.0;
  }
  return 2.0; // 40GP, 40HC, 45HC, 40RF, 40OT, 40FR
}

/**
 * Validate Gross Weight
 * Must be between 2000kg (empty tare) and 36000kg (max gross weight standard)
 */
export function validateGrossWeight(grossKg: number, tareKg: number): {
  isValid: boolean;
  error?: string;
} {
  if (isNaN(grossKg) || grossKg <= 0) {
    return { isValid: false, error: 'Bobot kotor (Gross Weight) harus berupa angka positif.' };
  }
  if (grossKg < 2000) {
    return { isValid: false, error: 'Bobot kotor minimal 2.000 kg (bobot kosong kontainer).' };
  }
  if (grossKg > 36000) {
    return { isValid: false, error: 'Bobot kotor melebihi batas aman operasional terminal (maksimal 36.000 kg).' };
  }
  if (tareKg && grossKg < tareKg) {
    return { isValid: false, error: 'Bobot kotor tidak boleh lebih kecil dari bobot tara kosong (Tare Weight).' };
  }
  return { isValid: true };
}

export function formatWeight(kg: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(kg) + ' kg';
}

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return isoString;
  }
}
