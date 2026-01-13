const EMPLOYEES_KEY = 'escala_pro_employees_v2';
const ROLES_KEY = 'escala_pro_roles_v2';

const defaultRoles = ['Liderança', 'CFTV', 'Orientadores', 'Bolsão de Moto', 'Operacional'];

const defaultEmployees = [
    { id: 'r1', nome: 'Ricardo', cargo: 'Liderança', escala: '12x36', inicioCiclo: '2026-01-13', entrada: '19:00', saida: '07:00', obs: '', isPlantonista: false, order: 0, manualOffDates: [] },
    { id: 'a1', nome: 'Anderson', cargo: 'CFTV', escala: '12x36', inicioCiclo: '2026-01-13', entrada: '19:00', saida: '07:00', obs: '', isPlantonista: false, order: 0, manualOffDates: [] },
    { id: 'o1', nome: 'Alisson', cargo: 'Orientadores', escala: '12x36', inicioCiclo: '2026-01-13', entrada: '18:00', saida: '06:00', obs: '', isPlantonista: false, order: 0, manualOffDates: [] },
    { id: 'o2', nome: 'Ademir', cargo: 'Orientadores', escala: '12x36', inicioCiclo: '2026-01-13', entrada: '18:00', saida: '06:00', obs: '', isPlantonista: false, order: 1, manualOffDates: [] },
    { id: 'o3', nome: 'Marcio', cargo: 'Orientadores', escala: '12x36', inicioCiclo: '2026-01-13', entrada: '18:00', saida: '06:00', obs: '', isPlantonista: false, order: 2, manualOffDates: [] },
    { id: 'o4', nome: 'Mariele', cargo: 'Orientadores', escala: '12x36', inicioCiclo: '2026-01-13', entrada: '18:00', saida: '06:00', obs: '', isPlantonista: false, order: 3, manualOffDates: [] },
    { id: 'b1', nome: 'Adriano', cargo: 'Bolsão de Moto', escala: '12x36', inicioCiclo: '2026-01-13', entrada: '19:00', saida: '07:00', obs: '', isPlantonista: false, order: 0, manualOffDates: [] },
    { id: 'f1', nome: 'Alexandro', cargo: 'Operacional', escala: '12x36', inicioCiclo: '2026-01-12', entrada: '19:00', saida: '07:00', obs: 'Folguista', isPlantonista: false, order: 0, manualOffDates: [] }
];

export function getEmployees() {
    const data = localStorage.getItem(EMPLOYEES_KEY);
    return data ? JSON.parse(data) : defaultEmployees;
}

export function saveEmployees(employees) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

export function getRoles() {
    const data = localStorage.getItem(ROLES_KEY);
    return data ? JSON.parse(data) : defaultRoles;
}

export function saveRoles(roles) {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

export function clearAllData() {
    localStorage.removeItem(EMPLOYEES_KEY);
    localStorage.removeItem(ROLES_KEY);
}

export function getBackupData() {
    return {
        employees: getEmployees(),
        roles: getRoles(),
        exportDate: new Date().toISOString(),
        version: '2.2'
    };
}

export function applyBackupData(data) {
    if (data && data.employees && data.roles) {
        saveEmployees(data.employees);
        saveRoles(data.roles);
        return true;
    }
    return false;
}
