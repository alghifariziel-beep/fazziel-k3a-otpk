import { Container } from '../types/terminal';
import { formatDateTime } from './validators';

export function exportContainersToCSV(containers: Container[], filename = 'Manifest_Petikemas_TOS.csv') {
  if (!containers.length) return;

  const headers = [
    'No. Petikemas',
    'Tipe ISO',
    'TEU',
    'Status Operasional',
    'Kategori',
    'Blok',
    'Bay',
    'Row',
    'Tier',
    'Bobot Kotor (Kg)',
    'Bobot Tara (Kg)',
    'Payload (Kg)',
    'VGM Terverifikasi',
    'Nomor Segel',
    'Pelayaran (Shipping Line)',
    'Nama Kapal',
    'Nomor Voyage',
    'Reefer',
    'Suhu (°C)',
    'Kelas Bahaya (DG)',
    'Pengirim (Shipper)',
    'Penerima (Consignee)',
    'Plat Truk',
    'Supir',
    'Waktu Gate-In',
    'Waktu Gate-Out',
    'Catatan'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = containers.map((c) => [
    escapeCSV(c.containerNumber),
    escapeCSV(c.isoType),
    escapeCSV(c.teu),
    escapeCSV(c.status),
    escapeCSV(c.category),
    escapeCSV(c.yardLocation?.block || '-'),
    escapeCSV(c.yardLocation?.bay || '-'),
    escapeCSV(c.yardLocation?.row || '-'),
    escapeCSV(c.yardLocation?.tier || '-'),
    escapeCSV(c.grossWeightKg),
    escapeCSV(c.tareWeightKg),
    escapeCSV(c.payloadKg),
    escapeCSV(c.vgmVerified ? 'YA' : 'TIDAK'),
    escapeCSV(c.sealNumber),
    escapeCSV(c.shippingLine),
    escapeCSV(c.vesselName),
    escapeCSV(c.voyageNumber),
    escapeCSV(c.isReefer ? 'YA' : 'TIDAK'),
    escapeCSV(c.isReefer ? c.temperatureCelsius : '-'),
    escapeCSV(c.dangerClass),
    escapeCSV(c.shipper),
    escapeCSV(c.consignee),
    escapeCSV(c.truckPlateNumber),
    escapeCSV(c.driverName),
    escapeCSV(formatDateTime(c.gateInTime)),
    escapeCSV(formatDateTime(c.gateOutTime)),
    escapeCSV(c.notes)
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
