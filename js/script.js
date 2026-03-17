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

    document.getElementById('contador-novos').innerText = qtdNovos;
    document.getElementById('contador-orcamento').innerText = qtdOrcamento;
    document.getElementById('contador-andamento').innerText = qtdAndamento;
    document.getElementById('contador-concluido').innerText = qtdConcluido;

    const caixaVazia = colunaConcluido.querySelector('.empty-state');
    if (caixaVazia) {
        if (qtdConcluido > 0) {
            caixaVazia.classList.add('d-none');
        } else {
            caixaVazia.classList.remove('d-none');
        }
    }
}

/* ==========================================
   INICIALIZAÇÃO E BARRA DE PESQUISA
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    atualizarContadores();

    const inputBusca = document.getElementById('inputBusca');
    if (inputBusca) {
        inputBusca.addEventListener('input', function() {
            const termo = this.value.toLowerCase();
            const cartoes = document.querySelectorAll('.kanban-card');

            cartoes.forEach(cartao => {
                const textoCartao = cartao.innerText.toLowerCase();
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
   FUNÇÃO DE DELETAR CARTÃO
   ========================================== */
function deletarCard(elementoIcone) {
    const cartao = elementoIcone.closest('.kanban-card');
    let badgeText = "esta OS";
    const badgeElement = cartao.querySelector('.badge');
    
    if (badgeElement) {
        badgeText = badgeElement.innerText;
    }

    Swal.fire({
        title: 'Excluir Serviço?',
        text: `Tem certeza que deseja apagar ${badgeText}? Esta ação não pode ser desfeita.`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-trash"></i> Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            cartao.remove();
            atualizarContadores();
            
            Swal.fire({
                icon: 'success',
                title: 'Excluído!',
                text: 'O cartão foi removido com sucesso.',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}

/* ==========================================
   FUNÇÕES DO MODAL (NOVO PEDIDO BALCÃO)
   ========================================== */
let proximaOS = 1001; // <--- Começamos a contar do 1001 agora!

function toggleDescricaoOutro() {
    const selectServico = document.getElementById('modalTipoServico').value;
    const divDescricao = document.getElementById('divProblemaOutro');
    
    if (selectServico === 'Outro') {
        divDescricao.classList.remove('d-none');
    } else {
        divDescricao.classList.add('d-none');
    }
}

function salvarPedidoManual() {
    const nome = document.getElementById('modalNome').value;
    const modelo = document.getElementById('modalModelo').value;
    const ano = document.getElementById('modalAno').value;
    const placa = document.getElementById('modalPlaca').value;
    const tipoServico = document.getElementById('modalTipoServico').value;
    let problemaFinal = "";

    if(!nome || !modelo || !placa || !tipoServico) {
        Swal.fire({
            icon: 'error',
            title: 'Atenção!',
            text: 'Por favor, preencha todos os dados obrigatórios do cliente, veículo e serviço.'
        });
        return;
    }

    if (tipoServico === 'Outro') {
        const descricaoOutro = document.getElementById('modalProblema').value;
        if (!descricaoOutro.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Atenção!',
                text: 'Você selecionou "Outro". Por favor, descreva o problema no campo de texto.'
            });
            return;
        }
        problemaFinal = descricaoOutro;
    } else {
        problemaFinal = tipoServico;
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
                    <div>
                        <small class="text-muted me-2"><i class="bi bi-clock me-1"></i>${dataHoraFormatada}</small>
                        <i class="bi bi-trash text-danger" style="cursor: pointer;" onclick="deletarCard(this)" title="Excluir OS"></i>
                    </div>
                </div>
                <h6 class="card-title fw-bold mb-1 text-truncate">${modelo} (${ano})</h6>
                <p class="card-text text-muted small mb-2"><i class="bi bi-person me-1"></i>${nome}</p>
                
                <div class="bg-light rounded p-2 mb-3 small text-secondary border">
                    <i class="bi bi-tools me-1"></i>${problemaFinal}
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
    document.getElementById('divProblemaOutro').classList.add('d-none');

    atualizarContadores();

    Swal.fire({
        icon: 'success',
        title: 'Pedido registrado com sucesso!',
        showConfirmButton: false,
        timer: 2000
    });
}