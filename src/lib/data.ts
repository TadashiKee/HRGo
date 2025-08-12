
// A pseudo-database for managing application state.
// In a real application, this would be a database.
import { add } from "date-fns";

export interface Employee {
  id: string;
  name: string;
  department: "Housekeeping" | "Finance" | "Teknik" | "Pemasaran" | "SDM & Umum";
  status: "Aktif" | "Cuti" | "Resign";
  avatar: string;
  email: string;
  phoneNumber: string;
  gender: "Laki-laki" | "Perempuan";
  dateOfBirth: Date;
  hireDate: Date;
  leaveBalance: number;
  supervisorId?: string;
  role: "staff" | "supervisor" | "hrd" | "owner";
  contractStartDate: Date;
  contractEndDate: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "Cuti Tahunan" | "Cuti Sakit" | "Cuti Khusus";
  dates: {
    from: Date;
    to: Date;
  };
  reason: string;
  status: "Tertunda" | "Menunggu Persetujuan HRD" | "Menunggu Persetujuan Owner" | "Disetujui" | "Ditolak";
}

export interface ResignationRequest {
    id: number,
    employeeId: string,
    lastDay: string,
    reason: string,
    status: "Tertunda" | "Menunggu Persetujuan HRD" | "Menunggu Persetujuan Owner" | "Disetujui" | "Ditolak"
}

export interface Feedback {
    id: number;
    content: string;
    timestamp: Date;
}

export interface Kpi {
    employeeId: string;
    quarter: string;
    score: number;
    finalizedBy: string; // HRD name
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: Date;
    type: "Informasi Umum" | "Acara Perusahaan" | "Ulang Tahun";
}

export interface KpiAssessment {
    employeeId: string;
    metrics: { name: string; weight: number; score: number }[];
    notes: string;
}


const today = new Date();
const johnsBirthday = new Date(1990, today.getMonth(), today.getDate());


const employees: Employee[] = [
  { id: "E001", name: "John Doe", department: "Teknik", status: "Aktif", avatar: "https://placehold.co/96x96.png", email: "john.doe@hrgo.com", phoneNumber: "081234567890", gender: "Laki-laki", dateOfBirth: johnsBirthday, hireDate: new Date("2023-01-10"), leaveBalance: 10, supervisorId: "E002", role: 'staff', contractStartDate: new Date("2023-01-10"), contractEndDate: new Date("2025-01-10") },
  { id: "E002", name: "Jane Smith", department: "Pemasaran", status: "Aktif", avatar: "https://placehold.co/96x96.png", email: "jane.smith@hrgo.com", phoneNumber: "081234567891", gender: "Perempuan", dateOfBirth: new Date("1988-08-20"), hireDate: new Date("2020-03-15"), leaveBalance: 8, supervisorId: "owner-01", role: 'supervisor', contractStartDate: new Date("2020-03-15"), contractEndDate: add(new Date(), { days: 15 }) },
  { id: "E003", name: "Alice Johnson", department: "Finance", status: "Aktif", avatar: "https://placehold.co/96x96.png", email: "alice.johnson@hrgo.com", phoneNumber: "081234567892", gender: "Perempuan", dateOfBirth: new Date("1992-11-30"), hireDate: new Date("2023-07-20"), leaveBalance: 12, supervisorId: "E002", role: 'staff', contractStartDate: new Date("2023-07-20"), contractEndDate: add(new Date(), { months: 1, days: 15 }) },
  { id: "E004", name: "Bob Williams", department: "Teknik", status: "Cuti", avatar: "https://placehold.co/96x96.png", email: "bob.williams@hrgo.com", phoneNumber: "081234567893", gender: "Laki-laki", dateOfBirth: new Date("1991-02-25"), hireDate: new Date("2022-09-01"), leaveBalance: 5, supervisorId: "E007", role: 'staff', contractStartDate: new Date("2022-09-01"), contractEndDate: new Date("2024-09-01") },
  { id: "E005", name: "Charlie Brown", department: "Pemasaran", status: "Aktif", avatar: "https://placehold.co/96x96.png", email: "charlie.brown@hrgo.com", phoneNumber: "081234567894", gender: "Laki-laki", dateOfBirth: new Date("1993-09-10"), hireDate: new Date("2023-02-20"), leaveBalance: 9, supervisorId: "E002", role: 'staff', contractStartDate: new Date("2023-02-20"), contractEndDate: add(new Date(), { months: 3 }) },
  { id: "E006", name: "David Smith", department: "Teknik", status: "Aktif", avatar: "https://placehold.co/96x96.png", email: "david.smith@hrgo.com", phoneNumber: "081234567895", gender: "Laki-laki", dateOfBirth: new Date("1994-12-05"), hireDate: new Date("2023-05-15"), leaveBalance: 11, supervisorId: "E007", role: 'staff', contractStartDate: new Date("2023-05-15"), contractEndDate: add(new Date(), { months: 7 })},
  { id: "E007", name: "Robert Davis", department: "Teknik", status: "Aktif", avatar: "https://placehold.co/96x96.png", email: "robert.davis@hrgo.com", phoneNumber: "081234567898", gender: "Laki-laki", dateOfBirth: new Date("1985-04-18"), hireDate: new Date("2019-08-01"), leaveBalance: 10, supervisorId: "owner-01", role: 'supervisor', contractStartDate: new Date("2019-08-01"), contractEndDate: add(new Date(), { years: 2 }) },
  { id: "hrd-01", name: "Amanda Lee", department: "SDM & Umum", status: "Aktif", avatar: "https://placehold.co/96x96.png", email: "amanda.lee@hrgo.com", phoneNumber: "081234567896", gender: "Perempuan", dateOfBirth: new Date("1985-07-12"), hireDate: new Date("2018-06-01"), leaveBalance: 12, supervisorId: "owner-01", role: 'hrd', contractStartDate: new Date("2018-06-01"), contractEndDate: add(new Date(), { years: 5 }) },
  { id: "owner-01", name: "Owner", department: "Finance", status: "Aktif", avatar: "https://placehold.co/96x96.png", email: "owner@hrgo.com", phoneNumber: "081234567897", gender: "Laki-laki", dateOfBirth: new Date("1975-01-01"), hireDate: new Date("2015-01-01"), leaveBalance: 0, role: 'owner', contractStartDate: new Date("2015-01-01"), contractEndDate: add(new Date(), { years: 10 }) },
];

const leaveRequests: LeaveRequest[] = [
    { id: 'L001', employeeId: 'E001', type: 'Cuti Tahunan', dates: { from: new Date('2024-04-10'), to: new Date('2024-04-12') }, reason: "Acara keluarga.", status: 'Disetujui' },
    { id: 'L002', employeeId: 'E001', type: 'Cuti Sakit', dates: { from: new Date('2024-05-20'), to: new Date('2024-05-20') }, reason: "Sakit demam.", status: 'Disetujui' },
    { id: 'L003', employeeId: 'E003', type: 'Cuti Tahunan', dates: { from: new Date('2024-06-01'), to: new Date('2024-06-01') }, reason: "Keperluan pribadi.", status: 'Ditolak' },
    { id: 'L004', employeeId: 'E001', type: 'Cuti Tahunan', dates: { from: add(new Date(), {days: 5}), to: add(new Date(), {days: 8}) }, reason: "Liburan.", status: 'Tertunda' },
    { id: 'L005', employeeId: 'E004', type: 'Cuti Sakit', dates: { from: add(new Date(), {days: 2}), to: add(new Date(), {days: 2}) }, reason: "Sakit demam dan perlu istirahat, surat dokter terlampir.", status: 'Tertunda' },
    { id: 'L006', employeeId: 'E005', type: 'Cuti Tahunan', dates: { from: new Date('2024-07-20'), to: new Date('2024-07-21') }, reason: "Acara keluarga.", status: 'Menunggu Persetujuan HRD' },
    { id: 'L007', employeeId: 'hrd-01', type: 'Cuti Tahunan', dates: { from: new Date('2024-08-01'), to: new Date('2024-08-03') }, reason: "Keperluan pribadi.", status: 'Menunggu Persetujuan Owner' },
];

const resignationRequests: ResignationRequest[] = [
    {
        id: 1,
        employeeId: "E004",
        lastDay: "30 September 2024",
        reason: "Menerima tawaran pekerjaan di perusahaan lain yang lebih dekat dengan domisili.",
        status: "Tertunda"
    },
     {
        id: 2,
        employeeId: "E003",
        lastDay: "31 Oktober 2024",
        reason: "Melanjutkan pendidikan ke jenjang yang lebih tinggi.",
        status: "Menunggu Persetujuan HRD"
    },
    {
        id: 3,
        employeeId: "E002",
        lastDay: "30 November 2024",
        reason: "Pindah domisili ke luar kota mengikuti pasangan.",
        status: "Menunggu Persetujuan Owner"
    }
]

const feedbackData: Feedback[] = [
  { id: 1, content: "Saran untuk mengadakan acara outing tahunan untuk mempererat kebersamaan tim. Mungkin bisa ke daerah puncak atau pantai.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: 2, content: "Perlu ada perbaikan pada sistem pendingin ruangan di lantai 2, seringkali terasa panas di siang hari.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
  { id: 3, content: "Program mentoring untuk karyawan baru sangat membantu, mungkin bisa diperluas cakupannya tidak hanya untuk 3 bulan pertama.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
  { id: 4, content: "Saya mengusulkan agar ada opsi kerja remote beberapa hari dalam sebulan untuk meningkatkan work-life balance.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
];

const kpiHistory: Kpi[] = [
    // John Doe (E001) - Stable
    { employeeId: "E001", quarter: "Q1 2024", score: 85, finalizedBy: "Amanda Lee" },
    { employeeId: "E001", quarter: "Q2 2024", score: 88, finalizedBy: "Amanda Lee" },
    // Jane Smith (E002) - Improving
    { employeeId: "E002", quarter: "Q1 2024", score: 85, finalizedBy: "Amanda Lee" },
    { employeeId: "E002", quarter: "Q2 2024", score: 90, finalizedBy: "Amanda Lee" },
    // Alice Johnson (E003) - High Performer
    { employeeId: "E003", quarter: "Q1 2024", score: 92, finalizedBy: "Amanda Lee" },
    { employeeId: "E003", quarter: "Q2 2024", score: 95, finalizedBy: "Amanda Lee" },
    // Bob Williams (E004) - Decreasing
    { employeeId: "E004", quarter: "Q1 2024", score: 88, finalizedBy: "Amanda Lee" },
    { employeeId: "E004", quarter: "Q2 2024", score: 78, finalizedBy: "Amanda Lee" },
    // Charlie Brown (E005) - Fluctuating
    { employeeId: "E005", quarter: "Q1 2024", score: 82, finalizedBy: "Amanda Lee" },
    { employeeId: "E005", quarter: "Q2 2024", score: 85, finalizedBy: "Amanda Lee" },
    // David Smith (E006)
    { employeeId: "E006", quarter: "Q1 2024", score: 80, finalizedBy: "Amanda Lee" },
    { employeeId: "E006", quarter: "Q2 2024", score: 84, finalizedBy: "Amanda Lee" },
    // Robert Davis (E007)
    { employeeId: "E007", quarter: "Q1 2024", score: 90, finalizedBy: "Amanda Lee" },
    { employeeId: "E007", quarter: "Q2 2024", score: 91, finalizedBy: "Amanda Lee" },
];

const announcements: Announcement[] = [
    {
        id: 'annc-1',
        title: 'Pembaruan Kebijakan Cuti',
        content: 'Harap perhatikan bahwa kebijakan cuti tahunan telah diperbarui. Silakan tinjau dokumen kebijakan baru di portal karyawan untuk detail selengkapnya.',
        date: new Date('2024-07-20T10:00:00'),
        type: 'Informasi Umum'
    },
    {
        id: 'annc-2',
        title: 'Jadwal Libur Idul Adha',
        content: 'Kantor akan libur pada tanggal 17-18 Juni 2024 untuk merayakan Idul Adha. Aktivitas akan kembali normal pada 19 Juni 2024. Selamat merayakan bersama keluarga!',
        date: new Date('2024-06-10T15:30:00'),
        type: 'Acara Perusahaan'
    },
    {
        id: 'annc-3',
        title: 'Selamat Ulang Tahun!',
        content: 'Selamat ulang tahun untuk John Doe (25 Juli) dan Jane Smith (28 Juli)! Semoga panjang umur dan sehat selalu.',
        date: new Date('2024-07-25T09:00:00'),
        type: 'Ulang Tahun'
    },
];

const kpiAssessments: KpiAssessment[] = [];


let db = {
    employees,
    leaveRequests,
    resignationRequests,
    feedbackData,
    kpiHistory,
    announcements,
    kpiAssessments,
}

export const getDb = () => db;

export const updateDb = (newDb: Partial<typeof db>) => {
    db = { ...db, ...newDb };
}

    