// Document types supported by the application
// Based on Colombian identification types

export const DOC_TYPES = [
  { code: 'CC', label: 'Cédula de Ciudadanía' },
  { code: 'CE', label: 'Cédula de Extranjería' },
  { code: 'Pasaporte', label: 'Pasaporte' },
  { code: 'PEP', label: 'Permiso Especial de Permanencia' },
  { code: 'RIF', label: 'Registro de Identificación Fiscal' },
] as const;

export type DocType = typeof DOC_TYPES[number]['code'];

// Helper to get label for a document type code
export function getDocTypeLabel(code: string): string {
  const found = DOC_TYPES.find(d => d.code === code);
  return found?.label ?? code;
}
