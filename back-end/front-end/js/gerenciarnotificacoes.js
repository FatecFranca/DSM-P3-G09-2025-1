const notifications = [
  "📌 Atualização: Seu projeto 'Organização de Estudos' foi compartilhado com João.",
  "🛠️ A tarefa 'Revisar resumo de biologia' venceu ontem.",
  "📅 Evento: 'Apresentação de TCC' marcado para sexta-feira às 10h.",
  "🎯 Meta atingida! Você concluiu 100% das tarefas da semana.",
  "🔔 Lembrete: Entregar relatório de estágio amanhã.",
  "📥 Nova atividade em 'Planejamento de viagem': \"Adicionei novas sugestões.\""
];

const notificationList = document.getElementById("notificationList");

notifications.forEach((text, index) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <input type="checkbox" class="notification-checkbox" data-index="${index}" />
    <p>${text}</p>
  `;
  notificationList.appendChild(li);
});

document.getElementById("selectAll").addEventListener("change", function () {
  const checkboxes = document.querySelectorAll(".notification-checkbox");
  checkboxes.forEach(cb => cb.checked = this.checked);
});

document.getElementById("deleteSelected").addEventListener("click", function () {
  const checkboxes = document.querySelectorAll(".notification-checkbox:checked");
  checkboxes.forEach(cb => cb.closest("li").remove());
});
