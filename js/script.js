// script.js

/* ==========================================
   FUNÇÃO DE CONTADORES DINÂMICOS
   ========================================== */
   function atualizarContadores() {
    const qtdNovos = document.getElementById('col-novos').querySelectorAll('.kanban-card').length;
    const qtdOrcamento = document.getElementById('col-orcamento').querySelectorAll('.kanban-card').length;
    const qtdAndamento = document.getElementById('col-andamento').querySelectorAll('.kanban-card').length;
    const qtdConcluido = document.getElementById('col-concluido').querySelectorAll('.kanban-card').length;

    document.getElementById('contador-novos').innerText = qtdNovos;
    document.getElementById('contador-orcamento').innerText = qtdOrcamento;
    document.getElementById('contador-andamento').innerText = qtdAndamento;
    document.getElementById('contador-concluido').innerText = qtdConcluido;
}

document.addEventListener('DOMContentLoaded', atualizarContadores);

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
        
        // Matriz com todas as cores para podermos limpar a cor anterior
        const cores = ['border-secondary', 'border-warning', 'border-primary', 'border-success'];
        
        // Lógica de segurança para a coluna final "Retirada (Concluído)"
        if (colunaDestino.id === 'col-concluido' && origemId !== 'col-concluido') {
            const badgeText = cardArrastado.querySelector('.badge').innerText;
            
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
                    // Remove cor anterior e aplica a cor verde (Success)
                    cardArrastado.classList.remove(...cores);
                    cardArrastado.classList.add('border-success');
                    
                    // Move o cartão e atualiza os contadores
                    colunaDestino.appendChild(cardArrastado);
                    atualizarContadores();
                    
                    Swal.fire(
                        'Notificado!',
                        'O cliente recebeu a mensagem e o veículo está pronto para retirada.',
                        'success'
                    );
                }
                // Se o utilizador clicar em cancelar, o código simplesmente ignora e o cartão fica onde estava com a cor original!
            });
            
        } else {
            // Se foi largado em qualquer outra coluna (muda imediatamente)
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
    const problema = document.getElementById('modalProblema').value;

    if(!nome || !modelo || !problema) {
        Swal.fire({
            icon: 'error',
            title: 'Atenção!',
            text: 'Por favor, preencha todos os dados obrigatórios do cliente e do veículo.'
        });
        return;
    }

    // Cartão já nasce com a cor border-secondary
    const novoCardHTML = `
        <div class="card kanban-card shadow-sm border-0 border-start border-secondary border-4 mt-2" draggable="true" ondragstart="arrastar(event)" id="card-${proximaOS}">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between mb-2">
                    <span class="badge bg-light text-secondary border border-secondary fw-semibold">OS #${proximaOS}</span>
                    <small class="text-muted"><i class="bi bi-clock me-1"></i>Agora mesmo</small>
                </div>
                <h6 class="card-title fw-bold mb-1">${modelo} (${ano})</h6>
                <p class="card-text text-muted small mb-2"><i class="bi bi-person me-1"></i>${nome}</p>
                <div class="alert alert-danger py-1 px-2 small mb-2 border-0">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i>${problema}
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

    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Pedido registado e gerado na Triagem!',
        showConfirmButton: false,
        timer: 2000
    });
}