import { isWorkingToday, formatDateBR, generateWhatsAppMessage } from './utils.js';
import { saveEmployees, getEmployees, saveRoles, getRoles, clearAllData, getBackupData, applyBackupData } from './data.js';

let currentEmployees = [];
let currentRoles = [];
let currentDate = '';

const empModal = document.getElementById('employeeModal');
const rolesModal = document.getElementById('rolesModal');
const board = document.getElementById('scaleBoard');
const folgaContainer = document.getElementById('folgaContainer');
const overlay = document.getElementById('drawerOverlay');
const sidebar = document.getElementById('mainSidebar');

export function initUI() {
    currentEmployees = getEmployees();
    currentRoles = getRoles();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    currentDate = tomorrow.toISOString().split('T')[0];

    document.getElementById('dateSelector').value = currentDate;

    render();
    setupEventListeners();
    setupMobileMenu();
}

function setupMobileMenu() {
    const open = () => { sidebar.classList.add('active'); overlay.classList.add('active'); overlay.classList.remove('hidden'); };
    const hide = () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); setTimeout(() => overlay.classList.add('hidden'), 300); };
    document.getElementById('mobileMenuToggle').addEventListener('click', open);
    overlay.addEventListener('click', hide);
}

function render() {
    document.getElementById('currentDisplayDate').innerText = formatDateBR(currentDate);

    const cargoSelect = document.getElementById('empCargo');
    cargoSelect.innerHTML = currentRoles.map(r => `<option value="${r}">${r}</option>`).join('') + `<option value="Sem Cargo">Banco de Talentos</option>`;

    const working = currentEmployees.filter(e => isWorkingToday(e, currentDate));
    const off = currentEmployees.filter(e => !isWorkingToday(e, currentDate));
    
    board.innerHTML = '';

    currentRoles.forEach(cat => {
        const catMembers = working.filter(e => e.cargo === cat).sort((a, b) => a.order - b.order);
        renderColumn(cat, catMembers);
    });

    const talentPoolMembers = working.filter(e => !currentRoles.includes(e.cargo));
    if (talentPoolMembers.length > 0) {
        renderColumn('Banco de Talentos', talentPoolMembers, true);
    }

    folgaContainer.innerHTML = off.map(m => createOffCard(m)).join('');
    initSortable(folgaContainer);

    lucide.createIcons();
}

function renderColumn(cat, members, isTalentPool = false) {
    const column = document.createElement('div');
    column.className = 'flex flex-col gap-5';
    column.innerHTML = `
        <div class="flex items-center justify-between px-2">
            <h3 class="text-[11px] font-black ${isTalentPool ? 'text-indigo-400' : 'text-slate-400'} uppercase tracking-[0.2em]">${cat}</h3>
            <span class="text-xs font-black bg-slate-200 text-slate-600 px-3 py-1 rounded-full shadow-sm">${members.length}</span>
        </div>
        <div class="category-zone flex flex-col gap-4 min-h-[140px] p-2 bg-slate-50/50 rounded-3xl border-2 border-transparent" data-category="${cat}">
            ${members.map(m => createEmployeeCard(m)).join('')}
        </div>
    `;
    board.appendChild(column);
    initSortable(column.querySelector('.category-zone'));
}

function createEmployeeCard(emp) {
    const statusColor = emp.isPlantonista ? 'bg-orange-500' : 'bg-emerald-500';
    const borderClass = emp.isPlantonista ? 'border-orange-200 bg-orange-50/20' : 'border-slate-200';
    return `
        <div class="employee-card group relative bg-white p-5 rounded-3xl border-2 ${borderClass} shadow-sm cursor-grab active:cursor-grabbing" data-id="${emp.id}">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1.5">
                        <span class="w-2.5 h-2.5 rounded-full ${statusColor} shadow-sm animate-pulse"></span>
                        <h4 class="font-black text-slate-800 leading-tight">${emp.nome}</h4>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wide">
                        <span class="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">${emp.escala}</span>
                        <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${emp.entrada} — ${emp.saida}</span>
                    </div>
                </div>
                <button onclick="window.editEmployee('${emp.id}')" class="touch-target -mr-2 -mt-2 p-2 text-slate-300 hover:text-blue-600 rounded-xl transition-colors">
                    <i data-lucide="more-vertical" class="w-5 h-5"></i>
                </button>
            </div>
            ${emp.obs ? `<div class="mt-4 text-[11px] font-semibold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 flex items-center gap-2 leading-relaxed"><i data-lucide="info" class="w-3 h-3 text-blue-500"></i> ${emp.obs}</div>` : ''}
            ${emp.isPlantonista ? `<div class="absolute -top-3 -right-2 bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg border-2 border-white uppercase tracking-widest">Plantão</div>` : ''}
        </div>
    `;
}

function createOffCard(m) {
    const isManual = m.manualOffDates?.includes(currentDate);
    return `
        <div class="employee-card p-5 bg-white border-2 ${isManual ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200'} rounded-3xl flex flex-col gap-3 cursor-grab shadow-sm" data-id="${m.id}">
            <div class="flex justify-between items-center">
                <span class="font-black text-slate-800 text-sm truncate">${m.nome}</span>
                <button onclick="window.editEmployee('${m.id}')" class="p-1.5 text-slate-300 hover:text-blue-500 transition-colors"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
            </div>
            <div class="flex items-center justify-between">
                 <span class="text-[9px] text-slate-400 uppercase font-black bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">${m.cargo}</span>
                 ${isManual ? '<span class="text-[8px] bg-indigo-600 text-white px-2 py-1 rounded-lg font-black tracking-tighter">ALTERADO</span>' : ''}
            </div>
        </div>
    `;
}

function initSortable(el) {
    if (!el) return;
    new Sortable(el, {
        group: 'shared_escala',
        animation: 300,
        delay: 50,
        delayOnTouchOnly: true,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onStart: (evt) => { 
            if (window.navigator.vibrate) window.navigator.vibrate(12);
            document.querySelectorAll('.category-zone, #folgaContainer').forEach(z => z.classList.add('ring-4', 'ring-blue-50', 'ring-dashed'));
        },
        onEnd: (evt) => { 
            document.querySelectorAll('.category-zone, #folgaContainer').forEach(z => z.classList.remove('ring-4', 'ring-blue-50', 'ring-dashed'));
            handleDragChange(evt); 
        }
    });
}

function handleDragChange(evt) {
    const id = evt.item.dataset.id;
    const toFolga = evt.to.id === 'folgaContainer';
    const toCategory = evt.to.dataset.category;
    
    const empIdx = currentEmployees.findIndex(e => e.id === id);
    if (empIdx === -1) return;

    const emp = currentEmployees[empIdx];

    if (toFolga) {
        if (!emp.manualOffDates) emp.manualOffDates = [];
        if (!emp.manualOffDates.includes(currentDate)) {
            emp.manualOffDates.push(currentDate);
        }
    } else if (toCategory) {
        emp.cargo = toCategory;
        if (emp.manualOffDates) {
            emp.manualOffDates = emp.manualOffDates.filter(d => d !== currentDate);
        }
    }

    document.querySelectorAll('.category-zone').forEach(zone => {
        Array.from(zone.children).forEach((child, idx) => {
            const e = currentEmployees.find(item => item.id === child.dataset.id);
            if (e) e.order = idx;
        });
    });

    saveEmployees(currentEmployees);
    render();
}

function setupEventListeners() {
    document.getElementById('dateSelector').addEventListener('change', (e) => {
        currentDate = e.target.value;
        render();
        if (overlay.classList.contains('active')) overlay.click();
    });

    document.getElementById('addEmployeeBtn').addEventListener('click', () => {
        document.getElementById('employeeForm').reset();
        document.getElementById('empId').value = '';
        document.getElementById('empCiclo').value = currentDate;
        document.getElementById('modalTitle').innerText = 'Novo Colaborador';
        document.getElementById('deleteEmployeeBtn').classList.add('hidden');
        empModal.classList.add('active');
        if (overlay.classList.contains('active')) overlay.click();
    });

    document.getElementById('manageRolesBtn').addEventListener('click', () => {
        renderRolesList();
        rolesModal.classList.add('active');
        if (overlay.classList.contains('active')) overlay.click();
    });

    document.getElementById('addRoleBtn').addEventListener('click', () => {
        const input = document.getElementById('newRoleInput');
        const role = input.value.trim();
        if (role && !currentRoles.includes(role)) {
            currentRoles.push(role);
            saveRoles(currentRoles);
            input.value = '';
            renderRolesList();
            render();
        }
    });

    const copyWA = () => {
        const message = generateWhatsAppMessage(currentDate, currentEmployees, currentRoles);
        navigator.clipboard.writeText(message).then(() => {
            const t = document.getElementById('toast');
            t.style.opacity = '1';
            t.style.pointerEvents = 'auto';
            setTimeout(() => {
                t.style.opacity = '0';
                t.style.pointerEvents = 'none';
            }, 2000);
        });
    };
    document.getElementById('copyWhatsAppBtn').addEventListener('click', copyWA);
    document.getElementById('copyWhatsAppBtnMobile').addEventListener('click', copyWA);

    document.getElementById('employeeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('empId').value || Math.random().toString(36).substr(2, 9);
        const idx = currentEmployees.findIndex(emp => emp.id === id);
        
        const data = {
            id,
            nome: document.getElementById('empNome').value,
            cargo: document.getElementById('empCargo').value,
            escala: document.getElementById('empEscala').value,
            inicioCiclo: document.getElementById('empCiclo').value,
            entrada: document.getElementById('empEntrada').value,
            saida: document.getElementById('empSaida').value,
            obs: document.getElementById('empObs').value,
            isPlantonista: document.getElementById('empPlantonista').checked,
            manualOffDates: idx !== -1 ? currentEmployees[idx].manualOffDates : [],
            order: idx !== -1 ? currentEmployees[idx].order : currentEmployees.length
        };

        if (idx !== -1) currentEmployees[idx] = data; else currentEmployees.push(data);
        saveEmployees(currentEmployees);
        render();
        empModal.classList.remove('active');
    });

    document.getElementById('deleteEmployeeBtn').addEventListener('click', () => {
        if (confirm('Deseja remover este colaborador permanentemente?')) {
            currentEmployees = currentEmployees.filter(e => e.id !== document.getElementById('empId').value);
            saveEmployees(currentEmployees);
            render();
            empModal.classList.remove('active');
        }
    });

    document.querySelectorAll('.closeModal').forEach(b => b.addEventListener('click', () => empModal.classList.remove('active')));
    document.querySelectorAll('.closeRolesModal').forEach(b => b.addEventListener('click', () => rolesModal.classList.remove('active')));

    document.getElementById('resetDataBtn').addEventListener('click', () => {
        if(confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os colaboradores e cargos configurados. Deseja continuar?')) {
            clearAllData();
            window.location.reload();
        }
    });

    document.getElementById('exportBackupBtn').addEventListener('click', () => {
        const data = getBackupData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `escala_pro_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    const fileInput = document.getElementById('importFileInput');
    document.getElementById('importBackupBtn').addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (applyBackupData(data)) {
                    alert('Backup restaurado com sucesso! Recarregando sistema...');
                    window.location.reload();
                } else {
                    alert('Erro: O arquivo de backup parece estar corrompido ou é inválido.');
                }
            } catch (err) {
                alert('Erro ao processar arquivo: Verifique se selecionou um arquivo JSON de backup válido.');
            }
        };
        reader.readAsText(file);
        fileInput.value = '';
    });

    window.editEmployee = (id) => {
        const emp = currentEmployees.find(e => e.id === id);
        if (!emp) return;
        document.getElementById('empId').value = emp.id;
        document.getElementById('empNome').value = emp.nome;
        document.getElementById('empCargo').value = emp.cargo;
        document.getElementById('empEscala').value = emp.escala;
        document.getElementById('empCiclo').value = emp.inicioCiclo;
        document.getElementById('empEntrada').value = emp.entrada || '';
        document.getElementById('empSaida').value = emp.saida || '';
        document.getElementById('empObs').value = emp.obs || '';
        document.getElementById('empPlantonista').checked = emp.isPlantonista;
        document.getElementById('modalTitle').innerText = 'Perfil do Colaborador';
        document.getElementById('deleteEmployeeBtn').classList.remove('hidden');
        empModal.classList.add('active');
    };
}

function renderRolesList() {
    const list = document.getElementById('rolesList');
    list.innerHTML = currentRoles.map(role => `
        <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors">
            <span class="font-bold text-slate-700 text-sm">${role}</span>
            <button onclick="window.removeRole('${role}')" class="p-2 text-slate-300 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
    `).join('');
    lucide.createIcons();
}

window.removeRole = (role) => {
    if (confirm(`Remover cargo "${role}"? Os colaboradores vinculados serão movidos para o Banco de Talentos.`)) {
        currentRoles = currentRoles.filter(r => r !== role);
        saveRoles(currentRoles);
        renderRolesList();
        render();
    }
};
