export function formatDateBR(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    return `${day} de ${months[date.getMonth()]} (${weekdays[date.getDay()]})`;
}

export function isWorkingToday(employee, targetDateStr) {
    if (employee.manualOffDates?.includes(targetDateStr)) return false;

    const start = new Date(employee.inicioCiclo + 'T00:00:00');
    const target = new Date(targetDateStr + 'T00:00:00');
    const diffTime = target - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return false;

    switch (employee.escala) {
        case '12x36':
            return diffDays % 2 === 0;
        case '5x1':
            return (diffDays % 6) < 5;
        case '6x1':
            return (diffDays % 7) < 6;
        default:
            return true;
    }
}

export function generateWhatsAppMessage(date, employees, roles) {
    const dateTitle = formatDateBR(date);
    let msg = `📅 *ESCALA DE TRABALHO - ${dateTitle.toUpperCase()}*\n\n`;

    const working = employees.filter(e => isWorkingToday(e, date));
    const off = employees.filter(e => !isWorkingToday(e, date));

    roles.forEach(role => {
        const members = working.filter(e => e.cargo === role).sort((a, b) => a.order - b.order);
        if (members.length > 0) {
            msg += `🔹 *${role.toUpperCase()}*\n`;
            members.forEach(m => {
                const plantonista = m.isPlantonista ? ' (PLANTONISTA)' : '';
                const obs = m.obs ? ` - _${m.obs}_` : '';
                msg += `• ${m.nome} [${m.entrada}-${m.saida}]${plantonista}${obs}\n`;
            });
            msg += `\n`;
        }
    });


    const unassigned = working.filter(e => !roles.includes(e.cargo));
    if (unassigned.length > 0) {
        msg += `🔸 *OUTROS / SEM SETOR*\n`;
        unassigned.forEach(m => {
            msg += `• ${m.nome} [${m.entrada}-${m.saida}]\n`;
        });
        msg += `\n`;
    }

    if (off.length > 0) {
        msg += `😴 *FOLGAS DO DIA*\n`;
        msg += off.map(m => m.nome).join(', ') + `\n`;
    }

    return msg.trim();
}
