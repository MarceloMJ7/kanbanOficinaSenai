// script.js

/* ==========================================
   FUNÇÃO DE CONTADORES DINÂMICOS E EMPTY STATE
   ========================================== */
   function atualizarContadores() {
    const colunaNovos = document.getElementById('col-novos');
    const colunaOrcamento = document.getElementById('col-orcamento');
    const colunaAndamento = document.getElementById('col-andamento');
    const colunaConcluido = document.getElementById('col-concluido');

    const qtdNovos = colunaNovos.querySelectorAll('.kanban-card').length;
    const qtdOrcamento = colunaOrcamento.querySelectorAll('.kanban-card').length;
    const qtdAndamento = colunaAndamento.querySelectorAll('.kanban-card').length;
    const qtdConcluido = colunaConcluido.querySelectorAll('.kanban-card').length;

    // Atualiza os números nas bolinhas do cabeçalho
    document.getElementById('contador-novos').innerText = qtdNovos;
    document.getElementById('contador-orcamento').innerText = qtdOrcamento;
    document.getElementById('contador-andamento').innerText = qtdAndamento;
    document.getElementById('contador-concluido').innerText = qtdConcluido;

    // Esconder/Mostrar a caixa tracejada da coluna Retirada
    const caixaVazia = colunaConcluido.querySelector('.empty-state');
    if (caixaVazia) {
        if (qtdConcluido > 0) {
            caixaVazia.classList.add('d-none'); // Esconde a caixa
        } else {
            caixaVazia.classList.remove('d-none'); // Mostra a caixa
        }
    }
}

/* ==========================================
   INICIALIZAÇÃO E BARRA DE PESQUISA
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Atualiza os contadores assim que a tela carrega
    atualizarContadores();

    // 2. Lógica da Barra de Pesquisa
    const inputBusca = document.getElementById('inputBusca');
    
    if (inputBusca) {
        inputBusca.addEventListener('input', function() {
            const termo = this.value.toLowerCase(); // Pega o texto e transforma em minúsculas
            const cartoes = document.querySelectorAll('.kanban-card');

            cartoes.forEach(cartao => {
                // Lê todo o texto visível dentro do cartão (Placa, Cliente, Modelo, OS)
                const textoCartao = cartao.innerText.toLowerCase();
                
                // Filtra os cartões
                if (textoCartao.includes(termo)) {
                    cartao.style.display = ''; 
                } else {
                    cartao.style.display = 'none'; 
                }
            });
        });
    }
});

/* ==========================================
   FUNÇÕES DE ARRASTAR E SOLTAR (DRAG & DROP)
   ========================================== */
function permitirSoltar(event) {
    event.preventDefault();
}

function arrastar(event) {
    event.dataTransfer.setData("text", event.target.id);
    const colunaOrigem = event.target.closest('.kanban-column');
    if (colunaOrigem) {
        event.dataTransfer.setData("origem", colunaOrigem.id);
    }
}

function soltar(event) {
    event.preventDefault();
    
    const data = event.dataTransfer.getData("text");
    const origemId = event.dataTransfer.getData("origem");
    const cardArrastado = document.getElementById(data);
    const colunaDestino = event.target.closest('.kanban-column');
    
    if (colunaDestino && cardArrastado) {
        
        const cores = ['border-secondary', 'border-warning', 'border-primary', 'border-success'];
        
        // Se largar na coluna Retirada (Concluído)
        if (colunaDestino.id === 'col-concluido' && origemId !== 'col-concluido') {
            
            let badgeText = "OS";
            const badgeElement = cardArrastado.querySelector('.badge');
            if (badgeElement) {
                badgeText = badgeElement.innerText;
            }
            
            Swal.fire({
                title: 'Finalizar Serviço?',
                text: `Deseja realmente finalizar a ${badgeText} e enviar uma notificação de WhatsApp para o cliente?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: '<i class="bi bi-check-circle"></i> Sim, finalizar!',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    cardArrastado.classList.remove(...cores);
                    cardArrastado.classList.add('border-success');
                    
                    colunaDestino.appendChild(cardArrastado);
                    atualizarContadores();
                    
                    Swal.fire(
                        'Notificado!',
                        'O cliente recebeu a mensagem e o veículo está pronto para retirada.',
                        'success'
                    );
                }
            });
            
        } else {
            // Se largar em outras colunas
            cardArrastado.classList.remove(...cores);
            
            if (colunaDestino.id === 'col-novos') {
                cardArrastado.classList.add('border-secondary');
            } else if (colunaDestino.id === 'col-orcamento') {
                cardArrastado.classList.add('border-warning');
            } else if (colunaDestino.id === 'col-andamento') {
                cardArrastado.classList.add('border-primary');
            } else if (colunaDestino.id === 'col-concluido') {
                cardArrastado.classList.add('border-success');
            }

            colunaDestino.appendChild(cardArrastado);
            atualizarContadores();
        }
    }
}

/* ==========================================
   FUNÇÃO DO MODAL (NOVO PEDIDO BALCÃO)
   ========================================== */
let proximaOS = 1044;

function salvarPedidoManual() {
    const nome = document.getElementById('modalNome').value;
    const modelo = document.getElementById('modalModelo').value;
    const ano = document.getElementById('modalAno').value;
    const placa = document.getElementById('modalPlaca').value;
    const problema = document.getElementById('modalProblema').value;

    if(!nome || !modelo || !problema || !placa) {
        Swal.fire({
            icon: 'error',
            title: 'Atenção!',
            text: 'Por favor, preencha todos os dados obrigatórios do cliente e do veículo.'
        });
        return;
    }

    const dataAtual = new Date();
    const dia = dataAtual.getDate().toString().padStart(2, '0');
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); 
    const anoAtual = dataAtual.getFullYear();
    const hora = dataAtual.getHours().toString().padStart(2, '0');
    const minuto = dataAtual.getMinutes().toString().padStart(2, '0');
    
    const dataHoraFormatada = `${dia}/${mes}/${anoAtual}, ${hora}:${minuto}`;

    const novoCardHTML = `
        <div class="card kanban-card shadow-sm border-0 border-start border-secondary border-4 mt-2" draggable="true" ondragstart="arrastar(event)" id="card-${proximaOS}">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge bg-light text-dark border border-secondary-subtle fw-semibold">OS #${proximaOS}</span>
                    <small class="text-muted"><i class="bi bi-clock me-1"></i>${dataHoraFormatada}</small>
                </div>
                <h6 class="card-title fw-bold mb-1 text-truncate">${modelo} (${ano})</h6>
                <p class="card-text text-muted small mb-2"><i class="bi bi-person me-1"></i>${nome}</p>
                
                <div class="bg-light rounded p-2 mb-3 small text-secondary border">
                    <i class="bi bi-tools me-1"></i>${problema}
                </div>
                
                <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                    <span class="badge bg-white text-dark border border-2 border-dark px-2 py-1" style="letter-spacing: 1px; font-family: monospace; font-size: 0.8rem;">
                        ${placa.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    `;

    const colunaNovos = document.getElementById('col-novos');
    colunaNovos.querySelector('.column-title').insertAdjacentHTML('afterend', novoCardHTML);

    proximaOS++;

    const modalElement = document.getElementById('modalNovoPedido');
    const modalInstancia = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstancia.hide();
    document.getElementById('formNovoPedidoModal').reset();

    atualizarContadores();

    // Alerta centralizado (sem a propriedade position: 'top-end')
    Swal.fire({
        icon: 'success',
        title: 'Pedido registrado com sucesso!',
        showConfirmButton: false,
        timer: 2000
    });
}