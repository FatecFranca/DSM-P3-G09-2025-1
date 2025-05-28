document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const form = document.getElementById('form-atividade');
    const addBtn = document.querySelector('.add-btn');
    const atividadesList = document.querySelector('.atividades');
    const cancelarBtn = document.querySelector('.btn-cancelar');

    let atividades = [];
    let editandoIndex = null; // null quando for nova atividade

    // Abrir formulário para nova atividade
    addBtn.addEventListener('click', () => {
        editandoIndex = null;
        form.reset();
        formContainer.style.display = 'flex';
    });

    // Cancelar
    cancelarBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
        form.reset();
        editandoIndex = null;
    });

    // Enviar formulário
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const descricao = document.getElementById('descricao').value;
        const data = new Date(document.getElementById('data').value);
        const usuario = document.getElementById('usuario').value;
        const anexo = document.getElementById('anexo').files[0];

        const atividade = {
            descricao,
            data,
            usuario,
            anexoURL: anexo ? URL.createObjectURL(anexo) : (editandoIndex !== null ? atividades[editandoIndex].anexoURL : null)
        };

        if (editandoIndex !== null) {
            atividades[editandoIndex] = atividade;
        } else {
            atividades.push(atividade);
        }

        atividades.sort((a, b) => b.data - a.data);
        renderAtividades();
        form.reset();
        formContainer.style.display = 'none';
        editandoIndex = null;
    });

    function renderAtividades() {
        atividadesList.innerHTML = '';
        atividades.forEach((atv, index) => {
            const li = document.createElement('li');
            const dataFormatada = atv.data.toLocaleString('pt-BR');

            li.innerHTML = `
                <div class="descricao">
                    <strong>${atv.descricao}</strong>
                    <button class="editar" data-index="${index}">✏️</button>
                    <p class="detalhes">${dataFormatada}<br>Por: ${atv.usuario}</p>
                </div>
                ${atv.anexoURL ? `<a href="${atv.anexoURL}" class="download" download>⬇️</a>` : ''}
            `;

            // Evento de edição
            li.querySelector('.editar').addEventListener('click', () => {
                editandoIndex = index;
                document.getElementById('descricao').value = atv.descricao;
                document.getElementById('data').value = atv.data.toISOString().slice(0, 16);
                document.getElementById('usuario').value = atv.usuario;
                formContainer.style.display = 'flex';
            });

            atividadesList.appendChild(li);
        });
    }
});
